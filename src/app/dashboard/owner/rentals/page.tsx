"use client";

import { apiFetch } from "@/lib/api-request";
import { reportError } from "@/lib/notifications";
import { useEffect, useState } from "react";

type OwnerRental = {
  _id: string;
  customerName?: string;
  customerEmail?: string;
  equipmentName?: string;
  startDate?: string;
  endDate?: string;
  duration?: string | number;
  quantity?: number;
  bookingAmount?: number;
  paymentStatus?: string;
  status?: string;
};

const date = (value?: string) => value ? new Date(value).toLocaleDateString() : "—";

export default function OwnerRentalsPage() {
  const [rentals, setRentals] = useState<OwnerRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/owner/rentals`, { credentials: "include", cache: "no-store" })
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
        <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Owner Rental Desk</p><h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">My Equipment Rentals</h1><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Bookings made for your equipment.</p></div>
        <span className="border border-stone-300 px-3 py-2 font-mono text-xs uppercase tracking-wider text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">{rentals.length} bookings</span>
      </header>
      {error && <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300">{error}</p>}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <p className="col-span-full border border-stone-200 bg-white py-16 text-center font-mono text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">Loading rental bookings…</p> : rentals.map((rental) => {
          const status = (rental.status || "pending").toLowerCase();
          const payment = rental.paymentStatus || "Pending";
          return (
            <article key={rental._id} className="border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-4 dark:border-zinc-800">
                  <div><p className="font-mono text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-300">Booking</p><h2 className="mt-1 text-lg font-medium tracking-tight">{rental.equipmentName || "Equipment"}</h2></div>
                  <span className="border border-amber-600/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-800 dark:border-amber-300/30 dark:text-amber-300">{status}</span>
                </div>
                <p className="mt-3 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{rental.customerName || "Customer"} · {rental.customerEmail || "—"}</p>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-100 pt-4 dark:border-zinc-800">
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Rental period</dt><dd className="mt-0.5 text-sm">{rental.duration || `${date(rental.startDate)} – ${date(rental.endDate)}`}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Quantity</dt><dd className="mt-0.5 font-mono text-sm">{rental.quantity ?? "—"}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Booking amount</dt><dd className="mt-0.5 font-mono text-sm">{rental.bookingAmount == null ? "—" : `৳${rental.bookingAmount.toLocaleString()}`}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Payment status</dt><dd className="mt-1 border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{payment}</dd></div>
                </dl>
              </div>
            </article>
          );
        })}
        {!loading && !rentals.length && <p className="col-span-full border border-stone-200 bg-white py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">No rental bookings for your equipment yet.</p>}
      </div>
    </div>
  );
}
