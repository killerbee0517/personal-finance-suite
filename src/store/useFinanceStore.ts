import { create } from "zustand";
import { AlertItem, DashboardMetrics, FD, FDLoanLink, Incentive, Loan } from "@/types/models";
import { runMigrations } from "@/database/migrations";
import { fdRepository } from "@/database/repositories/fdRepository";
import { loanRepository } from "@/database/repositories/loanRepository";
import { fdLoanLinkRepository } from "@/database/repositories/fdLoanLinkRepository";
import { incentiveRepository } from "@/database/repositories/incentiveRepository";
import { alertRepository } from "@/database/repositories/alertRepository";
import { buildDashboardMetrics } from "@/services/calculationService";
import { generateAlerts } from "@/services/alertService";
import { hasSeededData, seedSampleData } from "@/services/seedService";
import { scheduleAlertNotifications } from "@/services/notificationService";

interface FinanceState {
  ready: boolean;
  loading: boolean;
  fds: FD[];
  loans: Loan[];
  links: FDLoanLink[];
  incentives: Incentive[];
  alerts: AlertItem[];
  metrics: DashboardMetrics;
  init: () => Promise<void>;
  refreshAll: () => Promise<void>;
  saveFD: (fd: FD) => Promise<void>;
  saveLoan: (loan: Loan) => Promise<void>;
  resetAndSeed: () => Promise<void>;
}

const emptyMetrics: DashboardMetrics = {
  totalAssets: 0,
  totalLiabilities: 0,
  netWorth: 0,
  investableWealth: 0,
  activeFDValue: 0,
  loanBackedDeposits: 0,
  reservedDeposits: 0,
  pendingIncentives: 0,
  estimatedSpreadIncome: 0,
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  ready: false,
  loading: false,
  fds: [],
  loans: [],
  links: [],
  incentives: [],
  alerts: [],
  metrics: emptyMetrics,

  init: async () => {
    set({ loading: true });
    await runMigrations();
    const seeded = await hasSeededData();
    if (!seeded) await seedSampleData();
    await get().refreshAll();
    set({ ready: true, loading: false });
  },

  refreshAll: async () => {
    const [fds, loans, links, incentives] = await Promise.all([
      fdRepository.list(),
      loanRepository.list(),
      fdLoanLinkRepository.list(),
      incentiveRepository.list(),
    ]);
    const generatedAlerts = generateAlerts(fds, loans, links, incentives);
    await alertRepository.clearAll();
    for (const alert of generatedAlerts) await alertRepository.upsert(alert);
    const alerts = await alertRepository.list();
    await scheduleAlertNotifications(alerts);
    set({
      fds,
      loans,
      links,
      incentives,
      alerts,
      metrics: buildDashboardMetrics(fds, loans, links, incentives),
    });
  },

  saveFD: async (fd) => {
    await fdRepository.upsert(fd);
    await get().refreshAll();
  },

  saveLoan: async (loan) => {
    await loanRepository.upsert(loan);
    await get().refreshAll();
  },

  resetAndSeed: async () => {
    set({ loading: true });
    await seedSampleData();
    await get().refreshAll();
    set({ loading: false });
  },
}));
