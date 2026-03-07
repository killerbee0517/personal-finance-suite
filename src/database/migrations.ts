import { getDb } from "./client";

const SQL = `
CREATE TABLE IF NOT EXISTS fd_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch TEXT,
  fd_number TEXT NOT NULL,
  deposit_date TEXT NOT NULL,
  maturity_date TEXT NOT NULL,
  principal REAL NOT NULL,
  interest_rate REAL NOT NULL,
  tenure_days INTEGER NOT NULL,
  maturity_value_expected REAL NOT NULL,
  maturity_value_actual REAL,
  payout_type TEXT,
  status TEXT NOT NULL,
  funding_type TEXT,
  linked_loan_id INTEGER,
  reserved_for TEXT,
  renewal_flag INTEGER DEFAULT 0,
  renewal_date TEXT,
  renewal_new_fd_amount REAL,
  extra_amount_added REAL,
  incentive_expected REAL,
  incentive_received REAL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS loan_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  loan_type TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  principal_amount REAL NOT NULL,
  interest_rate REAL NOT NULL,
  repayment_type TEXT NOT NULL,
  emi_amount REAL,
  outstanding_principal REAL NOT NULL,
  bullet_closure_amount REAL,
  status TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS fd_loan_link (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fd_id INTEGER NOT NULL,
  loan_id INTEGER NOT NULL,
  linked_amount REAL NOT NULL,
  link_type TEXT,
  purpose TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS incentive_tracker (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fd_id INTEGER NOT NULL,
  bank_name TEXT NOT NULL,
  rm_name TEXT,
  incentive_type TEXT,
  expected_amount REAL NOT NULL,
  received_amount REAL NOT NULL,
  pending_amount REAL NOT NULL,
  expected_date TEXT NOT NULL,
  received_date TEXT,
  status TEXT NOT NULL,
  delay_days INTEGER NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT NOT NULL,
  related_entity_id INTEGER NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export const runMigrations = async (): Promise<void> => {
  const db = await getDb();
  await db.execAsync(SQL);
};
