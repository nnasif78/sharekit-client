"use client";

import { apiFetch } from "@/lib/api-request";
import { useEffect, useState } from "react";

type Rental = {
  _id: string;
  customerName?: string;
  customerEmail?: string;
  ownerName?: string;
  ownerEmail?: string;
  equipmentName?: string;
  duration?: string | number;
  startDate?: string;
  endDate?: string;
  bookingAmount?: number;
  paymentStatus?: string;
  status?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const statuses = ["pending", "approved", "rejected", "cancelled", "completed"];
const date = (value?: string) => value ? new Date(value).toLocaleDateString() : "—";

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch(`${API}/api/admin/rentals`, { credentials: "include", cache: "no-store" })
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

  const updateStatus = async (rental: Rental, status: string) => {
    try {
      setBusy(rental._id);
      setError("");
      const response = await apiFetch(`${API}/api/admin/rentals/${rental._id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not update booking.");
      setRentals((items) => items.map((item) => item._id === rental._id ? { ...item, status } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update booking.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <header className="dashboard-page-heading">
        <div><p className="dashboard-eyebrow">ADMIN DASHBOARD</p><h1>All Rentals</h1><p>Monitor booking activity and update booking status.</p></div>
        <span className="dashboard-count">{rentals.length} bookings</span>
      </header>
      {error && <p role="alert" className="dashboard-error">{error}</p>}
      <div className="dashboard-card-grid">
        {loading ? <p className="dashboard-empty">Loading rentals…</p> : rentals.map((rental) => {
          const status = (rental.status || "pending").toLowerCase();
          const paymentStatus = rental.paymentStatus || "Pending";
          return (
            <article key={rental._id} className="dashboard-card">
              <div className="dashboard-card-body">
                <div className="dashboard-card-topline">
                  <div><p className="dashboard-eyebrow">BOOKING</p><h2 className="dashboard-card-title mt-2">{rental.equipmentName || "Equipment rental"}</h2></div>
                  <span className={`dashboard-status dashboard-status-${status}`}>{status}</span>
                </div>
                <dl className="dashboard-card-details">
                  <div><dt>Customer</dt><dd>{rental.customerName || "Customer"}<span className="dashboard-detail-sub">{rental.customerEmail || "—"}</span></dd></div>
                  <div><dt>Owner</dt><dd>{rental.ownerName || "Owner"}<span className="dashboard-detail-sub">{rental.ownerEmail || "—"}</span></dd></div>
                  <div><dt>Rental period</dt><dd>{rental.duration || `${date(rental.startDate)} – ${date(rental.endDate)}`}</dd></div>
                  <div><dt>Booking amount</dt><dd>{rental.bookingAmount == null ? "—" : `৳${rental.bookingAmount.toLocaleString()}`}</dd></div>
                  <div><dt>Payment</dt><dd><span className={`dashboard-status dashboard-status-${paymentStatus.toLowerCase()}`}>{paymentStatus}</span></dd></div>
                  <div><dt>Update status</dt><dd>
                    <select aria-label={`Booking status for ${rental.equipmentName || "rental"}`} disabled={busy === rental._id} value={status} onChange={(event) => void updateStatus(rental, event.target.value)} className="dashboard-control dashboard-status-select">
                      {statuses.map((value) => <option value={value} key={value}>{value}</option>)}
                    </select>
                  </dd></div>
                </dl>
              </div>
            </article>
          );
        })}
        {!loading && !rentals.length && <p className="dashboard-empty">No rental bookings found.</p>}
      </div>
    </div>
  );
}
