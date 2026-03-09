import dayjs from "dayjs";
import { adminPool, dbName, pool } from "@/lib/db";

let initialized = false;

async function ensureColumnExists(tableName: string, columnName: string, definition: string) {
  const [rows] = (await pool.query(
    `SELECT COUNT(*) AS c
     FROM information_schema.columns
     WHERE table_schema = ?
       AND table_name = ?
       AND column_name = ?`,
    [dbName, tableName, columnName],
  )) as [Array<{ c: number }>, unknown];

  if (rows[0]?.c === 0) {
    await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${definition}`);
  }
}

export async function ensureInitialized() {
  if (initialized) return true;

  try {
    await adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);

    await pool.query(`CREATE TABLE IF NOT EXISTS fd_master (
      id INT AUTO_INCREMENT PRIMARY KEY,
      instrument_type VARCHAR(60) NOT NULL DEFAULT 'fd',
      holder_name VARCHAR(120) NOT NULL,
      bank_name VARCHAR(120) NOT NULL,
      branch VARCHAR(120),
      fd_number VARCHAR(120) NOT NULL,
      deposit_date DATE NOT NULL,
      maturity_date DATE NOT NULL,
      principal DOUBLE NOT NULL,
      interest_rate DOUBLE NOT NULL,
      tenure_days INT NOT NULL,
      maturity_value_expected DOUBLE NOT NULL,
      maturity_value_actual DOUBLE NULL,
      payout_type VARCHAR(80),
      status VARCHAR(40) NOT NULL,
      funding_type VARCHAR(80),
      linked_loan_id INT NULL,
      reserved_for VARCHAR(160) NULL,
      renewal_flag TINYINT DEFAULT 0,
      renewal_from_fd_id INT NULL,
      renewal_date DATE NULL,
      renewal_new_fd_amount DOUBLE NULL,
      extra_amount_added DOUBLE NULL,
      incentive_expected DOUBLE NULL,
      incentive_received DOUBLE NULL,
      certificate_received TINYINT NOT NULL DEFAULT 0,
      certificate_received_date DATE NULL,
      raised_by_name VARCHAR(120) NULL,
      raised_by_contact VARCHAR(120) NULL,
      raised_under_name VARCHAR(120) NULL,
      nominee_name VARCHAR(120) NULL,
      remarks TEXT NULL,
      notes TEXT NULL
    )`);

    await ensureColumnExists("fd_master", "instrument_type", "instrument_type VARCHAR(60) NOT NULL DEFAULT 'fd'");
    await ensureColumnExists("fd_master", "renewal_from_fd_id", "renewal_from_fd_id INT NULL");
    await ensureColumnExists("fd_master", "certificate_received", "certificate_received TINYINT NOT NULL DEFAULT 0");
    await ensureColumnExists("fd_master", "certificate_received_date", "certificate_received_date DATE NULL");
    await ensureColumnExists("fd_master", "raised_by_name", "raised_by_name VARCHAR(120) NULL");
    await ensureColumnExists("fd_master", "raised_by_contact", "raised_by_contact VARCHAR(120) NULL");
    await ensureColumnExists("fd_master", "raised_under_name", "raised_under_name VARCHAR(120) NULL");
    await ensureColumnExists("fd_master", "nominee_name", "nominee_name VARCHAR(120) NULL");
    await ensureColumnExists("fd_master", "remarks", "remarks TEXT NULL");

    await pool.query(`CREATE TABLE IF NOT EXISTS loan_master (
      id INT AUTO_INCREMENT PRIMARY KEY,
      loan_type VARCHAR(80) NOT NULL,
      holder_name VARCHAR(120) NOT NULL,
      bank_name VARCHAR(120) NOT NULL,
      account_number VARCHAR(120) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      principal_amount DOUBLE NOT NULL,
      interest_rate DOUBLE NOT NULL,
      repayment_type VARCHAR(80) NOT NULL,
      emi_amount DOUBLE NULL,
      outstanding_principal DOUBLE NOT NULL,
      bullet_closure_amount DOUBLE NULL,
      status VARCHAR(40) NOT NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS rd_master (
      id INT AUTO_INCREMENT PRIMARY KEY,
      holder_name VARCHAR(120) NOT NULL,
      bank_name VARCHAR(120) NOT NULL,
      branch VARCHAR(120),
      rd_number VARCHAR(120) NOT NULL,
      start_date DATE NOT NULL,
      maturity_date DATE NOT NULL,
      monthly_installment DOUBLE NOT NULL,
      total_installments INT NOT NULL,
      installments_paid INT NOT NULL,
      interest_rate DOUBLE NOT NULL,
      maturity_value_expected DOUBLE NOT NULL,
      maturity_value_actual DOUBLE NULL,
      status VARCHAR(40) NOT NULL,
      reserved_for VARCHAR(160) NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS bond_master (
      id INT AUTO_INCREMENT PRIMARY KEY,
      platform VARCHAR(80) NOT NULL,
      issuer_name VARCHAR(160) NOT NULL,
      bond_name VARCHAR(200) NOT NULL,
      isin VARCHAR(40) NOT NULL,
      holder_name VARCHAR(120) NOT NULL,
      investment_date DATE NOT NULL,
      maturity_date DATE NOT NULL,
      principal_invested DOUBLE NOT NULL,
      face_value DOUBLE NOT NULL,
      coupon_rate DOUBLE NOT NULL,
      payout_frequency VARCHAR(40) NOT NULL,
      payout_day INT NOT NULL,
      units DOUBLE NOT NULL,
      status VARCHAR(40) NOT NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS bond_coupon_schedule (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bond_id INT NOT NULL,
      due_date DATE NOT NULL,
      expected_amount DOUBLE NOT NULL,
      received_amount DOUBLE NOT NULL,
      status VARCHAR(40) NOT NULL,
      received_date DATE NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS epf_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employer_name VARCHAR(160) NOT NULL,
      uan VARCHAR(60) NOT NULL,
      member_id VARCHAR(80) NOT NULL,
      current_balance DOUBLE NOT NULL,
      employee_monthly DOUBLE NOT NULL,
      employer_monthly DOUBLE NOT NULL,
      interest_rate DOUBLE NOT NULL,
      last_interest_credit_date DATE NOT NULL,
      status VARCHAR(40) NOT NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS ppf_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bank_name VARCHAR(120) NOT NULL,
      account_number VARCHAR(80) NOT NULL,
      holder_name VARCHAR(120) NOT NULL,
      start_date DATE NOT NULL,
      maturity_date DATE NOT NULL,
      extension_years INT NOT NULL,
      current_balance DOUBLE NOT NULL,
      contribution_this_fy DOUBLE NOT NULL,
      target_contribution_fy DOUBLE NOT NULL,
      fy_deadline_date DATE NOT NULL,
      last_contribution_date DATE NULL,
      status VARCHAR(40) NOT NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS insurance_policies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      policy_type VARCHAR(80) NOT NULL,
      insurer_name VARCHAR(160) NOT NULL,
      policy_number VARCHAR(120) NOT NULL,
      holder_name VARCHAR(120) NOT NULL,
      sum_assured DOUBLE NOT NULL,
      premium_amount DOUBLE NOT NULL,
      premium_frequency VARCHAR(40) NOT NULL,
      next_due_date DATE NOT NULL,
      grace_days INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NULL,
      nominee_name VARCHAR(120) NULL,
      status VARCHAR(40) NOT NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS physical_assets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_type VARCHAR(80) NOT NULL,
      asset_name VARCHAR(160) NOT NULL,
      holder_name VARCHAR(120) NOT NULL,
      quantity DOUBLE NOT NULL,
      unit VARCHAR(20) NOT NULL,
      purchase_date DATE NOT NULL,
      purchase_rate DOUBLE NOT NULL,
      current_rate DOUBLE NOT NULL,
      purchase_value DOUBLE NOT NULL,
      current_value DOUBLE NOT NULL,
      status VARCHAR(40) NOT NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS fd_loan_link (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fd_id INT NOT NULL,
      loan_id INT NOT NULL,
      linked_amount DOUBLE NOT NULL,
      link_type VARCHAR(80),
      purpose VARCHAR(160) NULL,
      start_date DATE NOT NULL,
      end_date DATE NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS incentive_tracker (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fd_id INT NOT NULL,
      bank_name VARCHAR(120) NOT NULL,
      rm_name VARCHAR(120) NULL,
      incentive_type VARCHAR(80),
      expected_amount DOUBLE NOT NULL,
      received_amount DOUBLE NOT NULL,
      pending_amount DOUBLE NOT NULL,
      expected_date DATE NOT NULL,
      received_date DATE NULL,
      status VARCHAR(40) NOT NULL,
      delay_days INT NOT NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS equity_holdings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      source VARCHAR(120) NOT NULL,
      asset_type VARCHAR(40) NOT NULL,
      folio_or_account VARCHAR(160) NULL,
      instrument_name VARCHAR(240) NOT NULL,
      symbol VARCHAR(40) NULL,
      isin VARCHAR(40) NULL,
      quantity DOUBLE NOT NULL,
      average_cost DOUBLE NOT NULL,
      invested_value DOUBLE NOT NULL,
      current_value DOUBLE NOT NULL,
      valuation_date DATE NOT NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS equity_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      source VARCHAR(120) NOT NULL,
      asset_type VARCHAR(40) NOT NULL,
      instrument_name VARCHAR(240) NOT NULL,
      symbol VARCHAR(40) NULL,
      isin VARCHAR(40) NULL,
      txn_type VARCHAR(40) NOT NULL,
      txn_date DATE NOT NULL,
      quantity DOUBLE NOT NULL,
      price DOUBLE NOT NULL,
      amount DOUBLE NOT NULL,
      folio_or_account VARCHAR(160) NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS cas_import_runs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      file_name VARCHAR(200) NOT NULL,
      imported_at DATETIME NOT NULL,
      records_count INT NOT NULL,
      notes TEXT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS alerts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      alert_type VARCHAR(80) NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      related_entity_type VARCHAR(80) NOT NULL,
      related_entity_id INT NOT NULL,
      due_date DATE NOT NULL,
      status VARCHAR(40) NOT NULL,
      created_at DATE NOT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS app_meta (
      \`key\` VARCHAR(80) PRIMARY KEY,
      \`value\` VARCHAR(120) NOT NULL
    )`);

    const [rows] = (await pool.query("SELECT value FROM app_meta WHERE `key`='seeded'")) as [Array<{ value: string }>, unknown];
    if (!rows.length || rows[0].value !== "true") {
      await resetSeedData();
    }

    const [backfillRows] = (await pool.query("SELECT value FROM app_meta WHERE `key`='backfill_v1'")) as [Array<{ value: string }>, unknown];
    if (!backfillRows.length || backfillRows[0].value !== "true") {
      await backfillAdditionalSeedData();
      await pool.query("INSERT INTO app_meta (`key`,`value`) VALUES ('backfill_v1','true') ON DUPLICATE KEY UPDATE `value`='true'");
    }

    initialized = true;
    return true;
  } catch (e) {
    console.error("DB init failed", e);
    return false;
  }
}

async function backfillAdditionalSeedData() {
  const today = dayjs();

  const [rdRows] = (await pool.query("SELECT COUNT(*) as c FROM rd_master")) as [Array<{ c: number }>, unknown];
  if (rdRows[0].c === 0) {
    await pool.query(
      `INSERT INTO rd_master (holder_name, bank_name, branch, rd_number, start_date, maturity_date, monthly_installment, total_installments, installments_paid, interest_rate, maturity_value_expected, maturity_value_actual, status, reserved_for, notes)
      VALUES
      ('Owner','SBI','Whitefield','SBIRD001', ?, ?, 25000, 24, 10, 6.9, 653200, NULL, 'active', NULL, 'Travel corpus RD'),
      ('Owner','HDFC Bank','Indiranagar','HDFRD010', ?, ?, 15000, 36, 29, 7.1, 607800, NULL, 'active', 'Tax payment', 'Reserved RD')`,
      [
        today.subtract(10, "month").format("YYYY-MM-DD"),
        today.add(14, "month").format("YYYY-MM-DD"),
        today.subtract(29, "month").format("YYYY-MM-DD"),
        today.add(7, "month").format("YYYY-MM-DD"),
      ],
    );
  }

  const [bondRows] = (await pool.query("SELECT COUNT(*) as c FROM bond_master")) as [Array<{ c: number }>, unknown];
  if (bondRows[0].c === 0) {
    await pool.query(
      `INSERT INTO bond_master (platform, issuer_name, bond_name, isin, holder_name, investment_date, maturity_date, principal_invested, face_value, coupon_rate, payout_frequency, payout_day, units, status, notes)
      VALUES
      ('GoldenPi','Navi Finserv','Navi Secured NCD 2028','INE0AAA01010','Owner', ?, ?, 1000000, 1000, 10.25, 'monthly', 7, 1000, 'active', 'Monthly coupon payout'),
      ('Wint Wealth','Muthoot Capital','Muthoot Bond 2029','INE0BBB01022','Owner', ?, ?, 750000, 1000, 11.1, 'monthly', 15, 750, 'active', 'Monthly coupon payout')`,
      [
        today.subtract(4, "month").format("YYYY-MM-DD"),
        today.add(26, "month").format("YYYY-MM-DD"),
        today.subtract(7, "month").format("YYYY-MM-DD"),
        today.add(34, "month").format("YYYY-MM-DD"),
      ],
    );
  }

  const [couponRows] = (await pool.query("SELECT COUNT(*) as c FROM bond_coupon_schedule")) as [Array<{ c: number }>, unknown];
  if (couponRows[0].c === 0) {
    const [bonds] = (await pool.query("SELECT id FROM bond_master ORDER BY id ASC LIMIT 2")) as [Array<{ id: number }>, unknown];
    if (bonds.length >= 2) {
      await pool.query(
        `INSERT INTO bond_coupon_schedule (bond_id, due_date, expected_amount, received_amount, status, received_date, notes)
        VALUES
        (?, ?, 8542, 8542, 'received', ?, NULL),
        (?, ?, 8542, 0, 'pending', NULL, 'Not yet credited'),
        (?, ?, 6938, 6938, 'received', ?, NULL),
        (?, ?, 6938, 0, 'pending', NULL, 'Expected this month')`,
        [
          bonds[0].id,
          today.subtract(1, "month").date(7).format("YYYY-MM-DD"),
          today.subtract(1, "month").date(8).format("YYYY-MM-DD"),
          bonds[0].id,
          today.date(7).format("YYYY-MM-DD"),
          bonds[1].id,
          today.subtract(1, "month").date(15).format("YYYY-MM-DD"),
          today.subtract(1, "month").date(16).format("YYYY-MM-DD"),
          bonds[1].id,
          today.date(15).format("YYYY-MM-DD"),
        ],
      );
    }
  }

  const [equityRows] = (await pool.query("SELECT COUNT(*) as c FROM equity_holdings")) as [Array<{ c: number }>, unknown];
  if (equityRows[0].c === 0) {
    await pool.query(
      `INSERT INTO equity_holdings (source, asset_type, folio_or_account, instrument_name, symbol, isin, quantity, average_cost, invested_value, current_value, valuation_date, notes)
      VALUES
      ('CAS Seed','stock','DP-001','Infosys Ltd','INFY','INE009A01021',35,1410,49350,58975,?,NULL),
      ('CAS Seed','stock','DP-001','HDFC Bank Ltd','HDFCBANK','INE040A01034',20,1475,29500,32600,?,NULL),
      ('CAS Seed','mutual_fund','FOLIO-AXIS-1','Axis Small Cap Fund Direct Growth',NULL,'INF846K01EW2',422.53,68.2,28817,33902,?,NULL)`,
      [today.format("YYYY-MM-DD"), today.format("YYYY-MM-DD"), today.format("YYYY-MM-DD")],
    );
  }

  const [epfRows] = (await pool.query("SELECT COUNT(*) as c FROM epf_accounts")) as [Array<{ c: number }>, unknown];
  if (epfRows[0].c === 0) {
    await pool.query(
      `INSERT INTO epf_accounts (employer_name, uan, member_id, current_balance, employee_monthly, employer_monthly, interest_rate, last_interest_credit_date, status, notes)
      VALUES ('ABC Tech Pvt Ltd','100233445566','KA/BAN/EPF/9087',1245000,21600,21600,8.15, ?, 'active', 'Primary EPF account')`,
      [today.subtract(11, "month").endOf("month").format("YYYY-MM-DD")],
    );
  }

  const [ppfRows] = (await pool.query("SELECT COUNT(*) as c FROM ppf_accounts")) as [Array<{ c: number }>, unknown];
  if (ppfRows[0].c === 0) {
    await pool.query(
      `INSERT INTO ppf_accounts (bank_name, account_number, holder_name, start_date, maturity_date, extension_years, current_balance, contribution_this_fy, target_contribution_fy, fy_deadline_date, last_contribution_date, status, notes)
      VALUES ('SBI','PPF008761','Owner', ?, ?, 5, 980000, 90000, 150000, ?, ?, 'active', 'Long-term tax saver')`,
      [
        today.subtract(9, "year").format("YYYY-MM-DD"),
        today.add(6, "year").format("YYYY-MM-DD"),
        dayjs(`${today.year()}-03-31`).format("YYYY-MM-DD"),
        today.subtract(1, "month").format("YYYY-MM-DD"),
      ],
    );
  }

  const [insuranceRows] = (await pool.query("SELECT COUNT(*) as c FROM insurance_policies")) as [Array<{ c: number }>, unknown];
  if (insuranceRows[0].c === 0) {
    await pool.query(
      `INSERT INTO insurance_policies (policy_type, insurer_name, policy_number, holder_name, sum_assured, premium_amount, premium_frequency, next_due_date, grace_days, start_date, end_date, nominee_name, status, notes)
      VALUES
      ('term','HDFC Life','TERM-88911','Owner',20000000,26500,'yearly', ?, 30, ?, ?, 'Spouse', 'active', 'Pure term cover'),
      ('health','Niva Bupa','HLT-22019','Family',1000000,18250,'yearly', ?, 15, ?, NULL, 'Owner', 'active', 'Family floater')`,
      [
        today.add(18, "day").format("YYYY-MM-DD"),
        today.subtract(4, "year").format("YYYY-MM-DD"),
        today.add(26, "year").format("YYYY-MM-DD"),
        today.add(40, "day").format("YYYY-MM-DD"),
        today.subtract(2, "year").format("YYYY-MM-DD"),
      ],
    );
  }

  const [physicalRows] = (await pool.query("SELECT COUNT(*) as c FROM physical_assets")) as [Array<{ c: number }>, unknown];
  if (physicalRows[0].c === 0) {
    await pool.query(
      `INSERT INTO physical_assets (asset_type, asset_name, holder_name, quantity, unit, purchase_date, purchase_rate, current_rate, purchase_value, current_value, status, notes)
      VALUES
      ('gold','Gold Coin 24K','Owner',80,'gm', ?, 5200, 6400, 416000, 512000, 'active', 'Bought for long-term hedge'),
      ('silver','Silver Bar 999','Owner',600,'gm', ?, 62, 76, 37200, 45600, 'active', 'Wedding reserve')`,
      [today.subtract(20, "month").format("YYYY-MM-DD"), today.subtract(14, "month").format("YYYY-MM-DD")],
    );
  }
}

export async function resetSeedData() {
  await pool.query("DELETE FROM alerts");
  await pool.query("DELETE FROM insurance_policies");
  await pool.query("DELETE FROM physical_assets");
  await pool.query("DELETE FROM ppf_accounts");
  await pool.query("DELETE FROM epf_accounts");
  await pool.query("DELETE FROM bond_coupon_schedule");
  await pool.query("DELETE FROM bond_master");
  await pool.query("DELETE FROM rd_master");
  await pool.query("DELETE FROM incentive_tracker");
  await pool.query("DELETE FROM fd_loan_link");
  await pool.query("DELETE FROM fd_master");
  await pool.query("DELETE FROM loan_master");
  await pool.query("DELETE FROM equity_holdings");
  await pool.query("DELETE FROM equity_transactions");
  await pool.query("DELETE FROM cas_import_runs");

  const today = dayjs();
  await pool.query(
    `INSERT INTO loan_master (id, loan_type, holder_name, bank_name, account_number, start_date, end_date, principal_amount, interest_rate, repayment_type, emi_amount, outstanding_principal, bullet_closure_amount, status, notes) VALUES
    (1,'LAP','Owner','HDFC Bank','LAP9031', ?, ?, 4200000, 10.4, 'EMI', 82850, 2870000, NULL, 'active', 'Property backed LAP'),
    (2,'OD Against FD','Owner','ICICI Bank','OD1142', ?, ?, 1500000, 8.7, 'Bullet', NULL, 920000, 940000, 'active', 'Business cashflow OD')`,
    [
      today.subtract(8, "month").format("YYYY-MM-DD"),
      today.add(42, "month").format("YYYY-MM-DD"),
      today.subtract(3, "month").format("YYYY-MM-DD"),
      today.add(12, "month").format("YYYY-MM-DD"),
    ],
  );

  await pool.query(
    `INSERT INTO fd_master (id, instrument_type, holder_name, bank_name, branch, fd_number, deposit_date, maturity_date, principal, interest_rate, tenure_days, maturity_value_expected, maturity_value_actual, payout_type, status, funding_type, linked_loan_id, reserved_for, renewal_flag, renewal_from_fd_id, renewal_date, renewal_new_fd_amount, extra_amount_added, incentive_expected, incentive_received, certificate_received, certificate_received_date, raised_by_name, raised_by_contact, raised_under_name, nominee_name, remarks, notes)
    VALUES
    (1,'fd','Owner','SBI','Whitefield','SBIFD001', ?, ?, 2000000, 7.2, 365, 2144000, NULL, 'Cumulative', 'active', 'Self', NULL, NULL, 0, NULL, NULL, NULL, 0, 12000, 7000, 1, ?, 'Ravi K', '9876543210', 'Suresh N', 'Spouse', 'Core emergency ladder deposit', 'Primary annual FD'),
    (2,'fd','Owner','ICICI Bank','HSR','ICFD902', ?, ?, 1800000, 7.6, 370, 1948000, NULL, 'Cumulative', 'active', 'Loan-Backed', 2, NULL, 0, NULL, NULL, NULL, 0, 15000, 5000, 1, ?, 'Anita S', '9988776655', 'Anita S', 'Father', 'Lien marked against OD facility', 'Linked to OD'),
    (3,'subordinate_debt','Owner','Axis Bank','Koramangala','AXFD200', ?, ?, 1250000, 7.05, 300, 1323000, NULL, 'Monthly Interest', 'active', 'Self', NULL, 'House Renovation', 0, NULL, NULL, NULL, 0, 9000, 9000, 0, NULL, 'Deepak M', '9123456780', 'Deepak M', 'Mother', 'Reserved corpus for planned renovation', 'Reserved fund'),
    (4,'ncd','Owner','HDFC Bank','Marathahalli','HDFD099', ?, ?, 950000, 7.4, 545, 1069000, NULL, 'Cumulative', 'active', 'Self', NULL, NULL, 1, 1, ?, 1120000, 170000, 6000, 0, 1, ?, 'Manoj P', '9001122334', 'Manoj P', 'Spouse', 'Renewed with additional top-up capital', 'Top-up planned')`,
    [
      today.subtract(120, "day").format("YYYY-MM-DD"),
      today.add(245, "day").format("YYYY-MM-DD"),
      today.subtract(117, "day").format("YYYY-MM-DD"),
      today.subtract(30, "day").format("YYYY-MM-DD"),
      today.add(58, "day").format("YYYY-MM-DD"),
      today.subtract(27, "day").format("YYYY-MM-DD"),
      today.subtract(65, "day").format("YYYY-MM-DD"),
      today.add(25, "day").format("YYYY-MM-DD"),
      today.subtract(200, "day").format("YYYY-MM-DD"),
      today.add(6, "day").format("YYYY-MM-DD"),
      today.add(7, "day").format("YYYY-MM-DD"),
      today.subtract(196, "day").format("YYYY-MM-DD"),
    ],
  );

  await pool.query(
    `INSERT INTO rd_master (id, holder_name, bank_name, branch, rd_number, start_date, maturity_date, monthly_installment, total_installments, installments_paid, interest_rate, maturity_value_expected, maturity_value_actual, status, reserved_for, notes)
    VALUES
    (1,'Owner','SBI','Whitefield','SBIRD001', ?, ?, 25000, 24, 10, 6.9, 653200, NULL, 'active', NULL, 'Travel corpus RD'),
    (2,'Owner','HDFC Bank','Indiranagar','HDFRD010', ?, ?, 15000, 36, 29, 7.1, 607800, NULL, 'active', 'Tax payment', 'Reserved RD')`,
    [
      today.subtract(10, "month").format("YYYY-MM-DD"),
      today.add(14, "month").format("YYYY-MM-DD"),
      today.subtract(29, "month").format("YYYY-MM-DD"),
      today.add(7, "month").format("YYYY-MM-DD"),
    ],
  );

  await pool.query(
    `INSERT INTO bond_master (id, platform, issuer_name, bond_name, isin, holder_name, investment_date, maturity_date, principal_invested, face_value, coupon_rate, payout_frequency, payout_day, units, status, notes)
    VALUES
    (1,'GoldenPi','Navi Finserv','Navi Secured NCD 2028','INE0AAA01010','Owner', ?, ?, 1000000, 1000, 10.25, 'monthly', 7, 1000, 'active', 'Monthly coupon payout'),
    (2,'Wint Wealth','Muthoot Capital','Muthoot Bond 2029','INE0BBB01022','Owner', ?, ?, 750000, 1000, 11.1, 'monthly', 15, 750, 'active', 'Monthly coupon payout')`,
    [
      today.subtract(4, "month").format("YYYY-MM-DD"),
      today.add(26, "month").format("YYYY-MM-DD"),
      today.subtract(7, "month").format("YYYY-MM-DD"),
      today.add(34, "month").format("YYYY-MM-DD"),
    ],
  );

  await pool.query(
    `INSERT INTO bond_coupon_schedule (bond_id, due_date, expected_amount, received_amount, status, received_date, notes)
    VALUES
    (1, ?, 8542, 8542, 'received', ?, NULL),
    (1, ?, 8542, 8542, 'received', ?, NULL),
    (1, ?, 8542, 0, 'pending', NULL, 'Not yet credited'),
    (2, ?, 6938, 6938, 'received', ?, NULL),
    (2, ?, 6938, 0, 'pending', NULL, 'Expected this month')`,
    [
      today.subtract(2, "month").date(7).format("YYYY-MM-DD"),
      today.subtract(2, "month").date(8).format("YYYY-MM-DD"),
      today.subtract(1, "month").date(7).format("YYYY-MM-DD"),
      today.subtract(1, "month").date(9).format("YYYY-MM-DD"),
      today.date(7).format("YYYY-MM-DD"),
      today.subtract(2, "month").date(15).format("YYYY-MM-DD"),
      today.subtract(2, "month").date(16).format("YYYY-MM-DD"),
      today.date(15).format("YYYY-MM-DD"),
    ],
  );

  await pool.query(
    `INSERT INTO epf_accounts (id, employer_name, uan, member_id, current_balance, employee_monthly, employer_monthly, interest_rate, last_interest_credit_date, status, notes)
    VALUES
    (1,'ABC Tech Pvt Ltd','100233445566','KA/BAN/EPF/9087',1245000,21600,21600,8.15, ?, 'active', 'Primary EPF account')`,
    [today.subtract(11, "month").endOf("month").format("YYYY-MM-DD")],
  );

  await pool.query(
    `INSERT INTO ppf_accounts (id, bank_name, account_number, holder_name, start_date, maturity_date, extension_years, current_balance, contribution_this_fy, target_contribution_fy, fy_deadline_date, last_contribution_date, status, notes)
    VALUES
    (1,'SBI','PPF008761','Owner', ?, ?, 5, 980000, 90000, 150000, ?, ?, 'active', 'Long-term tax saver')`,
    [
      today.subtract(9, "year").format("YYYY-MM-DD"),
      today.add(6, "year").format("YYYY-MM-DD"),
      dayjs(`${today.year()}-03-31`).format("YYYY-MM-DD"),
      today.subtract(1, "month").format("YYYY-MM-DD"),
    ],
  );

  await pool.query(
    `INSERT INTO insurance_policies (id, policy_type, insurer_name, policy_number, holder_name, sum_assured, premium_amount, premium_frequency, next_due_date, grace_days, start_date, end_date, nominee_name, status, notes)
    VALUES
    (1,'term','HDFC Life','TERM-88911','Owner',20000000,26500,'yearly', ?, 30, ?, ?, 'Spouse', 'active', 'Pure term cover'),
    (2,'health','Niva Bupa','HLT-22019','Family',1000000,18250,'yearly', ?, 15, ?, NULL, 'Owner', 'active', 'Family floater')`,
    [
      today.add(18, "day").format("YYYY-MM-DD"),
      today.subtract(4, "year").format("YYYY-MM-DD"),
      today.add(26, "year").format("YYYY-MM-DD"),
      today.add(40, "day").format("YYYY-MM-DD"),
      today.subtract(2, "year").format("YYYY-MM-DD"),
    ],
  );

  await pool.query(
    `INSERT INTO physical_assets (id, asset_type, asset_name, holder_name, quantity, unit, purchase_date, purchase_rate, current_rate, purchase_value, current_value, status, notes)
    VALUES
    (1,'gold','Gold Coin 24K','Owner',80,'gm', ?, 5200, 6400, 416000, 512000, 'active', 'Bought for long-term hedge'),
    (2,'silver','Silver Bar 999','Owner',600,'gm', ?, 62, 76, 37200, 45600, 'active', 'Wedding reserve')`,
    [today.subtract(20, "month").format("YYYY-MM-DD"), today.subtract(14, "month").format("YYYY-MM-DD")],
  );

  await pool.query(
    `INSERT INTO fd_loan_link (id, fd_id, loan_id, linked_amount, link_type, purpose, start_date, end_date, notes)
    VALUES (1,2,2,1400000,'Primary Lien','Working capital bridge', ?, ?, 'Release on collection')`,
    [today.subtract(3, "month").format("YYYY-MM-DD"), today.add(6, "month").format("YYYY-MM-DD")],
  );

  await pool.query(
    `INSERT INTO incentive_tracker (id, fd_id, bank_name, rm_name, incentive_type, expected_amount, received_amount, pending_amount, expected_date, received_date, status, delay_days, notes)
    VALUES
    (1,1,'SBI','Ravi K','Festival',12000,7000,5000, ?, ?, 'partial', 0, 'Part payment'),
    (2,2,'ICICI Bank','Anita S','Relationship',15000,5000,10000, ?, NULL, 'pending', 12, 'Escalated'),
    (3,4,'HDFC Bank','Manoj P','Renewal',6000,0,6000, ?, NULL, 'overdue', 5, 'Maturity near')`,
    [
      today.subtract(25, "day").format("YYYY-MM-DD"),
      today.subtract(10, "day").format("YYYY-MM-DD"),
      today.subtract(12, "day").format("YYYY-MM-DD"),
      today.subtract(1, "day").format("YYYY-MM-DD"),
    ],
  );

  await pool.query(
    `INSERT INTO equity_holdings (source, asset_type, folio_or_account, instrument_name, symbol, isin, quantity, average_cost, invested_value, current_value, valuation_date, notes)
    VALUES
    ('CAS Seed','stock','DP-001','Infosys Ltd','INFY','INE009A01021',35,1410,49350,58975,?,NULL),
    ('CAS Seed','stock','DP-001','HDFC Bank Ltd','HDFCBANK','INE040A01034',20,1475,29500,32600,?,NULL),
    ('CAS Seed','mutual_fund','FOLIO-AXIS-1','Axis Small Cap Fund Direct Growth',NULL,'INF846K01EW2',422.53,68.2,28817,33902,?,NULL),
    ('CAS Seed','mutual_fund','FOLIO-PAR-2','Parag Parikh Flexi Cap Direct Growth',NULL,'INF879O01027',210.12,58.1,12208,16318,?,NULL)`,
    [today.format("YYYY-MM-DD"), today.format("YYYY-MM-DD"), today.format("YYYY-MM-DD"), today.format("YYYY-MM-DD")],
  );

  await pool.query(
    `INSERT INTO equity_transactions (source, asset_type, instrument_name, symbol, isin, txn_type, txn_date, quantity, price, amount, folio_or_account, notes)
    VALUES
    ('CAS Seed','stock','Infosys Ltd','INFY','INE009A01021','BUY', ?, 20,1320,26400,'DP-001',NULL),
    ('CAS Seed','stock','Infosys Ltd','INFY','INE009A01021','BUY', ?, 15,1530,22950,'DP-001',NULL),
    ('CAS Seed','mutual_fund','Axis Small Cap Fund Direct Growth',NULL,'INF846K01EW2','PURCHASE', ?, 82.31,67.8,5580,'FOLIO-AXIS-1',NULL),
    ('CAS Seed','mutual_fund','Parag Parikh Flexi Cap Direct Growth',NULL,'INF879O01027','PURCHASE', ?, 35.52,56.9,2021,'FOLIO-PAR-2',NULL)`,
    [
      today.subtract(6, "month").format("YYYY-MM-DD"),
      today.subtract(3, "month").format("YYYY-MM-DD"),
      today.subtract(4, "month").format("YYYY-MM-DD"),
      today.subtract(2, "month").format("YYYY-MM-DD"),
    ],
  );

  await pool.query("INSERT INTO app_meta (`key`,`value`) VALUES ('seeded','true') ON DUPLICATE KEY UPDATE `value`='true'");
  await pool.query("INSERT INTO app_meta (`key`,`value`) VALUES ('backfill_v1','true') ON DUPLICATE KEY UPDATE `value`='true'");
}
