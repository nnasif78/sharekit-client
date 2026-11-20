"use client";
import { apiFetch } from "@/lib/api-request";
import { notifyError, notifySuccess, reportError } from "@/lib/notifications";

import Link from "next/link";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
type CheckoutStatus = { paymentStatus: string; bookingCreated: boolean; equipmentName: string };
export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<CheckoutStatus | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) { Promise.resolve().then(() => { if (active) { setError("Checkout session was not provided."); notifyError("Checkout session was not provided."); } }); return () => { active = false; }; }
    let attempts = 0;
    const check = async () => {
      try {
        const response = await apiFetch(`${API}/api/customer/checkout/${encodeURIComponent(sessionId)}`, { credentials: "include", cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not verify payment.");
        if (!active) return;
        setStatus(result.data);
        if (result.data.bookingCreated) notifySuccess("Payment confirmed and booking created.");
        attempts += 1;
        if (!result.data.bookingCreated && attempts < 10) window.setTimeout(check, 2000);
      } catch (e) { if (active) setError(reportError(e, "Could not verify payment.")); }
    };
    void check();
    return () => { active = false; };
  }, []);
  const paid = status?.paymentStatus === "paid";
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:py-20">
      <section className="border border-stone-300 bg-stone-50 p-6 shadow-[6px_6px_0_0_rgba(39,39,42,0.08)] dark:border-zinc-700 dark:bg-zinc-900 sm:p-10">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">ShareKit / Checkout</p>
        <div className={`mt-6 flex h-12 w-12 items-center justify-center border text-xl font-mono ${paid ? "border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300" : "border-stone-400 bg-stone-200 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-stone-200"}`}>{paid ? "✓" : "…"}</div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-stone-100">{paid ? "Payment successful" : "Confirming your payment"}</h1>
        <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-300">{status?.bookingCreated ? `Your booking for ${status.equipmentName} is recorded.` : paid ? "Payment is complete. We are waiting for the secure payment confirmation to finish creating your booking." : "This page checks the payment provider for the latest status. You can also check My Rentals shortly."}</p>
        {error && <p role="alert" className="mt-5 border-l-2 border-red-600 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard/customer/rentals" className="border border-zinc-900 bg-zinc-900 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-stone-50 hover:border-amber-700 hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-amber-400 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300">View my rentals</Link>
          <Link href="/equipment" className="border border-stone-400 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:border-amber-600 hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-600 dark:text-stone-200 dark:hover:border-amber-400 dark:hover:bg-zinc-800">Browse equipment</Link>
        </div>
      </section>
    </main>
  );
}
