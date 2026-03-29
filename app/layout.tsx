import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Personal Finance Suite",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const pathname = h.get("x-pfm-pathname") || "/";
  const isLoginRoute = pathname === "/login" || pathname.startsWith("/login/");

  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  if (!isLoginRoute && !user) {
    redirect("/login");
  }
  if (isLoginRoute && user) {
    redirect(isSuperAdmin(user) ? "/users" : "/dashboard");
  }

  return (
    <html lang="en">
      <body>
        <AppShell role={user?.role}>{children}</AppShell>
      </body>
    </html>
  );
}
