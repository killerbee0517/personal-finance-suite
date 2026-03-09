import { saveRDAction } from "@/app/actions/data";

export default function RDNewPage() {
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Add RD</h1><form action={saveRDAction} className="ta-card space-y-4 p-5">
    <div className="grid gap-4 md:grid-cols-3"><input name="holder_name" className="ta-input" defaultValue="Owner"/><input name="bank_name" className="ta-input"/><input name="branch" className="ta-input"/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="rd_number" className="ta-input"/><input name="start_date" className="ta-input" defaultValue="2025-01-01"/><input name="maturity_date" className="ta-input" defaultValue="2027-01-01"/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="monthly_installment" className="ta-input" defaultValue="10000"/><input name="total_installments" className="ta-input" defaultValue="24"/><input name="installments_paid" className="ta-input" defaultValue="0"/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="interest_rate" className="ta-input" defaultValue="7"/><input name="status" className="ta-input" defaultValue="active"/><input name="reserved_for" className="ta-input"/></div>
    <textarea name="notes" className="ta-input" rows={3}/><button className="ta-btn" type="submit">Save RD</button>
  </form></div>;
}
