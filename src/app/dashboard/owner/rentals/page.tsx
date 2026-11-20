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
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Could not load rentals."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div>
      <header className="dashboard-page-heading">
        <div><p className="dashboard-eyebrow">OWNER DASHBOARD</p><h1>My Equipment Rentals</h1><p>Bookings made for your equipment.</p></div>
        <span className="dashboard-count">{rentals.length} bookings</span>
      </header>
      {error && <p role="alert" className="dashboard-error">{error}</p>}
      <div className="dashboard-card-grid">
        {loading ? <p className="dashboard-empty">Loading rental bookings…</p> : rentals.map((rental) => {
          const status = (rental.status || "pending").toLowerCase();
          const payment = rental.paymentStatus || "Pending";
          return (
            <article key={rental._id} className="dashboard-card">
              <div className="dashboard-card-body">
                <div className="dashboard-card-topline">
                  <div><p className="dashboard-eyebrow">BOOKING</p><h2 className="dashboard-card-title mt-2">{rental.equipmentName || "Equipment"}</h2></div>
                  <span className={`dashboard-status dashboard-status-${status}`}>{status}</span>
                </div>
                <p className="dashboard-card-copy">{rental.customerName || "Customer"} · {rental.customerEmail || "—"}</p>
                <dl className="dashboard-card-details">
                  <div><dt>Rental period</dt><dd>{rental.duration || `${date(rental.startDate)} – ${date(rental.endDate)}`}</dd></div>
                  <div><dt>Quantity</dt><dd>{rental.quantity ?? "—"}</dd></div>
                  <div><dt>Booking amount</dt><dd>{rental.bookingAmount == null ? "—" : `৳${rental.bookingAmount.toLocaleString()}`}</dd></div>
                  <div><dt>Payment status</dt><dd><span className={`dashboard-status dashboard-status-${payment.toLowerCase()}`}>{payment}</span></dd></div>
                </dl>
              </div>
            </article>
          );
        })}
        {!loading && !rentals.length && <p className="dashboard-empty">No rental bookings for your equipment yet.</p>}
      </div>
    </div>
  );
}
