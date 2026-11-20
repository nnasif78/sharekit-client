"use client";
import { apiFetch } from "@/lib/api-request";
import { reportError } from "@/lib/notifications";

import Link from "next/link";
import { useEffect, useState } from "react";

type Analytics = {
  listedEquipment: number;
  completedRentals: number;
  earnings: number;
  monthlyEarnings: { month: string; earnings: number }[];
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OwnerDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch(`${API}/api/owner/analytics`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not load your analytics.");
        return result.data as Analytics;
      })
      .then((data) => { if (active) setAnalytics(data); })
      .catch((cause: unknown) => { if (active) setError(reportError(cause, "Could not load your analytics.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const cards = [
    ["Listed equipment", analytics?.listedEquipment, ""],
    ["Completed rentals", analytics?.completedRentals, ""],
    ["Total earnings", analytics?.earnings, "৳"],
  ] as const;
  const monthly = analytics?.monthlyEarnings || [];
  const maxEarnings = Math.max(...monthly.map((month) => month.earnings), 1);

  return (
    <div className="space-y-7 text-zinc-950 dark:text-zinc-100">
      <header className="border-b border-stone-200 pb-6 dark:border-zinc-800">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Owner Telemetry</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">Overview</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Your equipment, rental activity, and earnings at a glance.</p>
      </header>
      {error && <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(([label, value, prefix], idx) => (
          <article key={label} className="border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400"><span>{label}</span><span>0{idx + 1}</span></div>
            <p className="mt-5 font-mono text-3xl font-medium">{loading ? "—" : `${prefix}${(value ?? 0).toLocaleString()}`}</p>
          </article>
        ))}
      </div>
      <section className="border border-stone-200 bg-white p-5 sm:p-7 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-stone-100 pb-5 dark:border-zinc-800">
          <div><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">12-Month Cadence</p><h2 className="mt-1 text-xl font-medium">Monthly earnings</h2></div>
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{monthly.length ? `${monthly[0].month} — ${monthly[monthly.length - 1].month}` : ""}</span>
        </div>
        {loading ? <p className="py-12 text-center font-mono text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Loading earnings…</p> : monthly.length ? (
          <div className="mt-7 grid h-48 grid-cols-12 items-end gap-2">
            {monthly.map((month) => <div key={month.month} className="group flex h-full flex-col items-center justify-end gap-2">
              <span className="font-mono text-[9px] text-zinc-400 opacity-0 group-hover:opacity-100 dark:text-zinc-500">৳{month.earnings.toLocaleString()}</span>
              <div role="img" aria-label={`৳${month.earnings.toLocaleString()} earnings in ${month.month}`} title={`৳${month.earnings.toLocaleString()}`} className="w-full border border-zinc-900/10 bg-zinc-900 dark:border-amber-300/20 dark:bg-amber-300" style={{ height: `${Math.max(month.earnings ? 8 : 2, (month.earnings / maxEarnings) * 100)}%` }} />
              <span className="font-mono text-[9px] text-zinc-500 dark:text-zinc-400">{month.month.slice(5)}</span>
            </div>)}
          </div>
        ) : <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">Your monthly earnings will appear once rentals are completed.</p>}
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/owner/add-equipment" className="border border-zinc-950 bg-zinc-950 p-6 text-white dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950"><span className="font-mono text-[10px] uppercase tracking-widest opacity-70">Grow your listings</span><h2 className="mt-2 text-xl font-medium">Add equipment</h2><p className="mt-1 text-sm opacity-75">Submit a new item for admin review.</p></Link>
        <Link href="/dashboard/owner/rentals" className="border border-stone-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60"><span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Rental activity</span><h2 className="mt-2 text-xl font-medium">View equipment rentals</h2><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Review customer and booking details.</p></Link>
      </div>
    </div>
  );
}
