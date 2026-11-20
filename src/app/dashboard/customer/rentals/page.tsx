"use client";

import { apiFetch } from "@/lib/api-request";
import { reportError } from "@/lib/notifications";
import { useEffect, useState } from "react";

type Rental = {
  _id: string;
  equipmentName: string;
  startDate?: string;
  endDate?: string;
  bookingDate?: string;
  totalAmount?: number;
  paymentStatus?: string;
  status?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const date = (value?: string) => value ? new Date(value).toLocaleDateString() : "—";

export default function CustomerRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch(`${API}/api/customer/rentals`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not load rentals.");
        return result.data || [];
      })
      .then((data) => { if (active) setRentals(data); })
      .catch((err: unknown) => { if (active) setError(reportError(err, "Could not load rentals.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-7 text-zinc-950 dark:text-zinc-100">
      <header className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end dark:border-zinc-800">
        <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Customer Rental Desk</p><h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">My Rentals</h1><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Track your equipment bookings and payment status.</p></div>
        <span className="border border-stone-300 px-3 py-2 font-mono text-xs uppercase tracking-wider text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">{rentals.length} bookings</span>
      </header>
      {error && <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300">{error}</p>}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <p className="col-span-full border border-stone-200 bg-white py-16 text-center font-mono text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">Loading rentals…</p> : rentals.map((rental) => {
          const status = (rental.status || "pending").toLowerCase();
          const payment = rental.paymentStatus || "Pending";
          return (
            <article key={rental._id} className="border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-4 dark:border-zinc-800">
                  <div><p className="font-mono text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-300">Your Booking</p><h2 className="mt-1 text-lg font-medium tracking-tight">{rental.equipmentName}</h2></div>
                  <span className="border border-amber-600/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-800 dark:border-amber-300/30 dark:text-amber-300">{status}</span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Rental starts</dt><dd className="mt-0.5 font-mono text-sm">{date(rental.startDate)}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Rental ends</dt><dd className="mt-0.5 font-mono text-sm">{date(rental.endDate)}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Booked on</dt><dd className="mt-0.5 font-mono text-sm">{date(rental.bookingDate)}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Total amount</dt><dd className="mt-0.5 font-mono text-sm">{rental.totalAmount == null ? "—" : `৳${rental.totalAmount.toLocaleString()}`}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Payment status</dt><dd className="mt-1 border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{payment}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Booking status</dt><dd className="mt-1 border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{status}</dd></div>
                </dl>
              </div>
            </article>
          );
        })}
        {!loading && !rentals.length && <p className="col-span-full border border-stone-200 bg-white py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">You have no rental bookings yet.</p>}
      </div>
    </div>
  );
}
