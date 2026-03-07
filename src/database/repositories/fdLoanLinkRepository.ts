import { FDLoanLink } from "@/types/models";
import { allAsync, runAsync } from "../helpers";

export const fdLoanLinkRepository = {
  list: () => allAsync<FDLoanLink>("SELECT * FROM fd_loan_link ORDER BY start_date DESC"),
  listByFD: (fdId: number) => allAsync<FDLoanLink>("SELECT * FROM fd_loan_link WHERE fd_id = ?", [fdId]),
  listByLoan: (loanId: number) => allAsync<FDLoanLink>("SELECT * FROM fd_loan_link WHERE loan_id = ?", [loanId]),
  removeByFD: (fdId: number) => runAsync("DELETE FROM fd_loan_link WHERE fd_id = ?", [fdId]),
  upsert: async (link: FDLoanLink) => {
    if (link.id) {
      await runAsync(
        `UPDATE fd_loan_link SET fd_id=?, loan_id=?, linked_amount=?, link_type=?, purpose=?, start_date=?, end_date=?, notes=? WHERE id=?`,
        [link.fd_id, link.loan_id, link.linked_amount, link.link_type, link.purpose ?? null, link.start_date, link.end_date ?? null, link.notes ?? null, link.id],
      );
      return link.id;
    }
    return runAsync(
      `INSERT INTO fd_loan_link (fd_id, loan_id, linked_amount, link_type, purpose, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [link.fd_id, link.loan_id, link.linked_amount, link.link_type, link.purpose ?? null, link.start_date, link.end_date ?? null, link.notes ?? null],
    );
  },
};
