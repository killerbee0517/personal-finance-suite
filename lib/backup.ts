import { randomUUID } from "crypto";
import dayjs from "dayjs";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";
import { dbName, pool, sql } from "@/lib/db";
import { buildMetrics, repo } from "@/lib/services";

type BackupTableConfig = {
  table: string;
  sheet: string;
};

type FieldChange = {
  field: string;
  oldValue: string;
  newValue: string;
};

type RowChange = {
  type: "added" | "updated" | "deleted";
  id: number;
  fields: FieldChange[];
};

type TablePreview = {
  table: string;
  sheet: string;
  totalCurrent: number;
  totalIncoming: number;
  added: number;
  updated: number;
  deleted: number;
  rows: RowChange[];
};

export type BackupImportPreview = {
  id: string;
  createdAt: string;
  sourceFileName: string;
  summary: {
    tables: number;
    added: number;
    updated: number;
    deleted: number;
  };
  tables: TablePreview[];
  incoming: Record<string, Array<Record<string, unknown>>>;
};

const BACKUP_TABLES: BackupTableConfig[] = [
  { table: "fd_master", sheet: "FDs" },
  { table: "loan_master", sheet: "Loans" },
  { table: "fd_loan_link", sheet: "FDLoanLinks" },
  { table: "incentive_tracker", sheet: "Incentives" },
  { table: "rd_master", sheet: "RDs" },
  { table: "bond_master", sheet: "Bonds" },
  { table: "bond_coupon_schedule", sheet: "BondCoupons" },
  { table: "equity_holdings", sheet: "EquityHoldings" },
  { table: "equity_transactions", sheet: "EquityTransactions" },
  { table: "cas_import_runs", sheet: "CASImports" },
  { table: "epf_accounts", sheet: "EPF" },
  { table: "ppf_accounts", sheet: "PPF" },
  { table: "insurance_policies", sheet: "Insurance" },
  { table: "physical_assets", sheet: "PhysicalAssets" },
];

const APPLY_ORDER = BACKUP_TABLES.map((x) => x.table);
const PREVIEW_DIR = path.join(process.cwd(), "data", "import-previews");

function toSerializable(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return dayjs(value).format("YYYY-MM-DD");
  return String(value);
}

function normalizeDateLike(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const d = dayjs(String(value));
  if (!d.isValid()) return null;
  return d.format("YYYY-MM-DD");
}

function normalizeByMySqlType(value: unknown, mysqlType: string): unknown {
  if (value === undefined || value === "") return null;

  const type = mysqlType.toLowerCase();

  if (type.includes("date") || type.includes("time")) {
    return normalizeDateLike(value);
  }

  if (type.startsWith("tinyint(1)")) {
    const s = String(value).toLowerCase().trim();
    if (["1", "true", "yes", "y"].includes(s)) return 1;
    if (["0", "false", "no", "n"].includes(s)) return 0;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? 1 : 0;
  }

  if (type.includes("int")) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }

  if (type.includes("double") || type.includes("decimal") || type.includes("float")) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  return String(value);
}

async function getColumns(table: string) {
  return sql<{ Field: string; Type: string }>(
    `SELECT COLUMN_NAME AS Field, COLUMN_TYPE AS Type
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ?
     ORDER BY ORDINAL_POSITION`,
    [dbName, table],
  );
}

function normalizeRowForExport(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  Object.entries(row).forEach(([key, value]) => {
    if (value instanceof Date) {
      out[key] = dayjs(value).format("YYYY-MM-DD");
      return;
    }
    out[key] = value;
  });
  return out;
}

async function listTableRows(table: string) {
  const rows = await sql<Record<string, unknown>>(`SELECT * FROM \`${table}\` ORDER BY id ASC`);
  return rows.map(normalizeRowForExport);
}

function diffTable(
  table: string,
  sheet: string,
  currentRows: Array<Record<string, unknown>>,
  incomingRows: Array<Record<string, unknown>>,
) {
  const byIdCurrent = new Map<number, Record<string, unknown>>();
  currentRows.forEach((row) => {
    const id = Number(row.id);
    if (Number.isFinite(id)) byIdCurrent.set(id, row);
  });

  const byIdIncoming = new Map<number, Record<string, unknown>>();
  incomingRows.forEach((row) => {
    const id = Number(row.id);
    if (Number.isFinite(id)) byIdIncoming.set(id, row);
  });

  const rows: RowChange[] = [];

  for (const [id, incoming] of byIdIncoming.entries()) {
    const existing = byIdCurrent.get(id);
    if (!existing) {
      rows.push({ type: "added", id, fields: [] });
      continue;
    }

    const fields = Array.from(new Set([...Object.keys(existing), ...Object.keys(incoming)]))
      .filter((k) => k !== "id")
      .map((field) => {
        const oldRaw = existing[field];
        const newRaw = incoming[field];
        const oldValue = toSerializable(oldRaw);
        const newValue = toSerializable(newRaw);
        return { field, oldValue, newValue };
      })
      .filter((f) => f.oldValue !== f.newValue);

    if (fields.length > 0) {
      rows.push({ type: "updated", id, fields });
    }
  }

  for (const id of byIdCurrent.keys()) {
    if (!byIdIncoming.has(id)) {
      rows.push({ type: "deleted", id, fields: [] });
    }
  }

  return {
    table,
    sheet,
    totalCurrent: currentRows.length,
    totalIncoming: incomingRows.length,
    added: rows.filter((x) => x.type === "added").length,
    updated: rows.filter((x) => x.type === "updated").length,
    deleted: rows.filter((x) => x.type === "deleted").length,
    rows,
  } satisfies TablePreview;
}

function getSheetRows(workbook: XLSX.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [] as Array<Record<string, unknown>>;
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null, raw: false });
}

async function normalizeIncomingRows(table: string, rows: Array<Record<string, unknown>>) {
  const cols = await getColumns(table);
  const colByName = new Map(cols.map((c) => [c.Field, c.Type]));

  return rows
    .map((row) => {
      const out: Record<string, unknown> = {};
      for (const col of cols) {
        const raw = row[col.Field];
        out[col.Field] = normalizeByMySqlType(raw, col.Type);
      }
      return out;
    })
    .filter((row) => Number.isFinite(Number(row.id)));
}

async function ensurePreviewDir() {
  await mkdir(PREVIEW_DIR, { recursive: true });
}

export async function buildBackupWorkbookBuffer() {
  const wb = XLSX.utils.book_new();

  const [fds, loans, links, incentives, rds, bonds, coupons, holdings, epfAccounts, ppfAccounts, insurancePolicies, physicalAssets] = await Promise.all([
    repo.listFDs(),
    repo.listLoans(),
    repo.listLinks(),
    repo.listIncentives(),
    repo.listRDs(),
    repo.listBonds(),
    repo.listBondCoupons(),
    repo.listEquityHoldings(),
    repo.listEPFAccounts(),
    repo.listPPFAccounts(),
    repo.listInsurancePolicies(),
    repo.listPhysicalAssets(),
  ]);

  const metrics = buildMetrics(
    fds,
    loans,
    links,
    incentives,
    rds,
    bonds,
    coupons,
    holdings,
    epfAccounts,
    ppfAccounts,
    insurancePolicies,
    physicalAssets,
  );
  const dashboardRows = [
    { metric: "exported_at", value: dayjs().format("YYYY-MM-DD HH:mm:ss") },
    { metric: "total_assets", value: metrics.totalAssets },
    { metric: "total_liabilities", value: metrics.totalLiabilities },
    { metric: "net_worth", value: metrics.netWorth },
    { metric: "investable_wealth", value: metrics.investableWealth },
    { metric: "pending_incentives", value: metrics.pendingIncentives },
    { metric: "estimated_spread_income", value: metrics.estimatedSpreadIncome },
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dashboardRows), "Dashboard");

  for (const cfg of BACKUP_TABLES) {
    const rows = await listTableRows(cfg.table);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), cfg.sheet);
  }

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function createBackupImportPreview(fileBuffer: Buffer, sourceFileName: string) {
  const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
  const incoming: Record<string, Array<Record<string, unknown>>> = {};
  const tables: TablePreview[] = [];

  for (const cfg of BACKUP_TABLES) {
    const rawRows = getSheetRows(workbook, cfg.sheet);
    const normalizedIncomingRows = await normalizeIncomingRows(cfg.table, rawRows);
    const currentRows = await listTableRows(cfg.table);

    incoming[cfg.table] = normalizedIncomingRows;
    tables.push(diffTable(cfg.table, cfg.sheet, currentRows, normalizedIncomingRows));
  }

  const summary = {
    tables: tables.length,
    added: tables.reduce((s, t) => s + t.added, 0),
    updated: tables.reduce((s, t) => s + t.updated, 0),
    deleted: tables.reduce((s, t) => s + t.deleted, 0),
  };

  const preview: BackupImportPreview = {
    id: randomUUID(),
    createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    sourceFileName,
    summary,
    tables,
    incoming,
  };

  await ensurePreviewDir();
  await writeFile(path.join(PREVIEW_DIR, `${preview.id}.json`), JSON.stringify(preview, null, 2), "utf-8");

  return preview.id;
}

export async function loadBackupImportPreview(previewId: string) {
  try {
    const raw = await readFile(path.join(PREVIEW_DIR, `${previewId}.json`), "utf-8");
    return JSON.parse(raw) as BackupImportPreview;
  } catch {
    return null;
  }
}

export async function deleteBackupImportPreview(previewId: string) {
  await rm(path.join(PREVIEW_DIR, `${previewId}.json`), { force: true });
}

export async function applyBackupImportPreview(previewId: string) {
  const preview = await loadBackupImportPreview(previewId);
  if (!preview) throw new Error("Backup preview not found");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const table of APPLY_ORDER) {
      const rows = preview.incoming[table] || [];
      const cols = await getColumns(table);
      const colNames = cols.map((c) => c.Field);
      const filtered = rows.map((row) => {
        const out: Record<string, unknown> = {};
        colNames.forEach((c) => {
          out[c] = row[c] ?? null;
        });
        return out;
      });

      await conn.query(`DELETE FROM \`${table}\``);

      if (filtered.length > 0) {
        const placeholders = `(${colNames.map(() => "?").join(",")})`;
        const sqlText = `INSERT INTO \`${table}\` (${colNames.map((c) => `\`${c}\``).join(",")}) VALUES ${placeholders}`;
        for (const row of filtered) {
          await conn.query(sqlText, colNames.map((c) => row[c]));
        }
      }
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  await deleteBackupImportPreview(previewId);
}
