import { resetDataAction } from "@/app/actions/data";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="ta-card p-4"><h2 className="font-semibold">Notification Settings</h2><p className="mt-1 text-sm text-slate-600">Desktop reminder integration placeholder.</p></div>
      <div className="ta-card p-4"><h2 className="font-semibold">Alert Threshold</h2><p className="mt-1 text-sm text-slate-600">Maturity threshold: 30 days (configurable later).</p></div>
      <div className="ta-card p-4"><h2 className="mb-2 font-semibold">Seed / Reset Sample Data</h2><form action={resetDataAction}><button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Reset & Reseed</button></form></div>
      <div className="ta-card p-4"><h2 className="font-semibold">Backup / Export</h2><p className="mt-1 text-sm text-slate-600">Future placeholder for CSV/Google Sheets backup.</p></div>
    </div>
  );
}
