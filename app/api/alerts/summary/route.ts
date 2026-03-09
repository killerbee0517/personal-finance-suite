import dayjs from "dayjs";
import { NextResponse } from "next/server";
import { ensureInitialized } from "@/lib/init";
import { repo } from "@/lib/services";

export async function GET() {
  const ready = await ensureInitialized();
  if (!ready) {
    return NextResponse.json({ ok: false, message: "DB not connected" }, { status: 503 });
  }

  const alerts = await repo.listAlerts();
  const today = dayjs();
  const unread = alerts.filter((a) => a.status !== "resolved").length;
  const overdue = alerts.filter((a) => dayjs(a.due_date).isBefore(today, "day") || a.status === "overdue").length;
  const due7 = alerts.filter((a) => {
    const d = dayjs(a.due_date).diff(today, "day");
    return d >= 0 && d <= 7;
  }).length;

  const recent = alerts
    .slice(0, 12)
    .map((a) => ({
      id: a.id,
      type: a.alert_type,
      title: a.title,
      due_date: a.due_date,
      status: a.status,
      message: a.message,
    }));

  return NextResponse.json({ ok: true, unread, overdue, due7, recent });
}
