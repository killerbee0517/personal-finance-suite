import { saveLoanAction } from "@/app/actions/data";

export default function LoanNewPage() {
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Add Loan</h1><form action={saveLoanAction} className="ta-card space-y-4 p-5">
    <div className="grid gap-4 md:grid-cols-3"><input name="loan_type" className="ta-input" defaultValue="LAP"/><input name="holder_name" className="ta-input" defaultValue="Owner"/><input name="bank_name" className="ta-input"/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="account_number" className="ta-input"/><input name="start_date" className="ta-input" defaultValue="2026-01-01"/><input name="end_date" className="ta-input" defaultValue="2028-01-01"/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="principal_amount" className="ta-input" defaultValue="1000000"/><input name="interest_rate" className="ta-input" defaultValue="10.2"/><input name="repayment_type" className="ta-input" defaultValue="EMI"/></div>
    <div className="grid gap-4 md:grid-cols-3"><input name="emi_amount" className="ta-input" defaultValue="0"/><input name="outstanding_principal" className="ta-input" defaultValue="1000000"/><input name="bullet_closure_amount" className="ta-input" defaultValue="0"/></div>
    <input name="status" className="ta-input" defaultValue="active"/><textarea name="notes" className="ta-input" rows={3}/><button type="submit" className="ta-btn">Save Loan</button>
  </form></div>;
}
