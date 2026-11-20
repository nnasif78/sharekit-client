"use client";
import { apiFetch } from "@/lib/api-request";
import { notifySuccess, reportError } from "@/lib/notifications";

import Link from "next/link";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export default function PaymentCancelPage() {
  const [message, setMessage] = useState("Releasing your reserved equipment quantity…");
  useEffect(() => {
    const reservationId = new URLSearchParams(window.location.search).get("reservation_id");
    if (!reservationId) { Promise.resolve().then(() => setMessage("No payment was completed. You can return to equipment details and try again.")); return; }
    apiFetch(`${API}/api/customer/checkout/${encodeURIComponent(reservationId)}/cancel`, { method: "POST", credentials: "include" })
      .then(async (response) => { const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "We could not confirm the cancellation."); setMessage("Checkout was cancelled. No payment was recorded, and the reserved quantity has been released."); notifySuccess("Checkout cancelled. Reserved quantity released."); })
      .catch((error: unknown) => setMessage(reportError(error, "Checkout was cancelled. The reservation will expire automatically.")));
  }, []);
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:py-20">
      <section className="border border-stone-300 bg-stone-50 p-6 shadow-[6px_6px_0_0_rgba(39,39,42,0.08)] dark:border-zinc-700 dark:bg-zinc-900 sm:p-10">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">ShareKit / Checkout</p>
        <div className="mt-6 flex h-12 w-12 items-center justify-center border border-stone-400 bg-stone-200 text-xl font-mono text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-stone-200">×</div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-stone-100">Checkout cancelled</h1>
        <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-300">{message}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/equipment" className="border border-zinc-900 bg-zinc-900 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-stone-50 hover:border-amber-700 hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-amber-400 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300">Back to equipment</Link>
          <Link href="/dashboard/customer/rentals" className="border border-stone-400 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:border-amber-600 hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-600 dark:text-stone-200 dark:hover:border-amber-400 dark:hover:bg-zinc-800">My rentals</Link>
        </div>
      </section>
    </main>
  );
}
