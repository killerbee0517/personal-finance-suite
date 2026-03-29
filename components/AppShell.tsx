"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { platformNav, routes, tenantNav } from "@/lib/routes";
import {
  Award,
  Bell,
  Building2,
  Calculator,
  CalendarDays,
  CreditCard,
  DollarSign,
  FileText,
  Gem,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  Repeat,
  Settings,
  Shield,
  TrendingUp,
  User,
  UserCog,
  Users,
} from "lucide-react";

type HeaderAlert = {
  id: number;
  type: string;
  title: string;
  due_date: string;
  status: string;
  message: string;
};

export function AppShell({ children, role }: { children: React.ReactNode; role?: string }) {
  const pathname = usePathname();
  if (pathname === routes.login) return <>{children}</>;
  const isPlatformAdmin = role === "super_admin";
  const nav = isPlatformAdmin ? platformNav : tenantNav;
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [due7, setDue7] = useState(0);
  const [overdue, setOverdue] = useState(0);
  const [alerts, setAlerts] = useState<HeaderAlert[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const routeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
    "/dashboard": LayoutDashboard,
    "/fds": Landmark,
    "/rds": Repeat,
    "/loans": CreditCard,
    "/bonds": Building2,
    "/equity": TrendingUp,
    "/epf": PiggyBank,
    "/ppf": PiggyBank,
    "/insurance": Shield,
    "/physical": Gem,
    "/certificates": Award,
    "/calendar": CalendarDays,
    "/calculators": Calculator,
    "/cashflows": DollarSign,
    "/incentives": FileText,
    "/alerts": Bell,
    "/family": Users,
    "/profile": User,
    "/settings": Settings,
    "/users": UserCog,
  };

  useEffect(() => {
    if (isPlatformAdmin) return;
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
  }, [isPlatformAdmin]);

  const markRead = async (id: number) => {
    try {
      const res = await fetch("/api/alerts/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) return;
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setUnread((u) => Math.max(u - 1, 0));
    } catch {
      // noop
    }
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-[#e5e7eb] bg-white text-card-foreground lg:flex lg:flex-col">
          <div className="p-6 border-b border-[#e5e7eb] bg-gradient-to-r from-blue-600 to-indigo-600">
            <p className="text-[11px] uppercase tracking-[0.14em] text-blue-100">Finance Suite</p>
            <h1 className="text-xl font-bold text-white">Personal Finance Suite</h1>
          </div>
          <div className="flex-1 p-4">
          <nav className="space-y-1">
            {nav.map(([label, href]) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={false}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {(() => {
                    const Icon = routeIcon[href] || LayoutDashboard;
                    return <Icon className={`h-4 w-4 ${active ? "text-slate-900" : "text-slate-500"}`} />;
                  })()}
                  {label}
                </Link>
              );
            })}
          </nav>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          <header className="sticky top-0 z-10 border-b border-[#e5e7eb] bg-white">
            <div className="flex items-center justify-between px-4 py-3 lg:px-8">
              <div>
                <p className="text-[34px] font-bold leading-none text-[#0f172a]">Welcome back!</p>
                <p className="mt-1 text-sm text-[#64748b]">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>

              <div className="flex items-center gap-2">
                <Link href={routes.profile} className="ta-btn-outline text-xs">Profile</Link>
                {!isPlatformAdmin ? <Link href={routes.family} className="ta-btn-outline text-xs">Family</Link> : null}
                <Link href={routes.logout} prefetch={false} className="ta-btn-outline text-xs">Logout</Link>

                {!isPlatformAdmin ? <div className="relative" ref={panelRef}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe1ea] bg-white text-[#334155] hover:bg-[#f8fafc]"
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
                  <div className="absolute right-0 mt-2 w-[360px] rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">Notifications</p>
                      <Link href={routes.alerts} className="text-xs font-semibold text-blue-600" onClick={() => setOpen(false)}>
                        View all
                      </Link>
                    </div>

                    <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-2"><p className="text-[#64748b]">Unread</p><p className="font-bold text-[#0f172a]">{unread}</p></div>
                      <div className="rounded-lg border border-[#e5e7eb] bg-[#eef6ff] p-2"><p className="text-[#1e40af]">Due 7d</p><p className="font-bold text-[#1e3a8a]">{due7}</p></div>
                      <div className="rounded-lg border border-[#fee2e2] bg-[#fff1f2] p-2"><p className="text-[#b91c1c]">Overdue</p><p className="font-bold text-[#991b1b]">{overdue}</p></div>
                    </div>

                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {alerts.length === 0 ? (
                        <p className="text-sm text-[#64748b]">No alerts</p>
                      ) : (
                        alerts.map((a) => (
                          <div key={a.id} className="rounded-lg border border-[#e5e7eb] bg-white p-2.5">
                            <p className="text-xs font-semibold text-[#0f172a]">{a.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-[#64748b]">{a.message}</p>
                            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#64748b]">
                              <span>{a.type}</span>
                              <span>{a.due_date}</span>
                            </div>
                            {a.status !== "read" ? (
                              <button className="mt-2 text-[11px] font-semibold text-blue-600 hover:underline" onClick={() => markRead(a.id)}>
                                Mark as read
                              </button>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
                </div> : null}
              </div>
            </div>
          </header>
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
