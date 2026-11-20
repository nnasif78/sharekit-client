"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

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
      if (isCustomer) fetch(`${API}/api/customer/favorites`, { credentials: "include", cache: "no-store" }).then((r) => r.json()).then((result) => { if (active && result.success) setFavorite((result.data || []).some((favoriteItem: { _id: string }) => favoriteItem._id === data._id)); }).catch(() => {});
    }).catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : "Could not load equipment."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [name, isCustomer, isPending, session]);

  const rentalDays = useMemo(() => booking.startDate && booking.endDate ? daysBetween(booking.startDate, booking.endDate) : 0, [booking.endDate, booking.startDate]);
  const billableUnits = item && rentalDays > 0 ? Math.ceil(rentalDays / (item.rentalType === "weekly" ? 7 : item.rentalType === "monthly" ? 30 : 1)) : 0;
  const totalAmount = item ? item.price * billableUnits * booking.quantity : 0;
  const today = new Date().toISOString().slice(0, 10);

  const toggleFavorite = async () => {
    if (!item) return;
    try { setSavingFavorite(true); const response = await fetch(`${API}/api/customer/favorites/${item._id}`, { method: favorite ? "DELETE" : "POST", credentials: "include" }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Could not update favorites."); setFavorite(!favorite); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not update favorites."); }
    finally { setSavingFavorite(false); }
  };

  const startCheckout = async (event: FormEvent) => {
    event.preventDefault(); if (!item) return;
    setBookingError("");
    if (!rentalDays || rentalDays < 1) { setBookingError("Choose a valid rental date range."); return; }
    if (booking.quantity > item.availableQuantity) { setBookingError("The requested quantity is not available."); return; }
    try {
      setSubmitting(true);
      const response = await fetch(`${API}/api/customer/equipment/${item._id}/checkout`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(booking) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not start payment.");
      if (!result.data?.checkoutUrl) throw new Error("Stripe did not return a checkout link.");
      window.location.assign(result.data.checkoutUrl);
    } catch (e) { setBookingError(e instanceof Error ? e.message : "Could not start payment."); setSubmitting(false); }
  };

  if (isPending || loading) return <main className="mx-auto max-w-6xl p-10 text-gray-500">Loading equipment details…</main>;
  if (!session) return <main className="mx-auto max-w-3xl p-10 text-gray-600">Redirecting to sign in…</main>;
  if (error && !item) return <main className="mx-auto max-w-3xl p-10"><p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p><Link href="/equipment" className="mt-4 inline-block text-blue-700 hover:underline">Back to equipment</Link></main>;
  if (!item) return null;

  return <main className="mx-auto max-w-6xl px-5 py-10"><Link href="/equipment" className="text-sm text-gray-500 hover:text-black">← All equipment</Link>{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}<div className="mt-5 grid gap-8 lg:grid-cols-2"><div><img src={item.image} alt={item.name} className="max-h-[560px] w-full rounded-2xl object-cover"/></div><div><p className="text-sm font-medium uppercase tracking-wide text-gray-500">{item.category}</p><h1 className="mt-2 text-3xl font-bold">{item.name}</h1><p className="mt-4 whitespace-pre-wrap text-gray-700">{item.description}</p><p className="mt-6 text-3xl font-bold">৳{item.price.toLocaleString()} <span className="text-base font-normal text-gray-500">/ {item.rentalType}</span></p><dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border p-4 text-sm"><div><dt className="text-gray-500">Location</dt><dd className="mt-1 font-medium">{item.location}</dd></div><div><dt className="text-gray-500">Availability</dt><dd className="mt-1 font-medium">{item.availableQuantity > 0 ? `${item.availableQuantity} available` : "Unavailable"}</dd></div><div><dt className="text-gray-500">Condition</dt><dd className="mt-1 font-medium">{item.condition}</dd></div><div><dt className="text-gray-500">Brand / Model</dt><dd className="mt-1 font-medium">{item.brand || "—"} / {item.model || "—"}</dd></div></dl><section className="mt-5 rounded-xl bg-gray-50 p-4"><h2 className="font-semibold">Owner Information</h2><p className="mt-2 text-sm">{item.ownerName}</p><p className="text-sm text-gray-600">{item.ownerEmail}</p></section>{item.rentalTerms && <section className="mt-5"><h2 className="font-semibold">Rental Terms and Conditions</h2><p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{item.rentalTerms}</p></section>}
      {isCustomer ? <div className="mt-7 flex flex-col gap-3 sm:flex-row"><button disabled={savingFavorite} onClick={() => void toggleFavorite()} className="rounded-lg border px-5 py-3 font-medium disabled:opacity-50">{savingFavorite ? "Saving…" : favorite ? "Remove from Favorites" : "Add to Favorites"}</button><button disabled={item.availableQuantity < 1} onClick={() => setBookingOpen(true)} className="rounded-lg bg-black px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">Book Now</button></div> : <p className="mt-7 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Booking and favorites are available to customer accounts.</p>}</div></div>
    {bookingOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget && !submitting) setBookingOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="booking-title" className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-start justify-between"><div><h2 id="booking-title" className="text-2xl font-semibold">Book {item.name}</h2><p className="mt-1 text-sm text-gray-500">Your quantity will be reserved while you complete payment.</p></div><button disabled={submitting} aria-label="Close booking form" onClick={() => setBookingOpen(false)} className="text-xl">×</button></div><form onSubmit={startCheckout} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Rental Start Date<input type="date" required min={today} value={booking.startDate} onChange={(e) => setBooking({ ...booking, startDate: e.target.value, endDate: booking.endDate && booking.endDate < e.target.value ? "" : booking.endDate })} className="mt-1 w-full rounded-lg border p-3"/></label><label className="text-sm font-medium">Rental End Date<input type="date" required min={booking.startDate || today} value={booking.endDate} onChange={(e) => setBooking({ ...booking, endDate: e.target.value })} className="mt-1 w-full rounded-lg border p-3"/></label></div><label className="block text-sm font-medium">Required Quantity<input type="number" min="1" max={item.availableQuantity} required value={booking.quantity} onChange={(e) => setBooking({ ...booking, quantity: Number(e.target.value) })} className="mt-1 w-full rounded-lg border p-3"/><span className="mt-1 block font-normal text-gray-500">{item.availableQuantity} currently available</span></label><label className="block text-sm font-medium">Contact Number<input type="tel" required value={booking.contactNumber} onChange={(e) => setBooking({ ...booking, contactNumber: e.target.value })} className="mt-1 w-full rounded-lg border p-3"/></label><label className="block text-sm font-medium">Delivery Address<textarea required rows={2} value={booking.deliveryAddress} onChange={(e) => setBooking({ ...booking, deliveryAddress: e.target.value })} className="mt-1 w-full rounded-lg border p-3"/></label><label className="block text-sm font-medium">Additional Notes <span className="font-normal text-gray-500">(optional)</span><textarea rows={2} maxLength={1000} value={booking.additionalNotes} onChange={(e) => setBooking({ ...booking, additionalNotes: e.target.value })} className="mt-1 w-full rounded-lg border p-3"/></label><div className="rounded-xl bg-gray-50 p-4 text-sm"><p>Rental duration: <strong>{rentalDays > 0 ? `${rentalDays} day(s)` : "Choose dates"}</strong> · Billing: <strong>{billableUnits} {item.rentalType} period(s)</strong></p><p className="mt-2 text-lg">Estimated total: <strong>৳{totalAmount.toLocaleString()}</strong></p><p className="mt-1 text-xs text-gray-500">Weekly periods are 7 days; monthly periods are 30 days. Total is calculated again by the server before checkout.</p></div>{bookingError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{bookingError}</p>}<div className="flex justify-end gap-3"><button type="button" disabled={submitting} onClick={() => setBookingOpen(false)} className="rounded-lg border px-4 py-2.5">Cancel</button><button disabled={submitting || item.availableQuantity < 1} className="rounded-lg bg-black px-5 py-2.5 font-medium text-white disabled:opacity-50">{submitting ? "Opening Stripe…" : "Confirm and Pay"}</button></div></form></section></div>}
  </main>;
}
