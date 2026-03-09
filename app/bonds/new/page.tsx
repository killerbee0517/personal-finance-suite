import { saveBondAction } from "@/app/actions/data";

export default function BondNewPage() {
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Add Bond</h1><form action={saveBondAction} className="ta-card space-y-4 p-5">
    <div className="grid gap-4 md:grid-cols-3"><input name="platform" className="ta-input" defaultValue="GoldenPi"/><input name="issuer_name" className="ta-input"/><input name="bond_name" className="ta-input"/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="isin" className="ta-input"/><input name="holder_name" className="ta-input" defaultValue="Owner"/><input name="status" className="ta-input" defaultValue="active"/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="investment_date" className="ta-input" defaultValue="2026-01-01"/><input name="maturity_date" className="ta-input" defaultValue="2028-01-01"/><input name="principal_invested" className="ta-input" defaultValue="500000"/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="face_value" className="ta-input" defaultValue="1000"/><input name="coupon_rate" className="ta-input" defaultValue="10.5"/><input name="units" className="ta-input" defaultValue="500"/></div>
    <div className="grid gap-4 md:grid-cols-2"><input name="payout_frequency" className="ta-input" defaultValue="monthly"/><input name="payout_day" className="ta-input" defaultValue="7"/></div>
    <textarea name="notes" className="ta-input" rows={3}/><button className="ta-btn" type="submit">Save Bond</button>
  </form></div>;
}
