import fs from "node:fs";
import path from "node:path";
import type { AlertItem, FD, FDLoanLink, Incentive, Loan } from "@/lib/models";

export type DataStore = {
  meta: { seeded: boolean };
  fd_master: FD[];
  loan_master: Loan[];
  fd_loan_link: FDLoanLink[];
  incentive_tracker: Incentive[];
  alerts: AlertItem[];
};

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "pfm.json");

export function loadStore(): DataStore {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    const blank: DataStore = { meta: { seeded: false }, fd_master: [], loan_master: [], fd_loan_link: [], incentive_tracker: [], alerts: [] };
    fs.writeFileSync(filePath, JSON.stringify(blank, null, 2));
    return blank;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as DataStore;
}

export function saveStore(store: DataStore) {
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
}

export const nextId = (items: Array<{ id: number }>) => (items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1);
