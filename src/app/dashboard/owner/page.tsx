"use client";
import { apiFetch } from "@/lib/api-request";

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
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load your analytics."); })
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
    <div>
      <p className="text-sm font-medium text-gray-500">OWNER DASHBOARD</p>
      <h1 className="mt-1 text-3xl font-bold">Overview</h1>
      <p className="mt-2 text-gray-600">Your equipment, rental activity, and earnings at a glance.</p>
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {cards.map(([label, value, prefix]) => (
          <article key={label} className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{loading ? "—" : `${prefix}${(value ?? 0).toLocaleString()}`}</p>
          </article>
        ))}
      </div>
      <section className="mt-7 rounded-2xl border bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-lg font-semibold">Monthly earnings</h2><p className="mt-1 text-sm text-gray-500">Completed rentals over the last 12 months</p></div>
          <span className="text-xs text-gray-500">{monthly.length ? `${monthly[0].month} — ${monthly[monthly.length - 1].month}` : ""}</span>
        </div>
        {loading ? <p className="py-12 text-center text-sm text-gray-500">Loading earnings…</p> : monthly.length ? (
          <div className="mt-7 grid h-48 grid-cols-12 items-end gap-2">
            {monthly.map((month) => <div key={month.month} className="flex h-full flex-col items-center justify-end gap-2">
              <div title={`৳${month.earnings.toLocaleString()}`} className="w-full rounded-t-md bg-emerald-700/80 transition-all" style={{ height: `${Math.max(month.earnings ? 8 : 2, (month.earnings / maxEarnings) * 100)}%` }} />
              <span className="text-[9px] text-gray-500">{month.month.slice(5)}</span>
            </div>)}
          </div>
        ) : <p className="py-12 text-center text-sm text-gray-500">Your monthly earnings will appear once rentals are completed.</p>}
      </section>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/owner/add-equipment" className="rounded-2xl bg-black p-6 text-white"><span className="text-sm text-white/70">GROW YOUR LISTINGS</span><h2 className="mt-2 text-xl font-semibold">Add equipment</h2><p className="mt-1 text-sm text-white/75">Submit a new item for admin review.</p></Link>
        <Link href="/dashboard/owner/rentals" className="rounded-2xl border bg-white p-6"><span className="text-sm text-gray-500">RENTAL ACTIVITY</span><h2 className="mt-2 text-xl font-semibold">View equipment rentals</h2><p className="mt-1 text-sm text-gray-600">Review customer and booking details.</p></Link>
      </div>
    </div>
  );
}
