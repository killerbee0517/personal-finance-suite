"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type HeaderAlert = {
  id: number;
  type: string;
  title: string;
  due_date: string;
  status: string;
  message: string;
};

const nav = [
  ["Dashboard", "/dashboard"],
  ["FD Tracker", "/fds"],
  ["RD Tracker", "/rds"],
  ["Loan Tracker", "/loans"],
  ["Corporate Bonds", "/bonds"],
  ["Equity & MF", "/equity"],
  ["EPF", "/epf"],
  ["PPF", "/ppf"],
  ["Insurance", "/insurance"],
  ["Physical Assets", "/physical"],
  ["Certificates", "/certificates"],
  ["Calendar", "/calendar"],
  ["Incentive Tracker", "/incentives"],
  ["Alerts Center", "/alerts"],
  ["Settings", "/settings"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [due7, setDue7] = useState(0);
  const [overdue, setOverdue] = useState(0);
  const [alerts, setAlerts] = useState<HeaderAlert[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/alerts/summary", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setUnread(data.unread || 0);
        setDue7(data.due7 || 0);
        setOverdue(data.overdue || 0);
        setAlerts(data.recent || []);
      } catch {
        // noop
      }
    };

    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1780px] gap-4 p-3 lg:p-5">
        <aside className="hidden w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm lg:block">
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Finance Suite</p>
            <h1 className="text-xl font-bold">Personal Finance Suite</h1>
          </div>
          <nav className="space-y-1.5">
            {nav.map(([label, href]) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 lg:px-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Personal Finance Suite</p>
              </div>

              <div className="relative" ref={panelRef}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  aria-label="Notifications"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                    <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
                  </svg>
                  {unread > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : null}
                </button>

                {open ? (
                  <div className="absolute right-0 mt-2 w-[360px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">Notifications</p>
                      <Link href="/alerts" className="text-xs font-semibold text-blue-600" onClick={() => setOpen(false)}>
                        View all
                      </Link>
                    </div>

                    <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-500">Unread</p><p className="font-bold text-slate-900">{unread}</p></div>
                      <div className="rounded-lg bg-amber-50 p-2"><p className="text-amber-700">Due 7d</p><p className="font-bold text-amber-900">{due7}</p></div>
                      <div className="rounded-lg bg-rose-50 p-2"><p className="text-rose-700">Overdue</p><p className="font-bold text-rose-900">{overdue}</p></div>
                    </div>

                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {alerts.length === 0 ? (
                        <p className="text-sm text-slate-500">No alerts</p>
                      ) : (
                        alerts.map((a) => (
                          <div key={a.id} className="rounded-lg border border-slate-200 p-2.5">
                            <p className="text-xs font-semibold text-slate-900">{a.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{a.message}</p>
                            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                              <span>{a.type}</span>
                              <span>{a.due_date}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </header>
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
