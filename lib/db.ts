import mysql from "mysql2/promise";
import { cookies } from "next/headers";

const baseConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
};

export const dbName = process.env.DB_NAME || "personal_finance_desktop";

export const adminPool = mysql.createPool({
  ...baseConfig,
  waitForConnections: true,
  connectionLimit: 5,
});

export const pool = mysql.createPool({
  ...baseConfig,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
});
const SESSION_COOKIE = "pfm_session";

const TENANT_TABLES = [
  "fd_master",
  "loan_master",
  "rd_master",
  "bond_master",
  "bond_coupon_schedule",
  "fd_loan_link",
  "incentive_tracker",
  "equity_holdings",
  "equity_transactions",
  "cas_import_runs",
  "epf_accounts",
  "ppf_accounts",
  "insurance_policies",
  "physical_assets",
  "app_family_members",
  "alerts",
  "investment_cashflows",
] as const;

async function getTenantIdFromSession() {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return 1;
    const [rows] = (await pool.query(
      `SELECT u.tenant_id
       FROM user_sessions s
       JOIN app_users u ON u.id = s.user_id
       WHERE s.session_token=?
         AND s.expires_at > NOW()
         AND u.status='active'
       ORDER BY s.id DESC
       LIMIT 1`,
      [token],
    )) as [Array<{ tenant_id: number }>, unknown];
    const tenantId = rows[0]?.tenant_id;
    return Number.isFinite(tenantId) && tenantId > 0 ? tenantId : 0;
  } catch {
    return 0;
  }
}

function injectTenantScope(query: string, params: unknown[], tenantId: number) {
  const trimmed = query.trim();
  const lowered = trimmed.toLowerCase();
  if (lowered.includes("information_schema")) return { query, params };
  if (lowered.includes("tenant_id")) return { query, params };

  const table = TENANT_TABLES.find((t) => lowered.includes(` ${t}`));
  if (!table) return { query, params };

  if (lowered.startsWith("select")) {
    const hasWhere = /\bwhere\b/i.test(trimmed);
    const orderIdx = trimmed.search(/\border by\b/i);
    const limitIdx = trimmed.search(/\blimit\b/i);
    const insertIdxCandidates = [orderIdx, limitIdx].filter((i) => i >= 0);
    const insertIdx = insertIdxCandidates.length ? Math.min(...insertIdxCandidates) : trimmed.length;
    const head = trimmed.slice(0, insertIdx).trimEnd();
    const tail = trimmed.slice(insertIdx).trimStart();
    const scopedHead = hasWhere ? `${head} AND tenant_id=?` : `${head} WHERE tenant_id=?`;
    const scopedQuery = tail ? `${scopedHead} ${tail}` : scopedHead;
    return { query: scopedQuery, params: [...params, tenantId] };
  }

  if (lowered.startsWith("update")) {
    if (/\bwhere\b/i.test(trimmed)) {
      return { query: `${trimmed} AND tenant_id=?`, params: [...params, tenantId] };
    }
    return { query: `${trimmed} WHERE tenant_id=?`, params: [...params, tenantId] };
  }

  if (lowered.startsWith("delete")) {
    if (/\bwhere\b/i.test(trimmed)) {
      return { query: `${trimmed} AND tenant_id=?`, params: [...params, tenantId] };
    }
    return { query: `${trimmed} WHERE tenant_id=?`, params: [...params, tenantId] };
  }

  if (lowered.startsWith("insert into")) {
    const m = trimmed.match(/^insert\s+into\s+([a-z0-9_`]+)\s*\(([^)]*)\)\s*values\s*\(([^)]*)\)/i);
    if (!m) return { query, params };
    const cols = m[2].trim();
    const vals = m[3].trim();
    const updated = trimmed.replace(m[0], `INSERT INTO ${m[1]} (tenant_id,${cols}) VALUES (?,${vals})`);
    return { query: updated, params: [tenantId, ...params] };
  }

  return { query, params };
}

export async function sql<T>(query: string, params: unknown[] = []) {
  const tenantId = await getTenantIdFromSession();
  const scoped = injectTenantScope(query, params, tenantId);
  const [rows] = await pool.query(scoped.query, scoped.params);
  return rows as T[];
}
