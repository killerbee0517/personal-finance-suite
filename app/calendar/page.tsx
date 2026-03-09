import dayjs from "dayjs";
import { CalendarMonthView } from "@/components/CalendarMonthView";
import { DbRequired } from "@/components/DbRequired";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

type EventItem = { date: string; type: string; title: string; detail: string };

export default async function CalendarPage() {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;

  const [alerts, policies, ppfAccounts] = await Promise.all([
    repo.listAlerts(),
    repo.listInsurancePolicies(),
    repo.listPPFAccounts(),
  ]);

  const events: EventItem[] = [
    ...alerts.map((a) => ({ date: a.due_date, type: a.alert_type, title: a.title, detail: a.message })),
    ...policies.map((p) => ({ date: p.next_due_date, type: "insurance", title: `${p.insurer_name} premium`, detail: `${p.policy_type} | ${p.policy_number}` })),
    ...ppfAccounts.map((p) => ({ date: p.fy_deadline_date, type: "ppf", title: `${p.bank_name} PPF deadline`, detail: `Remaining ${(p.target_contribution_fy - p.contribution_this_fy).toFixed(0)}` })),
  ].sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Calendar</h1>
      {events.length === 0 ? <p className="text-slate-500">No scheduled items yet.</p> : <CalendarMonthView events={events} />}
    </div>
  );
}
