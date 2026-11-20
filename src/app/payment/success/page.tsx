"use client";
import { apiFetch } from "@/lib/api-request";

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
    if (!sessionId) { Promise.resolve().then(() => { if (active) setError("Checkout session was not provided."); }); return () => { active = false; }; }
    let attempts = 0;
    const check = async () => {
      try {
        const response = await apiFetch(`${API}/api/customer/checkout/${encodeURIComponent(sessionId)}`, { credentials: "include", cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not verify payment.");
        if (!active) return;
        setStatus(result.data);
        attempts += 1;
        if (!result.data.bookingCreated && attempts < 10) window.setTimeout(check, 2000);
      } catch (e) { if (active) setError(e instanceof Error ? e.message : "Could not verify payment."); }
    };
    void check();
    return () => { active = false; };
  }, []);
  const paid = status?.paymentStatus === "paid";
  return <main className="mx-auto max-w-2xl px-5 py-20 text-center"><div className="rounded-2xl border bg-white p-8 shadow-sm"><div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>{paid ? "✓" : "…"}</div><h1 className="mt-5 text-3xl font-bold">{paid ? "Payment successful" : "Confirming your payment"}</h1><p className="mt-3 text-gray-600">{status?.bookingCreated ? `Your booking for ${status.equipmentName} is recorded.` : paid ? "Payment is complete. We are waiting for the secure payment confirmation to finish creating your booking." : "This page checks the payment provider for the latest status. You can also check My Rentals shortly."}</p>{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/dashboard/customer/rentals" className="rounded-lg bg-black px-5 py-3 font-medium text-white">View My Rentals</Link><Link href="/equipment" className="rounded-lg border px-5 py-3 font-medium">Browse Equipment</Link></div></div></main>;
}
