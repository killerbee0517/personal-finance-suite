import { Incentive } from "@/types/models";
import { allAsync, getAsync, runAsync } from "../helpers";

export const incentiveRepository = {
  list: () => allAsync<Incentive>("SELECT * FROM incentive_tracker ORDER BY expected_date ASC"),
  listByFD: (fdId: number) => allAsync<Incentive>("SELECT * FROM incentive_tracker WHERE fd_id = ?", [fdId]),
  getById: (id: number) => getAsync<Incentive>("SELECT * FROM incentive_tracker WHERE id = ?", [id]),
  remove: (id: number) => runAsync("DELETE FROM incentive_tracker WHERE id = ?", [id]),
  upsert: async (incentive: Incentive) => {
    if (incentive.id) {
      await runAsync(
        `UPDATE incentive_tracker SET fd_id=?, bank_name=?, rm_name=?, incentive_type=?, expected_amount=?, received_amount=?, pending_amount=?, expected_date=?, received_date=?, status=?, delay_days=?, notes=? WHERE id=?`,
        [
          incentive.fd_id, incentive.bank_name, incentive.rm_name ?? null, incentive.incentive_type, incentive.expected_amount,
          incentive.received_amount, incentive.pending_amount, incentive.expected_date, incentive.received_date ?? null,
          incentive.status, incentive.delay_days, incentive.notes ?? null, incentive.id,
        ],
      );
      return incentive.id;
    }
    return runAsync(
      `INSERT INTO incentive_tracker (fd_id, bank_name, rm_name, incentive_type, expected_amount, received_amount, pending_amount, expected_date, received_date, status, delay_days, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        incentive.fd_id, incentive.bank_name, incentive.rm_name ?? null, incentive.incentive_type, incentive.expected_amount,
        incentive.received_amount, incentive.pending_amount, incentive.expected_date, incentive.received_date ?? null,
        incentive.status, incentive.delay_days, incentive.notes ?? null,
      ],
    );
  },
};
