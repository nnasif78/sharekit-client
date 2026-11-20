"use client";

import { apiFetch } from "@/lib/api-request";
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
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Could not load rentals."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div>
      <header className="dashboard-page-heading">
        <div><p className="dashboard-eyebrow">CUSTOMER DASHBOARD</p><h1>My Rentals</h1><p>Track your equipment bookings and payment status.</p></div>
        <span className="dashboard-count">{rentals.length} bookings</span>
      </header>
      {error && <p role="alert" className="dashboard-error">{error}</p>}
      <div className="dashboard-card-grid">
        {loading ? <p className="dashboard-empty">Loading rentals…</p> : rentals.map((rental) => {
          const status = (rental.status || "pending").toLowerCase();
          const payment = rental.paymentStatus || "Pending";
          return (
            <article key={rental._id} className="dashboard-card">
              <div className="dashboard-card-body">
                <div className="dashboard-card-topline">
                  <div><p className="dashboard-eyebrow">YOUR BOOKING</p><h2 className="dashboard-card-title mt-2">{rental.equipmentName}</h2></div>
                  <span className={`dashboard-status dashboard-status-${status}`}>{status}</span>
                </div>
                <dl className="dashboard-card-details">
                  <div><dt>Rental starts</dt><dd>{date(rental.startDate)}</dd></div>
                  <div><dt>Rental ends</dt><dd>{date(rental.endDate)}</dd></div>
                  <div><dt>Booked on</dt><dd>{date(rental.bookingDate)}</dd></div>
                  <div><dt>Total amount</dt><dd>{rental.totalAmount == null ? "—" : `৳${rental.totalAmount.toLocaleString()}`}</dd></div>
                  <div><dt>Payment status</dt><dd><span className={`dashboard-status dashboard-status-${payment.toLowerCase()}`}>{payment}</span></dd></div>
                  <div><dt>Booking status</dt><dd><span className={`dashboard-status dashboard-status-${status}`}>{status}</span></dd></div>
                </dl>
              </div>
            </article>
          );
        })}
        {!loading && !rentals.length && <p className="dashboard-empty">You have no rental bookings yet.</p>}
      </div>
    </div>
  );
}
