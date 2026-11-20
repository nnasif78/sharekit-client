"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch, clearAccessToken } from "@/lib/api-request";
import ThemeToggle from "@/components/theme-toggle";

type AccountProfile = {
  name: string;
  email: string;
  image: string;
  role: string;
};

type SessionAccount = { id?: string; name?: string; email?: string; image?: string | null; role?: string };

const dashboardHref = (role: string) => {
  if (role === "admin") return "/dashboard/admin";
  if (role === "owner") return "/dashboard/owner";
  return "/dashboard/customer";
};

const profileHref = (role: string) => `${dashboardHref(role)}/profile`;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [profileResult, setProfileResult] = useState<{ accountId: string; profile: AccountProfile } | null>(null);
  const [profileOpenPath, setProfileOpenPath] = useState<string | null>(null);
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState("");
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const sessionUser = session?.user as SessionAccount | undefined;
  const accountId = sessionUser?.id || sessionUser?.email || "";
  const sessionProfile = session && sessionUser ? {
    name: sessionUser.name || "ShareKit member",
    email: sessionUser.email || "",
    image: sessionUser.image || "",
    role: sessionUser.role || "customer",
  } : null;
  const profile = sessionProfile
    ? profileResult?.accountId === accountId ? profileResult.profile : sessionProfile
    : null;
  const profileOpen = profileOpenPath === pathname;
  const mobileOpen = mobileOpenPath === pathname;

  useEffect(() => {
    if (!session || !sessionUser) return;
    let active = true;

    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/profile`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not load account details.");
        return result.data as AccountProfile;
      })
      .then((data) => {
        if (active) setProfileResult({ accountId, profile: data });
      })
      .catch((error: unknown) => {
        if (active) console.error("Navigation profile fetch error:", error);
      });

    return () => { active = false; };
  }, [accountId, pathname, session, sessionUser]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileOpenPath(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpenPath(null);
        setMobileOpenPath(null);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const handleLogout = async () => {
    setLogoutError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message || "Could not sign out.");
      clearAccessToken();
      setProfileOpenPath(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Could not sign out.");
    }
  };

  const role = profile?.role || sessionUser?.role || "customer";
  const initials = (profile?.name || "ShareKit")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/" className="site-brand" aria-label="ShareKit home">
          <span className="site-brand-mark">s<span>k</span></span>
          <span>sharekit<span className="site-brand-period">.</span></span>
        </Link>

        <div className={`site-nav-links ${mobileOpen ? "is-open" : ""}`}>
          <Link href="/equipment" onClick={() => setMobileOpenPath(null)}>Explore</Link>
          <Link href="/#how-it-works" onClick={() => setMobileOpenPath(null)}>How it works</Link>
          <Link href="/register#owner" onClick={() => setMobileOpenPath(null)}>List your gear</Link>
          {session && <Link className="site-nav-mobile-dashboard" href={dashboardHref(role)} onClick={() => setMobileOpenPath(null)}>My dashboard</Link>}
          {!session && <>
            <Link className="site-nav-mobile-auth" href="/login" onClick={() => setMobileOpenPath(null)}>Log in</Link>
            <Link className="site-nav-mobile-auth" href="/register" onClick={() => setMobileOpenPath(null)}>Create an account</Link>
          </>}
        </div>

        <div className="site-nav-actions">
          <ThemeToggle />
          {isPending ? <span className="site-nav-loading" aria-label="Loading account" /> : session && profile ? (
            <div className="account-menu" ref={profileMenuRef}>
              <button
                type="button"
                className={`account-trigger ${profileOpen ? "is-open" : ""}`}
                aria-expanded={profileOpen}
                aria-controls="account-dropdown"
                onClick={() => setProfileOpenPath(profileOpen ? null : pathname)}
              >
                <span className="account-avatar">
                  <span>{initials}</span>
                  {profile.image && <img src={profile.image} alt="" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />}
                </span>
                <span className="account-trigger-copy">
                  <strong>{profile.name}</strong>
                  <small>{profile.role}</small>
                </span>
                <ChevronDown size={15} className="account-chevron" />
              </button>
              {profileOpen && <div className="account-dropdown" id="account-dropdown">
                <div className="account-dropdown-heading">
                  <span className="account-avatar account-avatar-large">
                    <span>{initials}</span>
                    {profile.image && <img src={profile.image} alt="" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />}
                  </span>
                  <span><strong>{profile.name}</strong><small>{profile.email}</small></span>
                </div>
                <div className="account-dropdown-role">{profile.role} account</div>
                <Link href={dashboardHref(role)} onClick={() => setProfileOpenPath(null)}><LayoutDashboard size={16} /> Dashboard <span>›</span></Link>
                <Link href={profileHref(role)} onClick={() => setProfileOpenPath(null)}><Settings size={16} /> Account settings <span>›</span></Link>
                {logoutError && <p className="account-menu-error" role="alert">{logoutError}</p>}
                <button className="account-logout" onClick={() => void handleLogout()}><LogOut size={16} /> Sign out</button>
              </div>}
            </div>
          ) : session ? (
            <span className="site-nav-loading" aria-label="Loading profile" />
          ) : (
            <>
              <Link href="/login" className="site-nav-login">Log in</Link>
              <Link href="/register" className="site-nav-join">Join ShareKit <span aria-hidden="true">↗</span></Link>
            </>
          )}
          <button
            type="button"
            className="site-mobile-menu"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpenPath(mobileOpen ? null : pathname)}
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>
    </header>
  );
}
