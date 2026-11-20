"use client";
import { apiFetch } from "@/lib/api-request";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { notifyError, notifySuccess, reportError } from "@/lib/notifications";

type Equipment = { _id: string; name: string; description: string; category: string; location: string; price: number; rentalType: "daily" | "weekly" | "monthly"; availableQuantity: number; condition: string; image: string; brand?: string; model?: string; ownerName: string; ownerEmail: string; rentalTerms?: string };
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const daysBetween = (start: string, end: string) => Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;

export default function EquipmentDetailsPage({ name }: { name: string }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const isCustomer = (session?.user as { role?: string } | undefined)?.role === "customer";
  const [item, setItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [booking, setBooking] = useState({ startDate: "", endDate: "", quantity: 1, contactNumber: "", deliveryAddress: "", additionalNotes: "" });
  const [bookingError, setBookingError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.replace(`/login?callbackURL=${encodeURIComponent(`/equipment/${name}`)}`);
  }, [isPending, name, router, session]);

  useEffect(() => {
    if (isPending || !session || !name) return;
    let active = true;
    fetch(`${API}/api/equipment/by-name/${encodeURIComponent(name)}`, { cache: "no-store" }).then(async (response) => { const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Equipment not found."); return result.data; }).then((data) => {
      if (!active) return;
      setItem(data);
      if (isCustomer) apiFetch(`${API}/api/customer/favorites`, { credentials: "include", cache: "no-store" }).then((r) => r.json()).then((result) => { if (active && result.success) setFavorite((result.data || []).some((favoriteItem: { _id: string }) => favoriteItem._id === data._id)); }).catch((error: unknown) => { if (active) reportError(error, "Could not load favorites."); });
    }).catch((e: unknown) => { if (active) setError(reportError(e, "Could not load equipment.")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [name, isCustomer, isPending, session]);

  const rentalDays = useMemo(() => booking.startDate && booking.endDate ? daysBetween(booking.startDate, booking.endDate) : 0, [booking.endDate, booking.startDate]);
  const billableUnits = item && rentalDays > 0 ? Math.ceil(rentalDays / (item.rentalType === "weekly" ? 7 : item.rentalType === "monthly" ? 30 : 1)) : 0;
  const totalAmount = item ? item.price * billableUnits * booking.quantity : 0;
  const today = new Date().toISOString().slice(0, 10);

  const toggleFavorite = async () => {
    if (!item) return;
    try { setSavingFavorite(true); const response = await apiFetch(`${API}/api/customer/favorites/${item._id}`, { method: favorite ? "DELETE" : "POST", credentials: "include" }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Could not update favorites."); setFavorite(!favorite); notifySuccess(favorite ? "Removed from favorites." : "Added to favorites."); }
    catch (e) { setError(reportError(e, "Could not update favorites.")); }
    finally { setSavingFavorite(false); }
  };

  const startCheckout = async (event: FormEvent) => {
    event.preventDefault(); if (!item) return;
    setBookingError("");
    if (!rentalDays || rentalDays < 1) { setBookingError("Choose a valid rental date range."); notifyError("Choose a valid rental date range."); return; }
    if (booking.quantity > item.availableQuantity) { setBookingError("The requested quantity is not available."); notifyError("The requested quantity is not available."); return; }
    try {
      setSubmitting(true);
      const response = await apiFetch(`${API}/api/customer/equipment/${item._id}/checkout`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(booking) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not start payment.");
      if (!result.data?.checkoutUrl) throw new Error("Stripe did not return a checkout link.");
      notifySuccess("Opening secure checkout.");
      window.location.assign(result.data.checkoutUrl);
    } catch (e) { setBookingError(reportError(e, "Could not start payment.")); setSubmitting(false); }
  };

  if (isPending || loading) {
    return (
      <main className="mx-auto max-w-7xl bg-[#F7F6F2] px-6 py-10 font-mono text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
        Loading equipment details…
      </main>
    );
  }
  if (!session) {
    return (
      <main className="mx-auto max-w-7xl bg-[#F7F6F2] px-6 py-10 font-mono text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
        Redirecting to sign in…
      </main>
    );
  }
  if (error && !item) {
    return (
      <main className="mx-auto max-w-7xl space-y-4 bg-[#F7F6F2] px-6 py-10 dark:bg-zinc-950">
        <p
          role="alert"
          className="border border-red-700/30 bg-red-500/10 p-4 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300"
        >
          {error}
        </p>
        <Link
          href="/equipment"
          className="inline-block font-mono text-xs uppercase tracking-wider text-zinc-700 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
        >
          Back to equipment
        </Link>
      </main>
    );
  }
  if (!item) return null;

  return (
    <main className="mx-auto max-w-7xl bg-[#F7F6F2] px-5 py-8 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100 sm:px-8 sm:py-10">
      <Link
        href="/equipment"
        className="font-mono text-xs uppercase tracking-wider text-zinc-600 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
      >
        ← All equipment
      </Link>
      {error && (
        <p
          role="alert"
          className="mt-4 border border-red-700/30 bg-red-500/10 p-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-8 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <div className="aspect-[4/3] overflow-hidden border border-stone-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="xl:col-span-5">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
            {item.category}
          </p>
          <h1 className="mt-3 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            {item.name}
          </h1>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {item.description}
          </p>

          <div className="mt-6 flex items-baseline gap-2 border-y border-stone-200/90 py-4 dark:border-zinc-800/90">
            <span className="font-mono text-2xl font-medium tracking-tight">
              ৳{item.price.toLocaleString()}
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              / {item.rentalType}
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-px border border-stone-200/90 bg-stone-200/90 dark:border-zinc-800/90 dark:bg-zinc-800/90">
            <div className="bg-white p-3.5 dark:bg-zinc-900/70">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Location
              </dt>
              <dd className="mt-1 text-sm text-zinc-950 dark:text-zinc-100">
                {item.location}
              </dd>
            </div>
            <div className="bg-white p-3.5 dark:bg-zinc-900/70">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Availability
              </dt>
              <dd className="mt-1 font-mono text-xs text-zinc-950 dark:text-zinc-100">
                {item.availableQuantity > 0
                  ? `${item.availableQuantity} available`
                  : "Unavailable"}
              </dd>
            </div>
            <div className="bg-white p-3.5 dark:bg-zinc-900/70">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Condition
              </dt>
              <dd className="mt-1 text-sm text-zinc-950 dark:text-zinc-100">
                {item.condition}
              </dd>
            </div>
            <div className="bg-white p-3.5 dark:bg-zinc-900/70">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Brand / Model
              </dt>
              <dd className="mt-1 text-sm text-zinc-950 dark:text-zinc-100">
                {item.brand || "—"} / {item.model || "—"}
              </dd>
            </div>
          </dl>

          <section className="mt-5 border border-stone-200/90 bg-white p-4 dark:border-zinc-800/90 dark:bg-zinc-900/60">
            <h2 className="font-medium tracking-tight">Owner information</h2>
            <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
              {item.ownerName}
            </p>
            <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              {item.ownerEmail}
            </p>
          </section>

          {item.rentalTerms && (
            <section className="mt-5 border-t border-stone-200/90 pt-4 dark:border-zinc-800/90">
              <h2 className="font-medium tracking-tight">
                Rental terms and conditions
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.rentalTerms}
              </p>
            </section>
          )}

          {isCustomer ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                disabled={savingFavorite}
                onClick={() => void toggleFavorite()}
                className="border border-stone-300 bg-white px-5 py-3 font-mono text-xs uppercase tracking-wider text-zinc-950 transition-colors hover:border-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:focus-visible:outline-amber-300"
              >
                {savingFavorite
                  ? "Saving…"
                  : favorite
                    ? "Remove from favorites"
                    : "Add to favorites"}
              </button>
              <button
                disabled={item.availableQuantity < 1}
                onClick={() => setBookingOpen(true)}
                className="border border-zinc-950 bg-zinc-950 px-5 py-3 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200 dark:focus-visible:outline-amber-300"
              >
                Book now
              </button>
            </div>
          ) : (
            <p className="mt-7 border border-amber-600/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-300">
              Booking and favorites are available to customer accounts.
            </p>
          )}
        </div>
      </div>

      {bookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              setBookingOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="my-8 w-full max-w-2xl border border-stone-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-200/90 p-5 sm:p-6 dark:border-zinc-800/90">
              <div>
                <h2
                  id="booking-title"
                  className="text-2xl font-medium tracking-tight"
                >
                  Book {item.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Your quantity is reserved while you complete payment.
                </p>
              </div>
              <button
                disabled={submitting}
                aria-label="Close booking form"
                onClick={() => setBookingOpen(false)}
                className="border border-stone-300 px-2 py-1 font-mono text-xs text-zinc-700 hover:border-zinc-950 focus-visible:outline-2 focus-visible:outline-zinc-950 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:focus-visible:outline-amber-300"
              >
                ×
              </button>
            </div>

            <form onSubmit={startCheckout} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Rental start date
                  <input
                    type="date"
                    required
                    min={today}
                    value={booking.startDate}
                    onChange={(e) =>
                      setBooking({
                        ...booking,
                        startDate: e.target.value,
                        endDate:
                          booking.endDate && booking.endDate < e.target.value
                            ? ""
                            : booking.endDate,
                      })
                    }
                    className="w-full border border-stone-300 bg-white px-3.5 py-2.5 font-sans text-sm text-zinc-950 focus:border-zinc-950 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-amber-300 dark:focus-visible:outline-amber-300"
                  />
                </label>
                <label className="grid gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Rental end date
                  <input
                    type="date"
                    required
                    min={booking.startDate || today}
                    value={booking.endDate}
                    onChange={(e) =>
                      setBooking({ ...booking, endDate: e.target.value })
                    }
                    className="w-full border border-stone-300 bg-white px-3.5 py-2.5 font-sans text-sm text-zinc-950 focus:border-zinc-950 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-amber-300 dark:focus-visible:outline-amber-300"
                  />
                </label>
              </div>

              <label className="grid gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Required quantity
                <input
                  type="number"
                  min="1"
                  max={item.availableQuantity}
                  required
                  value={booking.quantity}
                  onChange={(e) =>
                    setBooking({ ...booking, quantity: Number(e.target.value) })
                  }
                  className="w-full border border-stone-300 bg-white px-3.5 py-2.5 font-sans text-sm text-zinc-950 focus:border-zinc-950 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-amber-300 dark:focus-visible:outline-amber-300"
                />
                <span className="font-sans text-xs normal-case tracking-normal text-zinc-500 dark:text-zinc-400">
                  {item.availableQuantity} currently available
                </span>
              </label>

              <label className="grid gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Contact number
                <input
                  type="tel"
                  required
                  value={booking.contactNumber}
                  onChange={(e) =>
                    setBooking({ ...booking, contactNumber: e.target.value })
                  }
                  className="w-full border border-stone-300 bg-white px-3.5 py-2.5 font-sans text-sm text-zinc-950 focus:border-zinc-950 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-amber-300 dark:focus-visible:outline-amber-300"
                />
              </label>

              <label className="grid gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Delivery address
                <textarea
                  required
                  rows={2}
                  value={booking.deliveryAddress}
                  onChange={(e) =>
                    setBooking({ ...booking, deliveryAddress: e.target.value })
                  }
                  className="w-full border border-stone-300 bg-white px-3.5 py-2.5 font-sans text-sm text-zinc-950 focus:border-zinc-950 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-amber-300 dark:focus-visible:outline-amber-300"
                />
              </label>

              <label className="grid gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Additional notes
                <span className="font-sans text-xs normal-case tracking-normal text-zinc-500 dark:text-zinc-400">
                  Optional
                </span>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={booking.additionalNotes}
                  onChange={(e) =>
                    setBooking({ ...booking, additionalNotes: e.target.value })
                  }
                  className="w-full border border-stone-300 bg-white px-3.5 py-2.5 font-sans text-sm text-zinc-950 focus:border-zinc-950 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-amber-300 dark:focus-visible:outline-amber-300"
                />
              </label>

              <div className="border border-stone-200/90 bg-[#F7F6F2]/70 p-4 text-sm dark:border-zinc-800/90 dark:bg-zinc-950/60">
                <p className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  Rental duration:{" "}
                  <strong className="text-zinc-950 dark:text-white">
                    {rentalDays > 0 ? `${rentalDays} day(s)` : "Choose dates"}
                  </strong>{" "}
                  · Billing:{" "}
                  <strong className="text-zinc-950 dark:text-white">
                    {billableUnits} {item.rentalType} period(s)
                  </strong>
                </p>
                <p className="mt-3 font-mono text-base text-zinc-950 dark:text-zinc-100">
                  Estimated total:{" "}
                  <strong>৳{totalAmount.toLocaleString()}</strong>
                </p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Weekly periods are 7 days; monthly periods are 30 days. The
                  server recalculates the total before checkout.
                </p>
              </div>

              {bookingError && (
                <p
                  role="alert"
                  className="border border-red-700/30 bg-red-500/10 p-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300"
                >
                  {bookingError}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t border-stone-200/90 pt-4 dark:border-zinc-800/90">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setBookingOpen(false)}
                  className="border border-stone-300 bg-white px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-zinc-950 transition-colors hover:border-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:focus-visible:outline-amber-300"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting || item.availableQuantity < 1}
                  className="border border-zinc-950 bg-zinc-950 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:opacity-50 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200 dark:focus-visible:outline-amber-300"
                >
                  {submitting ? "Opening Stripe…" : "Confirm and pay"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
