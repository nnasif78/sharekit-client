"use client";

import { useEffect, useState } from "react";

type Rental = { _id: string; equipmentName: string; startDate?: string; endDate?: string; bookingDate?: string; totalAmount?: number; paymentStatus?: string; status?: string };
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const date = (value?: string) => value ? new Date(value).toLocaleDateString() : "—";
export default function CustomerRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; fetch(`${API}/api/customer/rentals`, { credentials: "include", cache: "no-store" }).then(async (r) => { const result = await r.json(); if (!r.ok || !result.success) throw new Error(result.message || "Could not load rentals."); return result.data || []; }).then((data) => { if (active) setRentals(data); }).catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : "Could not load rentals."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  return <div><p className="text-sm font-medium text-gray-500">CUSTOMER DASHBOARD</p><h1 className="mt-1 text-3xl font-bold">My Rentals</h1><p className="mt-2 text-gray-600">Track your equipment bookings and payment status.</p>{error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-6 overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Equipment Name", "Rental Start Date", "Rental End Date", "Booking Date", "Total Amount", "Payment Status", "Booking Status"].map((h) => <th className="px-4 py-3" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y">{rentals.map((r) => <tr key={r._id}><td className="px-4 py-4 font-medium">{r.equipmentName}</td><td className="px-4 py-4">{date(r.startDate)}</td><td className="px-4 py-4">{date(r.endDate)}</td><td className="px-4 py-4">{date(r.bookingDate)}</td><td className="px-4 py-4">{r.totalAmount == null ? "—" : `৳${r.totalAmount.toLocaleString()}`}</td><td className="px-4 py-4">{r.paymentStatus || "Pending"}</td><td className="px-4 py-4">{r.status || "Pending"}</td></tr>)}</tbody></table>{loading ? <p className="p-10 text-center text-gray-500">Loading rentals…</p> : !rentals.length && <p className="p-10 text-center text-gray-500">You have no rental bookings yet.</p>}</div></div>;
}
