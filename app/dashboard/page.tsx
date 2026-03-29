import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { buildMetrics, repo } from "@/lib/services";
import { bondCurrentValue, bondProjectedValue, cagrPercent, estimateFDCurrentValue, estimateRDCurrentValue, potentialReturnPercent, rdProjectedBaseFromToday } from "@/lib/returns";
import { PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";

const ClientCharts = dynamic(() => import("@/components/DashboardCharts").then((m) => m.DashboardCharts), { ssr: false });

export default async function DashboardPage() {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;

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

  const assetMix = [
    { name: "FD", value: metrics.activeFDValue },
    { name: "RD", value: metrics.activeRDValue },
    { name: "Corporate Bonds", value: metrics.bondValue },
    { name: "Equity & MF", value: metrics.equityValue },
    { name: "EPF", value: metrics.epfValue },
    { name: "PPF", value: metrics.ppfValue },
    { name: "Physical Assets", value: metrics.physicalAssetValue },
  ].filter((x) => x.value > 0);

  const today = dayjs().format("YYYY-MM-DD");
  const earliestDates: string[] = [];

  const fdInvested = fds.reduce((s, fd) => {
    earliestDates.push(fd.deposit_date);
    return s + fd.principal;
  }, 0);
  const fdCurrent = fds.reduce((s, fd) => s + estimateFDCurrentValue(fd, today), 0);
  const fdProjected = fds.reduce((s, fd) => s + Math.max(fd.maturity_value_expected || fd.principal, fd.principal), 0);

  const rdInvested = rds.reduce((s, rd) => {
    earliestDates.push(rd.start_date);
    return s + rd.monthly_installment * rd.installments_paid;
  }, 0);
  const rdCurrent = rds.reduce((s, rd) => s + estimateRDCurrentValue(rd, today), 0);
  const rdProjected = rds.reduce((s, rd) => s + Math.max(rd.maturity_value_expected || 0, rd.monthly_installment * rd.total_installments), 0);

  const bondInvested = bonds.reduce((s, bond) => {
    earliestDates.push(bond.investment_date);
    return s + bond.principal_invested;
  }, 0);
  const bondCurrent = bonds.reduce((s, bond) => s + bondCurrentValue(bond, coupons.filter((c) => c.bond_id === bond.id)), 0);
  const bondProjected = bonds.reduce((s, bond) => s + bondProjectedValue(bond, coupons.filter((c) => c.bond_id === bond.id)), 0);

  const equityInvested = holdings.reduce((s, h) => s + h.invested_value, 0);
  const equityCurrent = holdings.reduce((s, h) => s + h.current_value, 0);
  const equityMinDate = holdings.map((h) => h.valuation_date).filter(Boolean).sort()[0];
  if (equityMinDate) earliestDates.push(equityMinDate);

  const portfolioInitial = fdInvested + rdInvested + bondInvested + equityInvested;
  const portfolioCurrent = fdCurrent + rdCurrent + bondCurrent + equityCurrent;
  const earliestDate = earliestDates.sort()[0];
  const portfolioCagr = earliestDate ? cagrPercent(portfolioInitial, portfolioCurrent, earliestDate, today) : null;
  const rdProjectedBase = rds.reduce((s, rd) => s + rdProjectedBaseFromToday(rd, today), 0);
  const portfolioPotentialReturn = potentialReturnPercent(
    fdCurrent + rdProjectedBase + bondCurrent,
    fdProjected + rdProjected + bondProjected,
  );

  const kpis = [
    { label: "Total Assets", value: metrics.totalAssets, trend: "+12.5%", trendColor: "text-emerald-700 bg-emerald-100", top: "bg-blue-500", icon: Wallet },
    { label: "Total Liabilities", value: metrics.totalLiabilities, trend: "-3.2%", trendColor: "text-rose-700 bg-rose-100", top: "bg-blue-500", icon: TrendingDown },
    { label: "Net Worth", value: metrics.netWorth, trend: "+18.7%", trendColor: "text-emerald-700 bg-emerald-100", top: "bg-blue-500", icon: TrendingUp },
    { label: "Investable Wealth", value: metrics.investableWealth, trend: "+8.3%", trendColor: "text-emerald-700 bg-emerald-100", top: "bg-blue-500", icon: PiggyBank },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="ta-card overflow-hidden">
            <div className={`h-1 ${k.top}`} />
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <k.icon className="h-5 w-5" />
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${k.trendColor}`}>{k.trend}</span>
              </div>
              <p className="text-[28px] font-bold leading-none text-[#0f172a]">{formatCurrency(k.value)}</p>
              <p className="mt-2 text-lg text-[#334155]">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="ta-card p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Portfolio CAGR (Actual)</p>
          <p className="mt-2 text-3xl font-bold text-[#0f172a]">{Number.isFinite(portfolioCagr) ? `${(portfolioCagr as number).toFixed(2)}%` : "-"}</p>
          <p className="mt-1 text-xs text-slate-500">As of {today}</p>
        </div>
        <div className="ta-card p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Portfolio Potential Return</p>
          <p className="mt-2 text-3xl font-bold text-[#0f172a]">{Number.isFinite(portfolioPotentialReturn) ? `${(portfolioPotentialReturn as number).toFixed(2)}%` : "-"}</p>
          <p className="mt-1 text-xs text-slate-500">Projected from FD, RD, Bonds maturity values</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="ta-card p-5 xl:col-span-2">
          <h3 className="text-xl font-semibold text-[#0f172a]">Key Finance Summary</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Pending Incentives</p><p className="text-lg font-bold">{formatCurrency(metrics.pendingIncentives)}</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Loan-backed Deposits</p><p className="text-lg font-bold">{formatCurrency(metrics.loanBackedDeposits)}</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Reserved Deposits</p><p className="text-lg font-bold">{formatCurrency(metrics.reservedDeposits)}</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Insurance Due</p><p className="text-lg font-bold">{metrics.insuranceDueCount}</p></div>
          </div>
          <p className="mt-3 text-xs text-slate-500">As of {dayjs().format("YYYY-MM-DD")}</p>
        </div>

        <div className="xl:col-span-1">
          <ClientCharts assetMix={assetMix} />
        </div>
      </div>
    </div>
  );
}
