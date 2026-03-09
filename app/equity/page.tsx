import { importCasAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export default async function EquityPage({ searchParams }: { searchParams?: Promise<{ warnings?: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;

  const [holdings, txns, runs] = await Promise.all([repo.listEquityHoldings(), repo.listEquityTransactions(), repo.listCasRuns()]);
  const warnings = (await searchParams)?.warnings;
  const totalInvested = holdings.reduce((s, h) => s + h.invested_value, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.current_value, 0);

  return <div className="space-y-5"><h1 className="text-2xl font-bold">Equity & Mutual Funds</h1>
    <div className="ta-card p-4"><p className="mb-2 font-semibold">CAS Upload (CSV/TXT)</p><p className="mb-3 text-xs text-slate-500">HOLDING,Source,stock|mutual_fund,Instrument,Symbol,ISIN,FolioOrAccount,Qty,AvgCost,CurrentValue,ValuationDate and TXN,Source,stock|mutual_fund,Instrument,Symbol,ISIN,TxnType,TxnDate,Qty,Price,Amount,FolioOrAccount</p>{warnings?<p className="mb-2 text-sm text-amber-600">{warnings}</p>:null}<form action={importCasAction} className="flex flex-wrap items-center gap-3"><input type="file" name="cas_file" accept=".csv,.txt" required /><button className="ta-btn" type="submit">Import Statement</button></form></div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><div className="ta-card p-4"><p className="text-xs text-slate-500">Total Invested</p><p className="text-xl font-bold">{formatCurrency(totalInvested)}</p></div><div className="ta-card p-4"><p className="text-xs text-slate-500">Current Value</p><p className="text-xl font-bold">{formatCurrency(totalCurrent)}</p></div><div className="ta-card p-4"><p className="text-xs text-slate-500">Unrealized P/L</p><p className="text-xl font-bold">{formatCurrency(totalCurrent-totalInvested)}</p></div></div>
    <div className="ta-card overflow-x-auto"><p className="px-4 pt-4 text-lg font-semibold">Current Holdings</p><table className="ta-table min-w-full"><thead><tr><th>Type</th><th>Instrument</th><th>ISIN</th><th>Qty</th><th>Invested</th><th>Current</th></tr></thead><tbody>{holdings.map((h)=><tr key={h.id}><td>{h.asset_type}</td><td>{h.instrument_name}</td><td>{h.isin || "-"}</td><td>{h.quantity}</td><td>{formatCurrency(h.invested_value)}</td><td>{formatCurrency(h.current_value)}</td></tr>)}</tbody></table></div>
    <div className="ta-card overflow-x-auto"><p className="px-4 pt-4 text-lg font-semibold">Recent Transactions</p><table className="ta-table min-w-full"><thead><tr><th>Date</th><th>Type</th><th>Instrument</th><th>Txn</th><th>Qty</th><th>Amount</th></tr></thead><tbody>{txns.slice(0,15).map((t)=><tr key={t.id}><td>{t.txn_date}</td><td>{t.asset_type}</td><td>{t.instrument_name}</td><td>{t.txn_type}</td><td>{t.quantity}</td><td>{formatCurrency(t.amount)}</td></tr>)}</tbody></table></div>
    <div className="ta-card p-4"><p className="mb-2 text-lg font-semibold">Import History</p>{runs.length===0?<p className="text-sm text-slate-500">No imports yet</p>:runs.map((r)=><p key={r.id} className="text-sm">{r.imported_at} | {r.file_name} | {r.records_count} records</p>)}</div>
  </div>;
}
