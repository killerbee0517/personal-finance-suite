# Personal Finance Mobile

Android-first personal finance tracker built with Expo React Native + TypeScript.

## Features

- Offline-first local storage with `expo-sqlite`
- Dashboard with asset/liability/net worth/investable wealth metrics
- FD Tracker with filters, detail view, and add/edit form
- Loan Tracker with filters, detail view, and add/edit form
- Incentive Tracker with status filters and top summaries
- Alerts Center grouped by time windows
- Local notification scheduling via `expo-notifications`
- Zustand store with calculation and alert generation services
- Sample seed data for instant testing

## Tech Stack

- Expo + React Native + TypeScript
- `expo-router`
- `expo-sqlite`
- `expo-notifications`
- Zustand
- React Hook Form + Zod
- dayjs

## Run

1. Install dependencies
```bash
npm install
```

2. Start Expo
```bash
npm run start
```

3. Run Android
```bash
npm run android
```

## App Modules

- Dashboard
- FD Tracker
- Loan Tracker
- Incentive Tracker
- Alerts Center
- Settings

## Core Business Rules Implemented

- Net worth = total assets - total liabilities
- Investable wealth = total assets - total liabilities - loan-backed deposits - reserved deposits
- Loan-backed FDs included in total assets, excluded from investable wealth
- Reserved deposits excluded from investable wealth
- Incentive pending = expected - received
- Spread = FD rate - linked loan rate
- Spread income = linked amount × spread / 100

## Project Structure

```text
app/
  (tabs)/
  fd/
  loan/
src/
  components/
  constants/
  database/
    repositories/
  hooks/
  services/
  store/
  types/
  utils/
```

## Notes

- Local SQLite is the primary source of truth.
- Google Sheets backup/export is intentionally not included yet.
- Sample data can be reset from Settings.
personal-finance-mobile
