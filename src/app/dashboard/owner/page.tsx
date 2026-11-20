"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function OwnerDashboardPage() {
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/my-equipment`, { credentials: "include", cache: "no-store" })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.message); return result.data || []; })
      .then((items) => { if (active) setCounts({ total: items.length, pending: items.filter((item: { status?: string }) => !item.status || item.status === "pending").length, approved: items.filter((item: { status?: string }) => item.status === "approved").length, rejected: items.filter((item: { status?: string }) => item.status === "rejected").length }); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const cards = [["Total listings", counts.total], ["Pending review", counts.pending], ["Approved", counts.approved], ["Rejected", counts.rejected]] as const;
  return <div><p className="text-sm font-medium text-gray-500">OWNER DASHBOARD</p><h1 className="mt-1 text-3xl font-bold">Overview</h1><p className="mt-2 text-gray-600">Manage your equipment listings and rental activity.</p><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <article key={label} className="rounded-2xl border bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-3xl font-semibold">{loading ? "—" : value}</p></article>)}</div><div className="mt-7 grid gap-4 md:grid-cols-2"><Link href="/dashboard/owner/add-equipment" className="rounded-2xl bg-black p-6 text-white"><span className="text-sm text-white/70">GROW YOUR LISTINGS</span><h2 className="mt-2 text-xl font-semibold">Add equipment</h2><p className="mt-1 text-sm text-white/75">Submit a new item for admin review.</p></Link><Link href="/dashboard/owner/rentals" className="rounded-2xl border bg-white p-6"><span className="text-sm text-gray-500">RENTAL ACTIVITY</span><h2 className="mt-2 text-xl font-semibold">View equipment rentals</h2><p className="mt-1 text-sm text-gray-600">Review customer and booking details.</p></Link></div></div>;
}
