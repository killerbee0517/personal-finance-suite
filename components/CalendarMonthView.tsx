"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";

type EventItem = { date: string; type: string; title: string; detail: string };

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const chipStyle: Record<string, string> = {
  insurance: "bg-blue-100 text-blue-800",
  ppf: "bg-emerald-100 text-emerald-800",
  fd_maturity_due: "bg-violet-100 text-violet-800",
  reserved_fd_maturing: "bg-rose-100 text-rose-800",
  rd_maturity_due: "bg-indigo-100 text-indigo-800",
  loan_due: "bg-amber-100 text-amber-800",
  bond_coupon_due: "bg-cyan-100 text-cyan-800",
  bond_maturity_due: "bg-fuchsia-100 text-fuchsia-800",
  incentive_overdue: "bg-red-100 text-red-800",
  insurance_premium_due: "bg-sky-100 text-sky-800",
  ppf_contribution_due: "bg-green-100 text-green-800",
  epf_interest_check: "bg-teal-100 text-teal-800",
  negative_spread: "bg-orange-100 text-orange-800",
};

export function CalendarMonthView({ events }: { events: EventItem[] }) {
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) {
      const key = dayjs(e.date).format("YYYY-MM-DD");
      const arr = map.get(key) || [];
      arr.push(e);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const start = month.startOf("month").startOf("week");
  const end = month.endOf("month").endOf("week");
  const days: dayjs.Dayjs[] = [];
  let cursor = start;
  while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
    days.push(cursor);
    cursor = cursor.add(1, "day");
  }

  const selectedEvents = eventsByDate.get(selectedDate) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{month.format("MMMM YYYY")}</h2>
        <div className="flex gap-2">
          <button className="ta-btn-outline" onClick={() => setMonth((m) => m.subtract(1, "month"))}>Prev</button>
          <button className="ta-btn-outline" onClick={() => { const now = dayjs().startOf("month"); setMonth(now); setSelectedDate(dayjs().format("YYYY-MM-DD")); }}>Today</button>
          <button className="ta-btn-outline" onClick={() => setMonth((m) => m.add(1, "month"))}>Next</button>
        </div>
      </div>

      <div className="ta-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekdays.map((w) => (
            <div key={w} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((d) => {
            const key = d.format("YYYY-MM-DD");
            const dayEvents = eventsByDate.get(key) || [];
            const inMonth = d.month() === month.month();
            const isToday = d.isSame(dayjs(), "day");
            const isSelected = key === selectedDate;
            return (
              <button
                key={key}
                onClick={() => setSelectedDate(key)}
                className={`min-h-[120px] border-b border-r border-slate-100 p-2 text-left align-top transition ${isSelected ? "bg-blue-50" : "bg-white hover:bg-slate-50"}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? "bg-blue-600 text-white" : inMonth ? "text-slate-800" : "text-slate-400"}`}>
                    {d.date()}
                  </span>
                  {dayEvents.length > 0 ? <span className="text-[10px] font-semibold text-slate-500">{dayEvents.length}</span> : null}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <div key={`${key}-${i}`} className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${chipStyle[e.type] || "bg-slate-100 text-slate-700"}`}>
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 ? <div className="text-[10px] text-slate-500">+{dayEvents.length - 3} more</div> : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ta-card p-4">
        <p className="mb-2 text-sm font-semibold">Events on {dayjs(selectedDate).format("DD MMM YYYY")}</p>
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-slate-500">No events for this date.</p>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((e, i) => (
              <div key={`${selectedDate}-${i}`} className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold">{e.title}</p>
                <p className="text-xs text-slate-500">{e.type}</p>
                <p className="mt-1 text-sm text-slate-700">{e.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

