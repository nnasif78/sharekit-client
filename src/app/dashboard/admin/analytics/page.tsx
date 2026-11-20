"use client";
import { apiFetch } from "@/lib/api-request";

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
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load admin analytics."); })
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
    <div>
      <p className="text-sm font-medium text-gray-500">ADMIN DASHBOARD</p>
      <h1 className="mt-1 text-3xl font-bold">Platform overview</h1>
      <p className="mt-2 text-gray-600">A clear view of ShareKit activity and growth.</p>
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, prefix]) => <article key={label} className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "—" : `${prefix}${(value ?? 0).toLocaleString()}`}</p>
        </article>)}
      </div>
      <section className="mt-7 rounded-2xl border bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-lg font-semibold">Monthly bookings</h2><p className="mt-1 text-sm text-gray-500">Booking volume over the last 12 months</p></div>
          <span className="text-xs text-gray-500">{monthly.length ? `${monthly[0].month} — ${monthly[monthly.length - 1].month}` : ""}</span>
        </div>
        {loading ? <p className="py-12 text-center text-sm text-gray-500">Loading booking activity…</p> : monthly.length ? (
          <div className="mt-7 grid h-48 grid-cols-12 items-end gap-2">
            {monthly.map((month) => <div key={month.month} className="flex h-full flex-col items-center justify-end gap-2">
              <div role="img" aria-label={`${month.bookings} bookings in ${month.month}`} title={`${month.bookings} bookings`} className="w-full rounded-t-md bg-emerald-700/80 transition-all" style={{ height: `${Math.max(month.bookings ? 8 : 2, (month.bookings / maxBookings) * 100)}%` }} />
              <span className="text-[9px] text-gray-500">{month.month.slice(5)}</span>
            </div>)}
          </div>
        ) : <p className="py-12 text-center text-sm text-gray-500">Monthly booking data will appear here.</p>}
      </section>
    </div>
  );
}
