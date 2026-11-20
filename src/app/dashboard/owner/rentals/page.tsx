"use client";
import { apiFetch } from "@/lib/api-request";

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

export default function OwnerRentalsPage() {
  const [rentals, setRentals] = useState<OwnerRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/owner/rentals`, { credentials: "include", cache: "no-store" })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.message || "Could not load rentals."); return result; })
      .then((result) => { if (active) setRentals(result.data || []); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load rentals."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const date = (value?: string) => value ? new Date(value).toLocaleDateString() : "—";
  return <div><p className="text-sm font-medium text-gray-500">OWNER DASHBOARD</p><h1 className="mt-1 text-3xl font-bold">My Equipment Rentals</h1><p className="mt-2 text-gray-600">Bookings made for your equipment.</p>{error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading ? <p className="py-10 text-gray-500">Loading rental bookings…</p> : <div className="mt-6 overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Customer Information", "Equipment Information", "Rental Duration", "Required Quantity", "Booking Amount", "Payment Status", "Booking Status"].map((heading) => <th className="px-4 py-3" key={heading}>{heading}</th>)}</tr></thead><tbody className="divide-y">{rentals.map((rental) => <tr key={rental._id}><td className="px-4 py-4"><p className="font-medium">{rental.customerName || "Customer"}</p><p className="text-gray-500">{rental.customerEmail || "—"}</p></td><td className="px-4 py-4">{rental.equipmentName || "Equipment"}</td><td className="px-4 py-4">{rental.duration ? `${rental.duration}` : `${date(rental.startDate)} – ${date(rental.endDate)}`}</td><td className="px-4 py-4">{rental.quantity ?? "—"}</td><td className="px-4 py-4">{rental.bookingAmount == null ? "—" : `৳${rental.bookingAmount.toLocaleString()}`}</td><td className="px-4 py-4">{rental.paymentStatus || "Pending"}</td><td className="px-4 py-4">{rental.status || "Pending"}</td></tr>)}</tbody></table>{!rentals.length && <p className="p-10 text-center text-gray-500">No rental bookings for your equipment yet.</p>}</div>}</div>;
}
