import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export function StatCard({
  label,
  value,
  valueType = "currency",
  href,
  asOf,
  note,
}: {
  label: string;
  value: number;
  valueType?: "currency" | "count" | "percent";
  href?: string;
  asOf?: string;
  note?: string;
}) {
  const display =
    !Number.isFinite(value)
      ? "-"
      : valueType === "count"
        ? `${value}`
        : valueType === "percent"
          ? `${value.toFixed(2)}%`
          : formatCurrency(value);

  const content = (
    <div className="ta-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        {asOf ? <p className="text-[11px] text-muted-foreground">As of {asOf}</p> : null}
      </div>
      <p className="mt-2 text-[2.1rem] font-bold leading-none text-foreground">{display}</p>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );

  if (!href) return content;
  return <Link href={href} className="block transition hover:scale-[1.01]">{content}</Link>;
}
