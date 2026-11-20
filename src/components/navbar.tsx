"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch, clearAccessToken } from "@/lib/api-request";
import ThemeToggle from "@/components/theme-toggle";
import { notifySuccess, reportError } from "@/lib/notifications";

type AccountProfile = {
  name: string;
  email: string;
  image: string;
  role: string;
};

type SessionAccount = {
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
  role?: string;
};

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
  const [profileResult, setProfileResult] = useState<{
    accountId: string;
    profile: AccountProfile;
  } | null>(null);
  const [profileOpenPath, setProfileOpenPath] = useState<string | null>(null);
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState("");
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const sessionUser = session?.user as SessionAccount | undefined;
  const accountId = sessionUser?.id || sessionUser?.email || "";
  const sessionProfile =
    session && sessionUser
      ? {
          name: sessionUser.name || "ShareKit member",
          email: sessionUser.email || "",
          image: sessionUser.image || "",
          role: sessionUser.role || "customer",
        }
      : null;
  const profile = sessionProfile
    ? profileResult?.accountId === accountId
      ? profileResult.profile
      : sessionProfile
    : null;
  const profileOpen = profileOpenPath === pathname;
  const mobileOpen = mobileOpenPath === pathname;

  useEffect(() => {
    if (!session || !sessionUser || pathname === "/unauthorized" || pathname === "/forbidden") return;
    let active = true;

    apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/profile`,
      { cache: "no-store" }
    )
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load account details.");
        }
        return result.data as AccountProfile;
      })
      .then((data) => {
        if (active) setProfileResult({ accountId, profile: data });
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Navigation profile fetch error:", error);
          reportError(error, "Could not load account details.");
        }
      });

    return () => {
      active = false;
    };
  }, [accountId, pathname, session, sessionUser]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileOpenPath(null);
      }
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
      if (result.error) {
        throw new Error(result.error.message || "Could not sign out.");
      }
      clearAccessToken();
      setProfileOpenPath(null);
      notifySuccess("Signed out.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(reportError(error, "Could not sign out."));
    }
  };

  const role = profile?.role || sessionUser?.role || "customer";
  const initials = (profile?.name || "ShareKit")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const navLinks = [
    { href: "/equipment", label: "Explore" },
    { href: "/#how-it-works", label: "How it works" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-[#F7F6F2]/85 text-zinc-950 backdrop-blur-md transition-colors duration-300 dark:border-zinc-800/90 dark:bg-zinc-950/85 dark:text-zinc-100">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 md:px-10"
        aria-label="Main navigation"
      >

        <Link
          href="/"
          aria-label="ShareKit home"
          className="flex shrink-0 items-center gap-2.5 text-base font-medium tracking-tight text-zinc-950 dark:text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center overflow-hidden border border-stone-300 bg-white dark:border-zinc-700">
            <Image
              src="/sharekit-icon.png"
              alt=""
              width={24}
              height={24}
              unoptimized
              priority
              className="h-5 w-5 object-contain"
            />
          </span>
          <span>
            sharekit<span className="text-amber-600 dark:text-amber-300">.</span>
          </span>
        </Link>


        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((item) => {
            const active =
              item.href === "/equipment" && pathname.startsWith("/equipment");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-mono text-xs uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950 dark:focus-visible:outline-amber-300 ${
                  active
                    ? "font-medium text-zinc-950 dark:text-white"
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {session && (
            <Link
              href={dashboardHref(role)}
              className={`font-mono text-xs uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950 dark:focus-visible:outline-amber-300 ${
                pathname.startsWith("/dashboard")
                  ? "font-medium text-zinc-950 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>


        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          {isPending ? (
            <span
              className="h-8 w-8 animate-pulse border border-stone-300 bg-stone-200/70 dark:border-zinc-800 dark:bg-zinc-800"
              aria-label="Loading account"
            />
          ) : session && profile ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                aria-expanded={profileOpen}
                aria-controls="account-dropdown"
                onClick={() =>
                  setProfileOpenPath(profileOpen ? null : pathname)
                }
                className={`flex items-center gap-2.5 border px-2.5 py-1.5 text-left font-mono text-xs uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-amber-300 ${
                  profileOpen
                    ? "border-zinc-950 bg-white dark:border-amber-300 dark:bg-zinc-900"
                    : "border-stone-300/90 bg-white/80 hover:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-600"
                }`}
              >
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden bg-zinc-950 font-mono text-[10px] font-medium text-white dark:bg-amber-300 dark:text-zinc-950">
                  <span>{initials}</span>
                  {profile.image && (
                    <img
                      src={profile.image}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </span>

                <span className="hidden leading-none sm:block">
                  <strong className="block max-w-[120px] truncate text-xs font-medium text-zinc-950 dark:text-zinc-100">
                    {profile.name}
                  </strong>
                  <small className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {profile.role}
                  </small>
                </span>

                <ChevronDown
                  size={14}
                  className={`text-zinc-500 transition-transform duration-200 dark:text-zinc-400 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div
                  id="account-dropdown"
                  className="absolute right-0 mt-2 w-68 border border-stone-200 bg-white/95 p-2 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95"
                >
                  <div className="flex items-center gap-3 border-b border-stone-100 px-3 py-2.5 dark:border-zinc-800/90">
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden bg-zinc-950 font-mono text-xs font-medium text-white dark:bg-amber-300 dark:text-zinc-950">
                      <span>{initials}</span>
                      {profile.image && (
                        <img
                          src={profile.image}
                          alt=""
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-medium text-zinc-950 dark:text-white">
                        {profile.name}
                      </strong>
                      <small className="block truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                        {profile.email}
                      </small>
                    </div>
                  </div>

                  <div className="px-3 pt-2 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                    {profile.role} account
                  </div>

                  <div className="flex flex-col">
                    <Link
                      href={dashboardHref(role)}
                      onClick={() => setProfileOpenPath(null)}
                      className="flex items-center justify-between px-3 py-2 font-mono text-xs uppercase tracking-wider text-zinc-700 transition-colors hover:bg-stone-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white dark:focus-visible:outline-amber-300"
                    >
                      <span className="flex items-center gap-2.5">
                        <LayoutDashboard size={15} strokeWidth={1.75} />
                        Dashboard
                      </span>
                      <span className="font-mono text-xs text-zinc-400">
                        ›
                      </span>
                    </Link>

                    <Link
                      href={profileHref(role)}
                      onClick={() => setProfileOpenPath(null)}
                      className="flex items-center justify-between px-3 py-2 font-mono text-xs uppercase tracking-wider text-zinc-700 transition-colors hover:bg-stone-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white dark:focus-visible:outline-amber-300"
                    >
                      <span className="flex items-center gap-2.5">
                        <Settings size={15} strokeWidth={1.75} />
                        Account settings
                      </span>
                      <span className="font-mono text-xs text-zinc-400">
                        ›
                      </span>
                    </Link>
                  </div>

                  {logoutError && (
                    <p
                      role="alert"
                      className="mx-3 mt-1.5 border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300"
                    >
                      {logoutError}
                    </p>
                  )}

                  <div className="mt-1.5 border-t border-stone-100 pt-1.5 dark:border-zinc-800/90">
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-red-600 transition-colors hover:bg-red-50/70 focus-visible:outline-2 focus-visible:outline-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:focus-visible:outline-red-300"
                    >
                      <LogOut size={15} strokeWidth={1.75} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : session ? (
            <span
              className="h-8 w-8 animate-pulse border border-stone-300 bg-stone-200/70 dark:border-zinc-800 dark:bg-zinc-800"
              aria-label="Loading profile"
            />
          ) : (
            <div className="hidden items-center gap-2.5 md:flex">
              <Link
                href="/login"
                className="px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-zinc-700 transition-colors hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-zinc-950 dark:text-zinc-300 dark:hover:text-white dark:focus-visible:outline-amber-300"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 border border-zinc-950 bg-zinc-950 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200 dark:focus-visible:outline-amber-300"
              >
                <span>Join ShareKit</span>
                <ArrowUpRight size={14} strokeWidth={2} />
              </Link>
            </div>
          )}


          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpenPath(mobileOpen ? null : pathname)}
            className="inline-flex h-9 w-9 items-center justify-center border border-stone-300 bg-white text-zinc-900 transition-colors hover:border-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus-visible:outline-amber-300 md:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>


      {mobileOpen && (
        <div className="border-t border-stone-200 bg-[#F7F6F2] px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpenPath(null)}
                className="border-b border-stone-200/70 py-3 font-mono text-xs uppercase tracking-wider text-zinc-800 focus-visible:outline-2 focus-visible:outline-zinc-950 dark:border-zinc-800/70 dark:text-zinc-200 dark:focus-visible:outline-amber-300"
              >
                {item.label}
              </Link>
            ))}

            {session ? (
              <Link
                href={dashboardHref(role)}
                onClick={() => setMobileOpenPath(null)}
                className="py-3 font-mono text-xs uppercase tracking-wider text-zinc-950 focus-visible:outline-2 focus-visible:outline-zinc-950 dark:text-amber-300 dark:focus-visible:outline-amber-300"
              >
                My dashboard
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpenPath(null)}
                  className="flex items-center justify-center border border-stone-300 bg-white px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-zinc-900 focus-visible:outline-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus-visible:outline-amber-300"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpenPath(null)}
                  className="flex items-center justify-center border border-zinc-950 bg-zinc-950 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white focus-visible:outline-2 focus-visible:outline-zinc-950 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:focus-visible:outline-amber-300"
                >
                  Create an account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}