import { formatCurrency } from "@/lib/format";

export function StatCard({ label, value, isCount = false }: { label: string; value: number; isCount?: boolean }) {
  return (
    <div className="ta-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{isCount ? value : formatCurrency(value)}</p>
    </div>
  );
}
