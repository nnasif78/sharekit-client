"use client";
import { apiFetch } from "@/lib/api-request";

import Link from "next/link";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export default function PaymentCancelPage() {
  const [message, setMessage] = useState("Releasing your reserved equipment quantity…");
  useEffect(() => {
    const reservationId = new URLSearchParams(window.location.search).get("reservation_id");
    if (!reservationId) { Promise.resolve().then(() => setMessage("No payment was completed. You can return to equipment details and try again.")); return; }
    apiFetch(`${API}/api/customer/checkout/${encodeURIComponent(reservationId)}/cancel`, { method: "POST", credentials: "include" })
      .then(async (response) => { const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "We could not confirm the cancellation."); setMessage("Checkout was cancelled. No payment was recorded, and the reserved quantity has been released."); })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Checkout was cancelled. The reservation will expire automatically."));
  }, []);
  return <main className="mx-auto max-w-2xl px-5 py-20 text-center"><div className="rounded-2xl border bg-white p-8"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">×</div><h1 className="mt-5 text-3xl font-bold">Checkout cancelled</h1><p className="mt-3 text-gray-600">{message}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/equipment" className="rounded-lg bg-black px-5 py-3 font-medium text-white">Back to Equipment</Link><Link href="/dashboard/customer/rentals" className="rounded-lg border px-5 py-3 font-medium">My Rentals</Link></div></div></main>;
}
