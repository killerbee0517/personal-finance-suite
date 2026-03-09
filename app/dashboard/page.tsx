import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { DbRequired } from "@/components/DbRequired";
import { StatCard } from "@/components/StatCard";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { buildMetrics, repo } from "@/lib/services";

const ClientCharts = dynamic(() => import("@/components/DashboardCharts").then((m) => m.DashboardCharts), { ssr: false });

export default async function DashboardPage() {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;

  const [fds, loans, links, incentives, rds, bonds, coupons, holdings, epfAccounts, ppfAccounts, insurancePolicies] = await Promise.all([
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
  ]);

  const metrics = buildMetrics(fds, loans, links, incentives, rds, bonds, coupons, holdings, epfAccounts, ppfAccounts, insurancePolicies);

  const bankTotals = [...new Set(fds.map((f) => f.bank_name))].map((bank) => ({
    bank,
    total: fds.filter((f) => f.bank_name === bank).reduce((s, f) => s + f.principal, 0),
  }));
  const upcomingFD = fds.filter((f) => dayjs(f.maturity_date).diff(dayjs(), "day") <= 30).slice(0, 5);

  const assetMix = [
    { name: "FD", value: metrics.activeFDValue },
    { name: "RD", value: metrics.activeRDValue },
    { name: "Bonds", value: metrics.bondValue },
    { name: "Equity", value: metrics.equityValue },
    { name: "EPF", value: metrics.epfValue },
    { name: "PPF", value: metrics.ppfValue },
  ].filter((x) => x.value > 0);

  const bankExposure = bankTotals.map((b) => ({ name: b.bank, value: b.total }));
  const monthKeys = [0, 1, 2, 3, 4, 5].map((m) => dayjs().add(m, "month"));
  const maturityTimeline = monthKeys.map((d) => {
    const key = d.format("MMM YY");
    const fdValue = fds.filter((f) => dayjs(f.maturity_date).format("MMM YY") === key).reduce((s, f) => s + f.principal, 0);
    const rdValue = rds.filter((r) => dayjs(r.maturity_date).format("MMM YY") === key).reduce((s, r) => s + r.monthly_installment * r.installments_paid, 0);
    const bondValue = bonds.filter((b) => dayjs(b.maturity_date).format("MMM YY") === key).reduce((s, b) => s + b.principal_invested, 0);
    return { name: key, value: fdValue + rdValue + bondValue };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Assets" value={metrics.totalAssets} />
        <StatCard label="Total Liabilities" value={metrics.totalLiabilities} />
        <StatCard label="Net Worth" value={metrics.netWorth} />
        <StatCard label="Investable Wealth" value={metrics.investableWealth} />
        <StatCard label="Active FD Value" value={metrics.activeFDValue} />
        <StatCard label="Active RD Value" value={metrics.activeRDValue} />
        <StatCard label="Corporate Bonds" value={metrics.bondValue} />
        <StatCard label="Equity & MF Value" value={metrics.equityValue} />
        <StatCard label="EPF Value" value={metrics.epfValue} />
        <StatCard label="PPF Value" value={metrics.ppfValue} />
        <StatCard label="Pending Incentives" value={metrics.pendingIncentives} />
        <StatCard label="Insurance Due (30d)" value={metrics.insuranceDueCount} isCount />
      </div>

      <div className="ta-card p-5">
        <p className="text-xs uppercase tracking-wide text-slate-500">Estimated Spread Income</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(metrics.estimatedSpreadIncome)}</p>
      </div>

      <ClientCharts assetMix={assetMix} bankExposure={bankExposure} maturityTimeline={maturityTimeline} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="ta-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Maturities</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {upcomingFD.length === 0 ? <p className="text-slate-500">No maturities in next 30 days.</p> : upcomingFD.map((f) => <p key={f.id}>{f.bank_name} | {f.fd_number} | {f.maturity_date}</p>)}
          </div>
        </div>

        <div className="ta-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Liability Summary</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {loans.filter((l) => l.status === "active").map((l) => (
              <p key={l.id}>{l.bank_name} | {l.loan_type} | {formatCurrency(l.outstanding_principal)}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
