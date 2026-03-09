import dayjs from "dayjs";

export type CasHoldingRow = {
  source: string;
  asset_type: "stock" | "mutual_fund";
  instrument_name: string;
  symbol?: string;
  isin?: string;
  folio_or_account?: string;
  quantity: number;
  average_cost: number;
  current_value: number;
  valuation_date: string;
};

export type CasTransactionRow = {
  source: string;
  asset_type: "stock" | "mutual_fund";
  instrument_name: string;
  symbol?: string;
  isin?: string;
  txn_type: string;
  txn_date: string;
  quantity: number;
  price: number;
  amount: number;
  folio_or_account?: string;
};

export type CasParseResult = {
  holdings: CasHoldingRow[];
  transactions: CasTransactionRow[];
  warnings: string[];
};

function parseDelimitedLine(line: string) {
  const parts = line.split(",").map((p) => p.trim());
  return parts;
}

function toNum(v: string) {
  const cleaned = v.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function toDate(v: string) {
  const d = dayjs(v);
  return d.isValid() ? d.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
}

function parseTextContent(content: string): CasParseResult {
  const warnings: string[] = [];
  const holdings: CasHoldingRow[] = [];
  const transactions: CasTransactionRow[] = [];

  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const parts = parseDelimitedLine(line);
    if (parts.length < 2) continue;
    const kind = parts[0].toUpperCase();

    if (kind === "HOLDING") {
      if (parts.length < 10) {
        warnings.push(`Skipped malformed HOLDING row: ${line.slice(0, 80)}`);
        continue;
      }
      const assetType = parts[2].toLowerCase() === "stock" ? "stock" : "mutual_fund";
      holdings.push({
        source: parts[1] || "CAS",
        asset_type: assetType,
        instrument_name: parts[3],
        symbol: parts[4] || undefined,
        isin: parts[5] || undefined,
        folio_or_account: parts[6] || undefined,
        quantity: toNum(parts[7]),
        average_cost: toNum(parts[8]),
        current_value: toNum(parts[9]),
        valuation_date: toDate(parts[10] || dayjs().format("YYYY-MM-DD")),
      });
      continue;
    }

    if (kind === "TXN") {
      if (parts.length < 10) {
        warnings.push(`Skipped malformed TXN row: ${line.slice(0, 80)}`);
        continue;
      }
      const assetType = parts[2].toLowerCase() === "stock" ? "stock" : "mutual_fund";
      transactions.push({
        source: parts[1] || "CAS",
        asset_type: assetType,
        instrument_name: parts[3],
        symbol: parts[4] || undefined,
        isin: parts[5] || undefined,
        txn_type: parts[6] || "BUY",
        txn_date: toDate(parts[7]),
        quantity: toNum(parts[8]),
        price: toNum(parts[9]),
        amount: toNum(parts[10]),
        folio_or_account: parts[11] || undefined,
      });
      continue;
    }
  }

  if (holdings.length === 0 && transactions.length === 0) {
    warnings.push("No parseable rows found. Use CSV with HOLDING/TXN format shown in Equity screen.");
  }

  return { holdings, transactions, warnings };
}

export async function parseCasFile(file: File): Promise<CasParseResult> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (!ext || !["csv", "txt"].includes(ext)) {
    return {
      holdings: [],
      transactions: [],
      warnings: ["Only CSV/TXT ingestion is supported in this version. Export CAS/statement to CSV first."],
    };
  }

  const text = await file.text();
  return parseTextContent(text);
}
