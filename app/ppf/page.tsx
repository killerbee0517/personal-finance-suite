import dayjs from "dayjs";
import { savePPFAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default async function PPFPage() {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const ppf = await repo.listPPFAccounts();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">PPF Tracker</h1>
      <form action={savePPFAction} className="ta-card space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Bank Name"><input name="bank_name" className="ta-input" /></Field>
          <Field label="Account Number"><input name="account_number" className="ta-input" /></Field>
          <Field label="Holder Name"><input name="holder_name" className="ta-input" defaultValue="Owner" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Start Date"><input name="start_date" type="date" className="ta-input" defaultValue="2017-04-01" /></Field>
          <Field label="Maturity Date"><input name="maturity_date" type="date" className="ta-input" defaultValue="2032-04-01" /></Field>
          <Field label="Extension Years"><input name="extension_years" className="ta-input" defaultValue="5" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Current Balance"><input name="current_balance" className="ta-input" defaultValue="0" /></Field>
          <Field label="Contribution This FY"><input name="contribution_this_fy" className="ta-input" defaultValue="0" /></Field>
          <Field label="Target Contribution FY"><input name="target_contribution_fy" className="ta-input" defaultValue="150000" /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="FY Deadline Date"><input name="fy_deadline_date" type="date" className="ta-input" defaultValue={`${dayjs().year()}-03-31`} /></Field>
          <Field label="Last Contribution Date"><input name="last_contribution_date" type="date" className="ta-input" /></Field>
          <Field label="Status"><input name="status" className="ta-input" defaultValue="active" /></Field>
        </div>
        <Field label="Notes"><input name="notes" className="ta-input" /></Field>
        <button className="ta-btn" type="submit">Save PPF</button>
      </form>
      <div className="ta-card overflow-x-auto"><table className="ta-table min-w-full"><thead><tr><th>Bank</th><th>Account</th><th>Balance</th><th>FY Progress</th><th>Deadline</th><th>Maturity</th></tr></thead><tbody>{ppf.map((p)=><tr key={p.id}><td>{p.bank_name}</td><td>{p.account_number}</td><td>{formatCurrency(p.current_balance)}</td><td>{formatCurrency(p.contribution_this_fy)} / {formatCurrency(p.target_contribution_fy)}</td><td>{p.fy_deadline_date}</td><td>{p.maturity_date}</td></tr>)}</tbody></table></div>
    </div>
  );
}
