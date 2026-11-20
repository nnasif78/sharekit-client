"use client";

import { apiFetch } from "@/lib/api-request";
import { useCallback, useEffect, useMemo, useState } from "react";

type Equipment = {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  price: number;
  rentalType: string;
  availableQuantity: number;
  condition: string;
  image: string;
  ownerName: string;
  ownerEmail: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [form, setForm] = useState({ name: "", price: 0, availableQuantity: 0, location: "" });

  const load = useCallback(async () => {
    try {
      const response = await apiFetch(`${API}/api/admin/equipment`, { credentials: "include", cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not load equipment.");
      setError("");
      setEquipment(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load equipment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch(`${API}/api/admin/equipment`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not load equipment.");
        return result.data || [];
      })
      .then((data) => { if (active) setEquipment(data); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Could not load equipment."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(
    () => equipment.filter((item) => statusFilter === "all" || item.status === statusFilter),
    [equipment, statusFilter],
  );

  const updateStatus = async (item: Equipment, status: "approved" | "rejected") => {
    try {
      setBusy(item._id);
      setError("");
      const response = await apiFetch(`${API}/api/admin/equipment/${item._id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Status update failed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed.");
    } finally {
      setBusy("");
    }
  };

  const save = async () => {
    if (!editing) return;
    try {
      setBusy(editing._id);
      setError("");
      const response = await apiFetch(`${API}/api/admin/equipment/${editing._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Equipment update failed.");
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Equipment update failed.");
    } finally {
      setBusy("");
    }
  };

  const remove = async (item: Equipment) => {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    try {
      setBusy(item._id);
      setError("");
      const response = await apiFetch(`${API}/api/admin/equipment/${item._id}`, { method: "DELETE", credentials: "include" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Delete failed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <header className="dashboard-page-heading">
        <div><p className="dashboard-eyebrow">ADMIN DASHBOARD</p><h1>All Equipment</h1><p>Review submissions and manage equipment listings.</p></div>
        <button onClick={() => void load()} className="dashboard-action">Refresh</button>
      </header>
      <div className="dashboard-toolbar">
        <span className="dashboard-count">{equipment.filter((item) => item.status === "pending").length} pending approval</span>
        <select aria-label="Filter equipment by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="dashboard-control">
          <option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
        </select>
      </div>
      {error && <div role="alert" className="dashboard-error">{error} <button className="dashboard-action" onClick={() => void load()}>Retry</button></div>}
      <div className="dashboard-card-grid">
        {loading ? <p className="dashboard-empty">Loading equipment…</p> : filtered.map((item) => (
          <article key={item._id} className="dashboard-card">
            {item.image && <div className="dashboard-card-media"><img src={item.image} alt={item.name} /></div>}
            <div className="dashboard-card-body">
              <div className="dashboard-card-topline">
                <div><h2 className="dashboard-card-title">{item.name}</h2><p className="dashboard-card-copy">{item.category} · {item.location}</p></div>
                <span className={`dashboard-status dashboard-status-${item.status || "pending"}`}>{item.status || "pending"}</span>
              </div>
              <p className="dashboard-card-copy">Listed by {item.ownerName || "Equipment owner"} · {item.ownerEmail || "—"}</p>
              <dl className="dashboard-card-details">
                <div><dt>Rental price</dt><dd>৳{item.price.toLocaleString()} / {item.rentalType}</dd></div>
                <div><dt>Available</dt><dd>{item.availableQuantity}</dd></div>
                <div><dt>Condition</dt><dd>{item.condition || "—"}</dd></div>
                <div><dt>Submitted</dt><dd>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</dd></div>
              </dl>
              <div className="dashboard-card-actions">
                {item.status === "pending" && <>
                  <button disabled={busy === item._id} onClick={() => void updateStatus(item, "approved")} className="dashboard-action dashboard-action-primary">Approve</button>
                  <button disabled={busy === item._id} onClick={() => void updateStatus(item, "rejected")} className="dashboard-action dashboard-action-danger">Reject</button>
                </>}
                <button onClick={() => { setEditing(item); setForm({ name: item.name, price: item.price, availableQuantity: item.availableQuantity, location: item.location }); }} className="dashboard-action">Update</button>
                <button disabled={busy === item._id} onClick={() => void remove(item)} className="dashboard-action dashboard-action-danger">Delete</button>
              </div>
            </div>
          </article>
        ))}
        {!loading && !filtered.length && <p className="dashboard-empty">No equipment matches this status.</p>}
      </div>
      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
        <section role="dialog" aria-modal="true" aria-labelledby="admin-equipment-dialog-title" className="dashboard-modal">
          <h2 id="admin-equipment-dialog-title" className="text-xl font-semibold">Update equipment</h2>
          <div className="mt-4 space-y-3">
            <label className="block">Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label className="block">Location<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
            <label className="block">Price<input type="number" min="1" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></label>
            <label className="block">Available quantity<input type="number" min="0" value={form.availableQuantity} onChange={(event) => setForm({ ...form, availableQuantity: Number(event.target.value) })} /></label>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => setEditing(null)} className="dashboard-action">Cancel</button>
            <button disabled={Boolean(busy)} onClick={() => void save()} className="dashboard-action dashboard-action-primary">{busy ? "Saving…" : "Save changes"}</button>
          </div>
        </section>
      </div>}
    </div>
  );
}
