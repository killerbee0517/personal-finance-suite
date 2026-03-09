# Personal Finance Suite (Next.js + TailAdmin-style UI)

Desktop-first personal finance suite with TailAdmin-style UI, MySQL storage, and local calculations.

## Tech Stack

- Next.js (App Router) + TypeScript
- MUI (Material UI) dashboard layout (TailAdmin-style)
- MySQL (`mysql2`)
- Zod validations + server actions
- dayjs

## Modules

- Dashboard
- FD Tracker
- RD Tracker
- Loan Tracker
- Corporate Bonds (GoldenPi/Wint-style coupon schedule)
- Equity & Mutual Funds (CAS CSV/TXT import)
- EPF Tracker
- PPF Tracker
- Insurance Tracker
- Calendar (unified reminders)
- Incentive Tracker
- Alerts Center
- Settings

## Business Rules Implemented

- Net worth = total assets - total liabilities
- Investable wealth = total assets - total liabilities - loan-backed deposits - reserved deposits
- Loan-backed FDs included in total assets, excluded from investable wealth
- Reserved FDs/RDs excluded from investable wealth
- Incentive pending = expected - received
- Spread = FD rate - linked loan rate
- Spread income = linked amount × spread / 100

## Data Model

Tables created automatically:

- `fd_master`
- `loan_master`
- `rd_master`
- `bond_master`
- `bond_coupon_schedule`
- `fd_loan_link`
- `incentive_tracker`
- `equity_holdings`
- `equity_transactions`
- `cas_import_runs`
- `epf_accounts`
- `ppf_accounts`
- `insurance_policies`
- `alerts`
- `app_meta`

## MySQL Setup

Option A: Local MySQL service.

Option B: Docker MySQL:

```bash
docker run --name pfm-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=personal_finance_desktop -p 3306:3306 -d mysql:8.0
```

Copy env file:

```bash
copy .env.example .env.local
```

Set `.env.local`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=personal_finance_desktop
```

App auto-creates schema and seeds realistic sample data on first load.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

## CAS Upload Format

Current ingestion supports CSV/TXT (not direct PDF in this version).

Each line must be one of:

```txt
HOLDING,Source,stock|mutual_fund,Instrument,Symbol,ISIN,FolioOrAccount,Qty,AvgCost,CurrentValue,ValuationDate
TXN,Source,stock|mutual_fund,Instrument,Symbol,ISIN,TxnType,TxnDate,Qty,Price,Amount,FolioOrAccount
```

Example:

```txt
HOLDING,CAMS,mutual_fund,Parag Parikh Flexi Cap Direct Growth,,INF879O01027,FOLIO-1,210.12,58.10,16318.00,2026-03-08
HOLDING,CDSL,stock,Infosys Ltd,INFY,INE009A01021,DP-001,35,1410,58975,2026-03-08
TXN,CAMS,mutual_fund,Parag Parikh Flexi Cap Direct Growth,,INF879O01027,PURCHASE,2026-02-10,12.54,58.00,727.32,FOLIO-1
```

## Notes

- If MySQL is unreachable, pages show DB connection warning.
- Use Settings to reset and reseed sample data.
- Bond save regenerates coupon schedule based on frequency/date.


