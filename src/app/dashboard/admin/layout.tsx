"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

const links = [
  ["Overview", "/dashboard/admin/analytics"],
  ["All Users", "/dashboard/admin/users"],
  ["All Equipment", "/dashboard/admin/equipment"],
  ["All Rentals", "/dashboard/admin/rentals"],
  ["My Profile", "/dashboard/admin/profile"],
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  useEffect(() => {
    if (!isPending && !session) router.replace(`/login?callbackURL=${encodeURIComponent(pathname)}`);
  }, [isPending, pathname, router, session]);

  if (isPending || !session) return <main className="dashboard-loading">Loading admin dashboard…</main>;
  if (role !== "admin") return <main className="dashboard-access"><h1>Admin access required</h1><p>Your account does not have administrator access.</p></main>;

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <p className="dashboard-sidebar-title">Admin dashboard</p>
        <nav className="dashboard-sidebar-nav" aria-label="Admin dashboard">
          {links.map(([label, href]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`dashboard-nav-link ${active ? "is-active" : ""}`}>{label}</Link>;
          })}
        </nav>
      </aside>
      <section className="dashboard-content">{children}</section>
    </div>
  );
}
