import type { ReactNode } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { savePhysicalAssetAction } from "@/app/actions/data";
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

export default async function PhysicalAssetsPage() {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;

  const assets = await repo.listPhysicalAssets();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Physical Assets</h1>

      <form action={savePhysicalAssetAction} className="ta-card space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Asset Type">
            <select name="asset_type" className="ta-input" defaultValue="gold">
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
          </Field>
          <Field label="Asset Name">
            <input name="asset_name" className="ta-input" defaultValue="Gold Coin 24K" />
          </Field>
          <Field label="Holder Name">
            <input name="holder_name" className="ta-input" defaultValue="Owner" />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Quantity">
            <input name="quantity" className="ta-input" defaultValue="10" />
          </Field>
          <Field label="Unit">
            <input name="unit" className="ta-input" defaultValue="gm" />
          </Field>
          <Field label="Purchase Date">
            <input name="purchase_date" type="date" className="ta-input" defaultValue={dayjs().subtract(30, "day").format("YYYY-MM-DD")} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Purchase Rate (per unit)">
            <input name="purchase_rate" className="ta-input" defaultValue="6000" />
          </Field>
          <Field label="Current Rate (per unit)">
            <input name="current_rate" className="ta-input" defaultValue="6500" />
          </Field>
          <Field label="Status">
            <input name="status" className="ta-input" defaultValue="active" />
          </Field>
        </div>

        <Field label="Notes">
          <textarea name="notes" className="ta-input" rows={2} />
        </Field>

        <button className="ta-btn" type="submit">Save Physical Asset</button>
      </form>

      <div className="ta-card overflow-x-auto">
        <table className="ta-table min-w-full">
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>Holder</th>
              <th>Quantity</th>
              <th>Purchase Date</th>
              <th>Purchase Value</th>
              <th>Current Value</th>
              <th>Gain/Loss</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id}>
                <td>{a.asset_type}</td>
                <td>{a.asset_name}</td>
                <td>{a.holder_name}</td>
                <td>{a.quantity} {a.unit}</td>
                <td>{a.purchase_date}</td>
                <td>{formatCurrency(a.purchase_value)}</td>
                <td>{formatCurrency(a.current_value)}</td>
                <td>{formatCurrency(a.current_value - a.purchase_value)}</td>
                <td><Link href={`/physical/${a.id}`} className="ta-btn-outline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
