import dayjs from "dayjs";
import { getAsync, runAsync } from "@/database/helpers";

export const hasSeededData = async (): Promise<boolean> => {
  await runAsync("INSERT OR IGNORE INTO app_meta (key, value) VALUES ('seeded', 'false')");
  const result = await getAsync<{ value: string }>("SELECT value FROM app_meta WHERE key='seeded'");
  return result?.value === "true";
};

const resetTables = async () => {
  await runAsync("DELETE FROM alerts");
  await runAsync("DELETE FROM incentive_tracker");
  await runAsync("DELETE FROM fd_loan_link");
  await runAsync("DELETE FROM fd_master");
  await runAsync("DELETE FROM loan_master");
};

export const seedSampleData = async (): Promise<void> => {
  await resetTables();
  const today = dayjs();

  await runAsync(
    `INSERT INTO loan_master (id, loan_type, holder_name, bank_name, account_number, start_date, end_date, principal_amount, interest_rate, repayment_type, emi_amount, outstanding_principal, bullet_closure_amount, status, notes)
     VALUES
      (1,'LAP','Sreejith','HDFC Bank','LAP9031', ?, ?, 4200000, 10.4, 'EMI', 82850, 2870000, NULL, 'active', 'Property backed LAP'),
      (2,'OD Against FD','Sreejith','ICICI Bank','OD1142', ?, ?, 1500000, 8.7, 'Bullet', NULL, 920000, 940000, 'active', 'Temporary business cashflow OD')
    `,
    [today.subtract(8, "month").format("YYYY-MM-DD"), today.add(42, "month").format("YYYY-MM-DD"), today.subtract(3, "month").format("YYYY-MM-DD"), today.add(12, "month").format("YYYY-MM-DD")],
  );

  await runAsync(
    `INSERT INTO fd_master (id, holder_name, bank_name, branch, fd_number, deposit_date, maturity_date, principal, interest_rate, tenure_days, maturity_value_expected, maturity_value_actual, payout_type, status, funding_type, linked_loan_id, reserved_for, renewal_flag, renewal_date, renewal_new_fd_amount, extra_amount_added, incentive_expected, incentive_received, notes)
    VALUES
      (1,'Sreejith','SBI','Whitefield','SBIFD001', ?, ?, 2000000, 7.2, 365, 2144000, NULL, 'Cumulative', 'active', 'Self', NULL, NULL, 0, NULL, NULL, 0, 12000, 7000, 'Primary annual FD'),
      (2,'Sreejith','ICICI Bank','HSR','ICFD902', ?, ?, 1800000, 7.6, 370, 1948000, NULL, 'Cumulative', 'active', 'Loan-Backed', 2, NULL, 0, NULL, NULL, 0, 15000, 5000, 'Linked to OD against FD'),
      (3,'Sreejith','Axis Bank','Koramangala','AXFD200', ?, ?, 1250000, 7.05, 300, 1323000, NULL, 'Monthly Interest', 'active', 'Self', NULL, 'House Renovation', 0, NULL, NULL, 0, 9000, 9000, 'Reserved fund'),
      (4,'Sreejith','HDFC Bank','Marathahalli','HDFD099', ?, ?, 950000, 7.4, 545, 1069000, NULL, 'Cumulative', 'active', 'Self', NULL, NULL, 1, ?, 1120000, 170000, 6000, 0, 'Top-up planned on renewal')
    `,
    [
      today.subtract(120, "day").format("YYYY-MM-DD"),
      today.add(245, "day").format("YYYY-MM-DD"),
      today.subtract(30, "day").format("YYYY-MM-DD"),
      today.add(58, "day").format("YYYY-MM-DD"),
      today.subtract(65, "day").format("YYYY-MM-DD"),
      today.add(25, "day").format("YYYY-MM-DD"),
      today.subtract(200, "day").format("YYYY-MM-DD"),
      today.add(6, "day").format("YYYY-MM-DD"),
      today.add(7, "day").format("YYYY-MM-DD"),
    ],
  );

  await runAsync(
    `INSERT INTO fd_loan_link (fd_id, loan_id, linked_amount, link_type, purpose, start_date, end_date, notes)
      VALUES (2, 2, 1400000, 'Primary Lien', 'Working capital bridge', ?, ?, 'Release on seasonal collection')`,
    [today.subtract(3, "month").format("YYYY-MM-DD"), today.add(6, "month").format("YYYY-MM-DD")],
  );

  await runAsync(
    `INSERT INTO incentive_tracker (fd_id, bank_name, rm_name, incentive_type, expected_amount, received_amount, pending_amount, expected_date, received_date, status, delay_days, notes)
      VALUES
      (1,'SBI','Ravi K','Festival','12000',7000,5000, ?, ?, 'partial', 0, 'Part payment received'),
      (2,'ICICI Bank','Anita S','Relationship','15000',5000,10000, ?, NULL, 'pending', 12, 'Escalated with RM'),
      (4,'HDFC Bank','Manoj P','Renewal','6000',0,6000, ?, NULL, 'overdue', 5, 'Maturity near, push follow-up')
    `,
    [
      today.subtract(25, "day").format("YYYY-MM-DD"),
      today.subtract(10, "day").format("YYYY-MM-DD"),
      today.subtract(12, "day").format("YYYY-MM-DD"),
      today.subtract(1, "day").format("YYYY-MM-DD"),
    ],
  );

  await runAsync("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('seeded', 'true')");
};
