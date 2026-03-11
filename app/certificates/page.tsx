import dayjs from "dayjs";
import { updateCertificateReceiptAction } from "@/app/actions/data";
import { DbRequired } from "@/components/DbRequired";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export default async function CertificatesPage() {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;

  const fds = await repo.listFDs();
  const pending = fds.filter((f) => f.certificate_received !== 1 && f.status === "active");
  const received = fds.filter((f) => f.certificate_received === 1).slice(0, 20);
  const today = dayjs().format("YYYY-MM-DD");

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Deposit Certificates</h1>

      <div className="ta-card p-4">
        <h2 className="text-lg font-semibold">Pending Certificates</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No pending certificates.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {pending.map((fd) => (
              <div key={fd.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">
                  {fd.bank_name} | {fd.fd_number} | {fd.instrument_type.toUpperCase()}
                </p>
                <p className="text-xs text-slate-600">
                  Deposit: {fd.deposit_date} | Maturity: {fd.maturity_date}
                </p>
                <form action={updateCertificateReceiptAction} className="mt-2 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="fd_id" value={fd.id} />
                  <label className="text-xs text-slate-600">
                    Received Date
                    <input
                      name="certificate_received_date"
                      type="date"
                      className="ta-input mt-1"
                      defaultValue={today}
                    />
                  </label>
                  <button type="submit" className="ta-btn">
                    Mark Received
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ta-card p-4">
        <h2 className="text-lg font-semibold">Recently Received</h2>
        {received.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No received certificates yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="ta-table min-w-full">
              <thead>
                <tr>
                  <th>Bank/Issuer</th>
                  <th>Deposit</th>
                  <th>Type</th>
                  <th>Received Date</th>
                </tr>
              </thead>
              <tbody>
                {received.map((fd) => (
                  <tr key={fd.id}>
                    <td>{fd.bank_name}</td>
                    <td>{fd.fd_number}</td>
                    <td>{fd.instrument_type}</td>
                    <td>{fd.certificate_received_date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
