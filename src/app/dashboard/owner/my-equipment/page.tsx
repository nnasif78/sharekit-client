"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteEquipment, Equipment, getMyEquipment, updateEquipment } from "@/lib/equipment";

const money = (amount: number) => `৳${amount.toLocaleString()}`;

export default function MyEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", price: 0, availableQuantity: 0 });

  const refresh = useCallback(async () => {
    try {
      const data = await getMyEquipment();
      setError("");
      setEquipment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load equipment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getMyEquipment()
      .then((data) => { if (active) setEquipment(data); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Could not load equipment."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => equipment.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) && (status === "all" || item.status === status)
  ), [equipment, search, status]);

  const openEditor = (item: Equipment) => {
    setSelected(item);
    setForm({ name: item.name, price: item.price, availableQuantity: item.availableQuantity });
    setEditing(true);
  };

  const save = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      setError("");
      await updateEquipment(selected._id, form);
      setEditing(false);
      setSelected(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Equipment) => {
    if (!window.confirm(`Delete “${item.name}”?`)) return;
    try {
      setError("");
      await deleteEquipment(item._id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <div>
      <header className="dashboard-page-heading">
        <div><p className="dashboard-eyebrow">OWNER DASHBOARD</p><h1>My Equipment</h1><p>Manage your listings and their approval status.</p></div>
        <span className="dashboard-count">{equipment.length} listings</span>
      </header>
      {error && <div role="alert" className="dashboard-error">{error} <button className="dashboard-action" onClick={() => void refresh()}>Retry</button></div>}
      <div className="dashboard-toolbar">
        <input aria-label="Search equipment" placeholder="Search by equipment name" value={search} onChange={(event) => setSearch(event.target.value)} className="dashboard-control dashboard-search" />
        <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="dashboard-control">
          <option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="dashboard-card-grid">
        {loading ? <p className="dashboard-empty">Loading your equipment…</p> : filtered.map((item) => (
          <article key={item._id} className="dashboard-card">
            {item.image && <div className="dashboard-card-media"><img src={item.image} alt={item.name} /></div>}
            <div className="dashboard-card-body">
              <div className="dashboard-card-topline">
                <div><h2 className="dashboard-card-title">{item.name}</h2><p className="dashboard-card-copy">{item.category} · {item.location}</p></div>
                <span className={`dashboard-status dashboard-status-${item.status || "pending"}`}>{item.status || "pending"}</span>
              </div>
              <dl className="dashboard-card-details">
                <div><dt>Rental price</dt><dd>{money(item.price)} / {item.rentalType}</dd></div>
                <div><dt>Available</dt><dd>{item.availableQuantity}</dd></div>
              </dl>
              <div className="dashboard-card-actions">
                <button className="dashboard-action dashboard-action-primary" onClick={() => openEditor(item)}>Update</button>
                <button className="dashboard-action" onClick={() => { setSelected(item); setEditing(false); }}>Details</button>
                <button className="dashboard-action dashboard-action-danger" onClick={() => void remove(item)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
        {!loading && !filtered.length && <p className="dashboard-empty">{equipment.length ? "No listings match these filters." : "You have not added any equipment yet."}</p>}
      </div>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSelected(null); setEditing(false); } }}>
        <section role="dialog" aria-modal="true" aria-labelledby="equipment-dialog-title" className="dashboard-modal">
          <div className="mb-4 flex items-start justify-between gap-4"><h2 id="equipment-dialog-title" className="text-xl font-semibold">{editing ? "Update equipment" : selected.name}</h2><button aria-label="Close" className="dashboard-action" onClick={() => { setSelected(null); setEditing(false); }}>Close</button></div>
          {editing ? <div className="space-y-4">
            <label className="block">Equipment name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label className="block">Rental price<input type="number" min="1" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></label>
            <label className="block">Available quantity<input type="number" min="0" value={form.availableQuantity} onChange={(event) => setForm({ ...form, availableQuantity: Number(event.target.value) })} /></label>
            <p className="text-sm text-amber-700">Saving changes sends this listing back for approval.</p>
            <div className="flex justify-end gap-3"><button className="dashboard-action" onClick={() => setEditing(false)}>Cancel</button><button disabled={saving} className="dashboard-action dashboard-action-primary" onClick={() => void save()}>{saving ? "Saving…" : "Save changes"}</button></div>
          </div> : <div className="space-y-4">
            {selected.image && <img src={selected.image} alt={selected.name} className="h-56 w-full rounded-xl object-cover" />}
            <p className="text-sm text-muted-foreground">{selected.category} · {selected.location}</p><p>{selected.description}</p>
            <dl className="dashboard-card-details">
              <div><dt>Price</dt><dd>{money(selected.price)} / {selected.rentalType}</dd></div><div><dt>Available</dt><dd>{selected.availableQuantity}</dd></div>
              <div><dt>Condition</dt><dd>{selected.condition}</dd></div><div><dt>Status</dt><dd>{selected.status}</dd></div>
              <div><dt>Brand / Model</dt><dd>{selected.brand || "—"} / {selected.model || "—"}</dd></div>
            </dl>
            {selected.rentalTerms && <p className="rounded-lg bg-muted p-3 text-sm"><strong>Rental terms:</strong> {selected.rentalTerms}</p>}
            <button className="dashboard-action" onClick={() => setSelected(null)}>Close</button>
          </div>}
        </section>
      </div>}
    </div>
  );
}
