"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import ThemeToggle from "@/components/theme-toggle";
import { clearAccessToken } from "@/lib/api-request";

export default function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    clearAccessToken();
    router.push("/login");
    router.refresh();
  };

  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/" className="site-brand" aria-label="ShareKit home">
          <span className="site-brand-mark">s<span>k</span></span>
          <span>sharekit<span className="site-brand-period">.</span></span>
        </Link>
        <div className="site-nav-links">
          <Link href="/equipment">Explore</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/register#owner">List your gear</Link>
        </div>
        <div className="site-nav-actions">
          <ThemeToggle />
          {isPending ? <span className="site-nav-loading" aria-label="Loading account" /> : session ? (
            <>
              {role === "owner" && <Link className="site-nav-dashboard" href="/dashboard/owner">Dashboard</Link>}
              {role === "admin" && <Link className="site-nav-dashboard" href="/dashboard/admin">Dashboard</Link>}
              {role === "customer" && <Link className="site-nav-dashboard" href="/dashboard/customer">Dashboard</Link>}
              <button onClick={handleLogout} className="site-nav-login">Log out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="site-nav-login">Log in</Link>
              <Link href="/register" className="site-nav-join">Join ShareKit <span aria-hidden="true">↗</span></Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
