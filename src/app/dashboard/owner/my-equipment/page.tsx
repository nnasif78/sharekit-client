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
    try { setLoading(true); setError(""); setEquipment(await getMyEquipment()); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load equipment."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    getMyEquipment().then((data) => { if (active) setEquipment(data); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Could not load equipment."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => equipment.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) && (status === "all" || item.status === status)
  ), [equipment, search, status]);

  const save = async () => {
    if (!selected) return;
    try {
      setSaving(true); setError("");
      await updateEquipment(selected._id, form);
      setEditing(false); setSelected(null); await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Update failed."); }
    finally { setSaving(false); }
  };

  const remove = async (item: Equipment) => {
    if (!window.confirm(`Delete “${item.name}”?`)) return;
    try { setError(""); await deleteEquipment(item._id); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Delete failed."); }
  };

  if (loading) return <p className="py-10 text-gray-500">Loading your equipment…</p>;
  return <div>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-gray-500">OWNER DASHBOARD</p><h1 className="mt-1 text-3xl font-bold">My Equipment</h1><p className="mt-2 text-gray-600">Manage your listings and their approval status.</p></div><span className="rounded-full bg-gray-100 px-4 py-2 text-sm">{equipment.length} listings</span></div>
    {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mb-4 flex flex-col gap-3 sm:flex-row"><input aria-label="Search equipment" placeholder="Search by equipment name" value={search} onChange={(e) => setSearch(e.target.value)} className="min-w-0 flex-1 rounded-lg border p-3"/><select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border p-3"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Equipment Name", "Category", "Rental Price", "Available Quantity", "Status", "Actions"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y">{filtered.map((item) => <tr key={item._id}><td className="px-4 py-4 font-medium">{item.name}</td><td className="px-4 py-4">{item.category}</td><td className="px-4 py-4">{money(item.price)} / {item.rentalType}</td><td className="px-4 py-4">{item.availableQuantity}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "approved" ? "bg-green-100 text-green-800" : item.status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{item.status || "pending"}</span></td><td className="px-4 py-4"><div className="flex gap-3"><button className="font-medium text-blue-700 hover:underline" onClick={() => { setSelected(item); setForm({ name: item.name, price: item.price, availableQuantity: item.availableQuantity }); setEditing(true); }}>Update</button><button className="font-medium text-gray-700 hover:underline" onClick={() => { setSelected(item); setEditing(false); }}>Details</button><button className="font-medium text-red-700 hover:underline" onClick={() => void remove(item)}>Delete</button></div></td></tr>)}</tbody></table>
      {filtered.length === 0 && <p className="p-10 text-center text-gray-500">{equipment.length ? "No listings match these filters." : "You have not added any equipment yet."}</p>}
    </div>
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) { setSelected(null); setEditing(false); } }}><section role="dialog" aria-modal="true" aria-labelledby="equipment-dialog-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="mb-4 flex items-start justify-between"><h2 id="equipment-dialog-title" className="text-xl font-semibold">{editing ? "Update equipment" : selected.name}</h2><button aria-label="Close" onClick={() => { setSelected(null); setEditing(false); }}>✕</button></div>
      {editing ? <div className="space-y-4"><label className="block text-sm">Equipment name<input className="mt-1 w-full rounded-lg border p-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></label><label className="block text-sm">Rental price<input type="number" min="1" className="mt-1 w-full rounded-lg border p-3" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}/></label><label className="block text-sm">Available quantity<input type="number" min="0" className="mt-1 w-full rounded-lg border p-3" value={form.availableQuantity} onChange={(e) => setForm({ ...form, availableQuantity: Number(e.target.value) })}/></label><p className="text-sm text-amber-700">Saving changes sends this listing back for approval.</p><div className="flex justify-end gap-3"><button className="rounded-lg border px-4 py-2" onClick={() => setEditing(false)}>Cancel</button><button disabled={saving} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50" onClick={() => void save()}>{saving ? "Saving…" : "Save changes"}</button></div></div> : <div className="space-y-4"><img src={selected.image} alt={selected.name} className="h-56 w-full rounded-xl object-cover"/><p className="text-sm text-gray-500">{selected.category} · {selected.location}</p><p>{selected.description}</p><dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-gray-500">Price</dt><dd>{money(selected.price)} / {selected.rentalType}</dd></div><div><dt className="text-gray-500">Available</dt><dd>{selected.availableQuantity}</dd></div><div><dt className="text-gray-500">Condition</dt><dd>{selected.condition}</dd></div><div><dt className="text-gray-500">Status</dt><dd>{selected.status}</dd></div><div><dt className="text-gray-500">Brand / Model</dt><dd>{selected.brand || "—"} / {selected.model || "—"}</dd></div></dl>{selected.rentalTerms && <p className="rounded-lg bg-gray-50 p-3 text-sm"><strong>Rental terms:</strong> {selected.rentalTerms}</p>}<button className="rounded-lg border px-4 py-2" onClick={() => setSelected(null)}>Close</button></div>}
    </section></div>}
  </div>;
}
