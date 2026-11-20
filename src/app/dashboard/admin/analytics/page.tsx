"use client";
import { apiFetch } from "@/lib/api-request";
import { reportError } from "@/lib/notifications";

import { useEffect, useState } from "react";

type Analytics = {
  users: number;
  equipment: number;
  bookings: number;
  approvals: number;
  completedRentals: number;
  revenue: number;
  monthlyBookings: { month: string; bookings: number }[];
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch(`${API}/api/admin/analytics`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not load admin analytics.");
        return result.data as Analytics;
      })
      .then((data) => { if (active) setAnalytics(data); })
      .catch((cause: unknown) => { if (active) setError(reportError(cause, "Could not load admin analytics.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const cards = [
    ["Registered users", analytics?.users, ""],
    ["Equipment listings", analytics?.equipment, ""],
    ["Bookings", analytics?.bookings, ""],
    ["Approved listings", analytics?.approvals, ""],
    ["Completed rentals", analytics?.completedRentals, ""],
    ["Revenue", analytics?.revenue, "৳"],
  ] as const;
  const monthly = analytics?.monthlyBookings || [];
  const maxBookings = Math.max(...monthly.map((month) => month.bookings), 1);

  return (
    <div className="space-y-8 text-zinc-950 dark:text-zinc-100">
      <header className="border-b border-stone-200/90 pb-6 dark:border-zinc-800/90">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
          Admin Telemetry
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
          Platform overview
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Operational metrics, inventory approvals, and rental volume across ShareKit.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, prefix], idx) => (
          <article
            key={label}
            className="flex flex-col justify-between border border-stone-200/90 bg-white p-6 transition-colors hover:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-600"
          >
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span>{label}</span>
              <span className="text-zinc-400 dark:text-zinc-600">0{idx + 1}</span>
            </div>
            <p className="mt-5 font-mono text-3xl font-medium tracking-tight text-zinc-950 dark:text-white">
              {loading ? "—" : `${prefix}${(value ?? 0).toLocaleString()}`}
            </p>
          </article>
        ))}
      </div>

      <section className="border border-stone-200/90 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200/80 pb-5 dark:border-zinc-800">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              12-Month Cadence
            </p>
            <h2 className="mt-1 text-xl font-medium tracking-tight text-zinc-950 dark:text-white">
              Monthly bookings
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {monthly.length ? `${monthly[0].month} — ${monthly[monthly.length - 1].month}` : ""}
          </span>
        </div>

        {loading ? (
          <p className="py-16 text-center font-mono text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Loading booking activity…
          </p>
        ) : monthly.length ? (
          <div className="mt-8 grid h-52 grid-cols-12 items-end gap-2 sm:gap-3">
            {monthly.map((month) => (
              <div
                key={month.month}
                className="group flex h-full flex-col items-center justify-end gap-2.5"
              >
                <span className="font-mono text-[10px] text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-500">
                  {month.bookings}
                </span>
                <div
                  role="img"
                  aria-label={`${month.bookings} bookings in ${month.month}`}
                  title={`${month.bookings} bookings`}
                  className="w-full border border-zinc-900/10 bg-zinc-900 transition-all duration-300 group-hover:bg-amber-600 dark:border-amber-300/20 dark:bg-amber-300 dark:group-hover:bg-amber-200"
                  style={{
                    height: `${Math.max(month.bookings ? 8 : 2, (month.bookings / maxBookings) * 100)}%`,
                  }}
                />
                <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                  {month.month.slice(5)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Monthly booking data will appear here.
          </p>
        )}
      </section>
    </div>
  );
}