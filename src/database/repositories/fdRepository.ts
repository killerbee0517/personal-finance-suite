import { FD } from "@/types/models";
import { allAsync, getAsync, runAsync } from "../helpers";

export const fdRepository = {
  list: () => allAsync<FD>("SELECT * FROM fd_master ORDER BY maturity_date ASC"),
  getById: (id: number) => getAsync<FD>("SELECT * FROM fd_master WHERE id = ?", [id]),
  remove: (id: number) => runAsync("DELETE FROM fd_master WHERE id = ?", [id]),
  upsert: async (fd: FD) => {
    if (fd.id) {
      await runAsync(
        `UPDATE fd_master SET holder_name=?, bank_name=?, branch=?, fd_number=?, deposit_date=?, maturity_date=?, principal=?, interest_rate=?, tenure_days=?, maturity_value_expected=?, maturity_value_actual=?, payout_type=?, status=?, funding_type=?, linked_loan_id=?, reserved_for=?, renewal_flag=?, renewal_date=?, renewal_new_fd_amount=?, extra_amount_added=?, incentive_expected=?, incentive_received=?, notes=? WHERE id=?`,
        [
          fd.holder_name, fd.bank_name, fd.branch, fd.fd_number, fd.deposit_date, fd.maturity_date, fd.principal,
          fd.interest_rate, fd.tenure_days, fd.maturity_value_expected, fd.maturity_value_actual ?? null, fd.payout_type,
          fd.status, fd.funding_type, fd.linked_loan_id ?? null, fd.reserved_for ?? null, fd.renewal_flag, fd.renewal_date ?? null,
          fd.renewal_new_fd_amount ?? null, fd.extra_amount_added ?? null, fd.incentive_expected ?? null,
          fd.incentive_received ?? null, fd.notes ?? null, fd.id,
        ],
      );
      return fd.id;
    }
    return runAsync(
      `INSERT INTO fd_master (holder_name, bank_name, branch, fd_number, deposit_date, maturity_date, principal, interest_rate, tenure_days, maturity_value_expected, maturity_value_actual, payout_type, status, funding_type, linked_loan_id, reserved_for, renewal_flag, renewal_date, renewal_new_fd_amount, extra_amount_added, incentive_expected, incentive_received, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fd.holder_name, fd.bank_name, fd.branch, fd.fd_number, fd.deposit_date, fd.maturity_date, fd.principal,
        fd.interest_rate, fd.tenure_days, fd.maturity_value_expected, fd.maturity_value_actual ?? null, fd.payout_type,
        fd.status, fd.funding_type, fd.linked_loan_id ?? null, fd.reserved_for ?? null, fd.renewal_flag, fd.renewal_date ?? null,
        fd.renewal_new_fd_amount ?? null, fd.extra_amount_added ?? null, fd.incentive_expected ?? null,
        fd.incentive_received ?? null, fd.notes ?? null,
      ],
    );
  },
};
