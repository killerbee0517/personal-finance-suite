import { Loan } from "@/types/models";
import { allAsync, getAsync, runAsync } from "../helpers";

export const loanRepository = {
  list: () => allAsync<Loan>("SELECT * FROM loan_master ORDER BY end_date ASC"),
  getById: (id: number) => getAsync<Loan>("SELECT * FROM loan_master WHERE id = ?", [id]),
  remove: (id: number) => runAsync("DELETE FROM loan_master WHERE id = ?", [id]),
  upsert: async (loan: Loan) => {
    if (loan.id) {
      await runAsync(
        `UPDATE loan_master SET loan_type=?, holder_name=?, bank_name=?, account_number=?, start_date=?, end_date=?, principal_amount=?, interest_rate=?, repayment_type=?, emi_amount=?, outstanding_principal=?, bullet_closure_amount=?, status=?, notes=? WHERE id=?`,
        [
          loan.loan_type, loan.holder_name, loan.bank_name, loan.account_number, loan.start_date, loan.end_date,
          loan.principal_amount, loan.interest_rate, loan.repayment_type, loan.emi_amount ?? null, loan.outstanding_principal,
          loan.bullet_closure_amount ?? null, loan.status, loan.notes ?? null, loan.id,
        ],
      );
      return loan.id;
    }
    return runAsync(
      `INSERT INTO loan_master (loan_type, holder_name, bank_name, account_number, start_date, end_date, principal_amount, interest_rate, repayment_type, emi_amount, outstanding_principal, bullet_closure_amount, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        loan.loan_type, loan.holder_name, loan.bank_name, loan.account_number, loan.start_date, loan.end_date,
        loan.principal_amount, loan.interest_rate, loan.repayment_type, loan.emi_amount ?? null, loan.outstanding_principal,
        loan.bullet_closure_amount ?? null, loan.status, loan.notes ?? null,
      ],
    );
  },
};
