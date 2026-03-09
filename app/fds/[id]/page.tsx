import type { ReactNode } from "react";
import dayjs from "dayjs";
import { notFound } from "next/navigation";
import { saveFDAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { formatCurrency } from "@/lib/format";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default async function FDDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;
  const fd = await repo.getFD(Number((await params).id));
  if (!fd) return notFound();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Deposit Detail</h1>
      <div className="ta-card p-4 text-sm">
        {fd.instrument_type?.toUpperCase() || "FD"} | {fd.bank_name} | {fd.fd_number} | {formatCurrency(fd.principal)} | {fd.interest_rate}% | {fd.maturity_date} ({dayjs(fd.maturity_date).diff(dayjs(), "day")}d)
      </div>

      <form action={saveFDAction} className="ta-card space-y-4 p-5">
        <input type="hidden" name="id" value={fd.id} />

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Instrument Type">
            <select name="instrument_type" className="ta-input" defaultValue={fd.instrument_type || "fd"}>
              <option value="fd">FD</option>
              <option value="ncd">NCD</option>
              <option value="subordinate_debt">Subordinate Debt</option>
            </select>
          </Field>
          <Field label="Holder Name">
            <input name="holder_name" className="ta-input" defaultValue={fd.holder_name} />
          </Field>
          <Field label="Bank / Issuer">
            <input name="bank_name" className="ta-input" defaultValue={fd.bank_name} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Branch">
            <input name="branch" className="ta-input" defaultValue={fd.branch} />
          </Field>
          <Field label="Deposit Number">
            <input name="fd_number" className="ta-input" defaultValue={fd.fd_number} />
          </Field>
          <Field label="Renewal From Deposit ID">
            <input name="renewal_from_fd_id" className="ta-input" defaultValue={fd.renewal_from_fd_id || ""} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Deposit Date">
            <input name="deposit_date" type="date" className="ta-input" defaultValue={fd.deposit_date} />
          </Field>
          <Field label="Maturity Date">
            <input name="maturity_date" type="date" className="ta-input" defaultValue={fd.maturity_date} />
          </Field>
          <Field label="Principal Amount">
            <input name="principal" className="ta-input" defaultValue={fd.principal} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Interest Rate (%)">
            <input name="interest_rate" className="ta-input" defaultValue={fd.interest_rate} />
          </Field>
          <Field label="Payout Type">
            <input name="payout_type" className="ta-input" defaultValue={fd.payout_type} />
          </Field>
          <Field label="Status">
            <input name="status" className="ta-input" defaultValue={fd.status} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Funding Type">
            <input name="funding_type" className="ta-input" defaultValue={fd.funding_type} />
          </Field>
          <Field label="Linked Loan ID">
            <input name="linked_loan_id" className="ta-input" defaultValue={fd.linked_loan_id || ""} />
          </Field>
          <Field label="Reserved For">
            <input name="reserved_for" className="ta-input" defaultValue={fd.reserved_for || ""} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Incentive Expected">
            <input name="incentive_expected" className="ta-input" defaultValue={fd.incentive_expected || 0} />
          </Field>
          <Field label="Incentive Received">
            <input name="incentive_received" className="ta-input" defaultValue={fd.incentive_received || 0} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Certificate Received">
            <select name="certificate_received" className="ta-input" defaultValue={String(fd.certificate_received || 0)}>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </Field>
          <Field label="Certificate Received Date">
            <input name="certificate_received_date" type="date" className="ta-input" defaultValue={fd.certificate_received_date || ""} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Raised By (Bank/RM Name)">
            <input name="raised_by_name" className="ta-input" defaultValue={fd.raised_by_name || ""} />
          </Field>
          <Field label="Raised By Contact">
            <input name="raised_by_contact" className="ta-input" defaultValue={fd.raised_by_contact || ""} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Raised Under Name">
            <input name="raised_under_name" className="ta-input" defaultValue={fd.raised_under_name || ""} />
          </Field>
          <Field label="Nominee Name">
            <input name="nominee_name" className="ta-input" defaultValue={fd.nominee_name || ""} />
          </Field>
        </div>

        <Field label="Remarks">
          <textarea name="remarks" className="ta-input" rows={2} defaultValue={fd.remarks || ""} />
        </Field>
        <Field label="Notes">
          <textarea name="notes" className="ta-input" rows={3} defaultValue={fd.notes || ""} />
        </Field>

        <button className="ta-btn" type="submit">Update Deposit</button>
      </form>
    </div>
  );
}
