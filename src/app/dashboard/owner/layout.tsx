"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

const links = [
  ["Overview", "/dashboard/owner"],
  ["Add Equipment", "/dashboard/owner/add-equipment"],
  ["My Equipment", "/dashboard/owner/my-equipment"],
  ["My Equipment Rentals", "/dashboard/owner/rentals"],
  ["My Profile", "/dashboard/owner/profile"],
] as const;

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  useEffect(() => {
    if (!isPending && !session) router.replace(`/login?callbackURL=${encodeURIComponent(pathname)}`);
  }, [isPending, pathname, router, session]);

  if (isPending || !session) return <main className="dashboard-loading">Loading owner dashboard…</main>;
  if (role !== "owner") return <main className="dashboard-access"><h1>Owner access required</h1><p>Your account does not have the owner role yet. Contact an administrator to enable owner access.</p></main>;

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <p className="dashboard-sidebar-title">Owner dashboard</p>
        <nav className="dashboard-sidebar-nav" aria-label="Owner dashboard">
          {links.map(([label, href]) => {
            const active = pathname === href || (href !== "/dashboard/owner" && pathname.startsWith(`${href}/`));
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`dashboard-nav-link ${active ? "is-active" : ""}`}>{label}</Link>;
          })}
        </nav>
      </aside>
      <section className="dashboard-content">{children}</section>
    </div>
  );
}
