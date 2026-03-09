import type { ReactNode } from "react";
import { notFound } from "next/navigation";
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

export default async function PhysicalAssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ready = await ensureInitialized();
  if (!ready) return <DbRequired />;

  const asset = await repo.getPhysicalAsset(Number((await params).id));
  if (!asset) return notFound();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Physical Asset Detail</h1>
      <div className="ta-card p-4 text-sm">
        {asset.asset_type.toUpperCase()} | {asset.asset_name} | {asset.quantity} {asset.unit} | Purchase {formatCurrency(asset.purchase_value)} | Current {formatCurrency(asset.current_value)}
      </div>

      <form action={savePhysicalAssetAction} className="ta-card space-y-4 p-5">
        <input type="hidden" name="id" value={asset.id} />

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Asset Type">
            <select name="asset_type" className="ta-input" defaultValue={asset.asset_type}>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
          </Field>
          <Field label="Asset Name">
            <input name="asset_name" className="ta-input" defaultValue={asset.asset_name} />
          </Field>
          <Field label="Holder Name">
            <input name="holder_name" className="ta-input" defaultValue={asset.holder_name} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Quantity">
            <input name="quantity" className="ta-input" defaultValue={asset.quantity} />
          </Field>
          <Field label="Unit">
            <input name="unit" className="ta-input" defaultValue={asset.unit} />
          </Field>
          <Field label="Purchase Date">
            <input name="purchase_date" type="date" className="ta-input" defaultValue={asset.purchase_date} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Purchase Rate (per unit)">
            <input name="purchase_rate" className="ta-input" defaultValue={asset.purchase_rate} />
          </Field>
          <Field label="Current Rate (per unit)">
            <input name="current_rate" className="ta-input" defaultValue={asset.current_rate} />
          </Field>
          <Field label="Status">
            <input name="status" className="ta-input" defaultValue={asset.status} />
          </Field>
        </div>

        <Field label="Notes">
          <textarea name="notes" className="ta-input" rows={3} defaultValue={asset.notes || ""} />
        </Field>

        <button className="ta-btn" type="submit">Update Physical Asset</button>
      </form>
    </div>
  );
}
