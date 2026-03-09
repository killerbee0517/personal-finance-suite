import dayjs from "dayjs";
import { DbRequired } from "@/components/DbRequired";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

const inDays = (date: string, n: number) => {
  const diff = dayjs(date).diff(dayjs(), "day");
  return diff >= 0 && diff <= n;
};

const typeColors: Record<string, string> = {
  insurance_premium_due: "bg-blue-100 text-blue-700",
  ppf_contribution_due: "bg-emerald-100 text-emerald-700",
  bond_coupon_due: "bg-cyan-100 text-cyan-700",
  fd_maturity_due: "bg-violet-100 text-violet-700",
  reserved_fd_maturing: "bg-rose-100 text-rose-700",
  rd_maturity_due: "bg-indigo-100 text-indigo-700",
  loan_due: "bg-amber-100 text-amber-700",
  incentive_overdue: "bg-red-100 text-red-700",
  negative_spread: "bg-orange-100 text-orange-700",
};

function AlertRow({ a }: { a: { id: number; alert_type: string; title: string; message: string; due_date: string; status: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${typeColors[a.alert_type] || "bg-slate-100 text-slate-700"}`}>
          {a.alert_type}
        </span>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${a.status === "overdue" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}`}>
          {a.status}
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-900">{a.title}</p>
      <p className="mt-1 text-sm text-slate-600">{a.message}</p>
      <p className="mt-1 text-xs text-slate-500">Due: {a.due_date}</p>
    </div>
  );
}

export default async function AlertsPage() {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const alerts = await repo.listAlerts();

  const groups = {
    Today: alerts.filter((a) => dayjs(a.due_date).isSame(dayjs(), "day")),
    "Next 7 days": alerts.filter((a) => inDays(a.due_date, 7)),
    "Next 30 days": alerts.filter((a) => inDays(a.due_date, 30)),
    Overdue: alerts.filter((a) => dayjs(a.due_date).isBefore(dayjs(), "day") || a.status === "overdue"),
  };

  const total = alerts.length;
  const overdue = groups.Overdue.length;
  const due7 = groups["Next 7 days"].length;

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold text-slate-900">Alerts Center</h1>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="ta-card p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Total Alerts</p><p className="mt-1 text-2xl font-bold">{total}</p></div>
        <div className="ta-card p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Due Next 7 Days</p><p className="mt-1 text-2xl font-bold text-amber-700">{due7}</p></div>
        <div className="ta-card p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Overdue</p><p className="mt-1 text-2xl font-bold text-rose-700">{overdue}</p></div>
      </div>

      {Object.entries(groups).map(([label, list]) => (
        <section key={label} className="ta-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{label}</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{list.length}</span>
          </div>

          {list.length === 0 ? (
            <p className="text-sm text-slate-500">No alerts</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {list.map((a) => (
                <AlertRow key={a.id} a={a} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
