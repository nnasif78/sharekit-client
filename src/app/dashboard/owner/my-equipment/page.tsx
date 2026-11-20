"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteEquipment, Equipment, getMyEquipment, updateEquipment } from "@/lib/equipment";
import { notifySuccess, reportError } from "@/lib/notifications";
import {
  DashboardCollectionPagination,
  DashboardCollectionToolbar,
  useDashboardCollection,
  type DashboardSortOption,
} from "@/components/dashboard-collection-controls";

const money = (amount: number) => `৳${amount.toLocaleString()}`;
const equipmentSearchText = (item: Equipment) =>
  `${item.name} ${item.category} ${item.location} ${item.brand || ""} ${item.model || ""} ${item.status || ""}`;
const equipmentSortOptions: DashboardSortOption<Equipment>[] = [
  { value: "name-asc", label: "Name: A to Z", compare: (a, b) => a.name.localeCompare(b.name) },
  { value: "name-desc", label: "Name: Z to A", compare: (a, b) => b.name.localeCompare(a.name) },
  { value: "price-low", label: "Price: low to high", compare: (a, b) => a.price - b.price },
  { value: "price-high", label: "Price: high to low", compare: (a, b) => b.price - a.price },
  { value: "quantity-high", label: "Availability: most", compare: (a, b) => b.availableQuantity - a.availableQuantity },
  { value: "quantity-low", label: "Availability: least", compare: (a, b) => a.availableQuantity - b.availableQuantity },
];

export default function MyEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      setError(reportError(err, "Could not load equipment."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getMyEquipment()
      .then((data) => { if (active) setEquipment(data); })
      .catch((err: unknown) => { if (active) setError(reportError(err, "Could not load equipment.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredByStatus = useMemo(
    () => equipment.filter((item) => status === "all" || item.status === status),
    [equipment, status],
  );
  const collection = useDashboardCollection({
    items: filteredByStatus,
    getSearchText: equipmentSearchText,
    sortOptions: equipmentSortOptions,
    initialSort: "name-asc",
  });

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
      notifySuccess("Equipment listing updated.");
      setEditing(false);
      setSelected(null);
      await refresh();
    } catch (err) {
      setError(reportError(err, "Update failed."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Equipment) => {
    if (!window.confirm(`Delete “${item.name}”?`)) return;
    try {
      setError("");
      await deleteEquipment(item._id);
      notifySuccess("Equipment listing deleted.");
      await refresh();
    } catch (err) {
      setError(reportError(err, "Delete failed."));
    }
  };

  return (
    <div className="space-y-7 text-zinc-950 dark:text-zinc-100">
      <header className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end dark:border-zinc-800">
        <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Owner Inventory</p><h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">My Equipment</h1><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Manage your listings and their approval status.</p></div>
        <span className="border border-stone-300 px-3 py-2 font-mono text-xs uppercase tracking-wider text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">{equipment.length} listings</span>
      </header>
      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300"><span>{error}</span><button className="border border-red-300 px-3 py-1 font-mono text-xs uppercase tracking-wider" onClick={() => void refresh()}>Retry</button></div>}
      <DashboardCollectionToolbar
        search={collection.search}
        onSearchChange={collection.setSearch}
        searchLabel="Search equipment"
        searchPlaceholder="Search name, category, location, or brand"
        sort={collection.sort}
        onSortChange={collection.setSort}
        sortOptions={equipmentSortOptions}
        pageSize={collection.pageSize}
        onPageSizeChange={collection.setPageSize}
      >
        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <span>Status</span>
          <select
            aria-label="Filter equipment by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              collection.setPage(1);
            }}
            className="border border-stone-300 bg-[#F7F6F2] px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
        </label>
      </DashboardCollectionToolbar>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <p className="col-span-full border border-stone-200 bg-white py-16 text-center font-mono text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">Loading your equipment…</p> : collection.visibleItems.map((item) => (
          <article key={item._id} className="border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
            {item.image && <div className="aspect-[16/10] border-b border-stone-200 bg-stone-100 dark:border-zinc-800 dark:bg-zinc-950"><img src={item.image} alt={item.name} className="h-full w-full object-cover" /></div>}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="text-lg font-medium tracking-tight">{item.name}</h2><p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{item.category} · {item.location}</p></div>
                <span className="border border-amber-600/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-800 dark:border-amber-300/30 dark:text-amber-300">{item.status || "pending"}</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-100 pt-4 dark:border-zinc-800">
                <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Rental price</dt><dd className="mt-0.5 font-mono text-sm">{money(item.price)} / {item.rentalType}</dd></div>
                <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Available</dt><dd className="mt-0.5 font-mono text-sm">{item.availableQuantity}</dd></div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-stone-100 pt-4 dark:border-zinc-800">
                <button className="border border-zinc-950 bg-zinc-950 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950" onClick={() => openEditor(item)}>Update</button>
                <button className="border border-stone-300 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider dark:border-zinc-700" onClick={() => { setSelected(item); setEditing(false); }}>Details</button>
                <button className="ml-auto border border-red-300 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-red-700 dark:border-red-800 dark:text-red-300" onClick={() => void remove(item)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
        {!loading && !collection.totalItems && <p className="col-span-full border border-stone-200 bg-white py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">{equipment.length ? "No listings match these filters." : "You have not added any equipment yet."}</p>}
      </div>
      {!loading && <DashboardCollectionPagination
        page={collection.page}
        pageCount={collection.pageCount}
        pageSize={collection.pageSize}
        totalItems={collection.totalItems}
        onPageChange={collection.setPage}
      />}
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSelected(null); setEditing(false); } }}>
        <section role="dialog" aria-modal="true" aria-labelledby="equipment-dialog-title" className="w-full max-w-lg border border-stone-200 bg-[#F7F6F2] p-6 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
          <div className="mb-4 flex items-start justify-between gap-4 border-b border-stone-200 pb-4 dark:border-zinc-800"><div><p className="font-mono text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-300">{editing ? "Edit Record" : "Listing Detail"}</p><h2 id="equipment-dialog-title" className="mt-1 text-xl font-medium">{editing ? "Update equipment" : selected.name}</h2></div><button aria-label="Close" className="border border-stone-300 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider dark:border-zinc-700" onClick={() => { setSelected(null); setEditing(false); }}>Close</button></div>
          {editing ? <div className="space-y-4">
            <label className="block">Equipment name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label className="block">Rental price<input type="number" min="1" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></label>
            <label className="block">Available quantity<input type="number" min="0" value={form.availableQuantity} onChange={(event) => setForm({ ...form, availableQuantity: Number(event.target.value) })} /></label>
            <p className="text-sm text-amber-700">Saving changes sends this listing back for approval.</p>
            <div className="flex justify-end gap-3 border-t border-stone-200 pt-4 dark:border-zinc-800"><button className="border border-stone-300 px-4 py-2 font-mono text-xs uppercase tracking-wider dark:border-zinc-700" onClick={() => setEditing(false)}>Cancel</button><button disabled={saving} className="border border-zinc-950 bg-zinc-950 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white disabled:opacity-50 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950" onClick={() => void save()}>{saving ? "Saving…" : "Save changes"}</button></div>
          </div> : <div className="space-y-4">
            {selected.image && <img src={selected.image} alt={selected.name} className="h-56 w-full border border-stone-200 object-cover dark:border-zinc-800" />}
            <p className="text-sm text-muted-foreground">{selected.category} · {selected.location}</p><p>{selected.description}</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-stone-200 py-4 dark:border-zinc-800">
              <div><dt>Price</dt><dd>{money(selected.price)} / {selected.rentalType}</dd></div><div><dt>Available</dt><dd>{selected.availableQuantity}</dd></div>
              <div><dt>Condition</dt><dd>{selected.condition}</dd></div><div><dt>Status</dt><dd>{selected.status}</dd></div>
              <div><dt>Brand / Model</dt><dd>{selected.brand || "—"} / {selected.model || "—"}</dd></div>
            </dl>
            {selected.rentalTerms && <p className="border border-stone-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"><strong>Rental terms:</strong> {selected.rentalTerms}</p>}
            <button className="border border-stone-300 px-4 py-2 font-mono text-xs uppercase tracking-wider dark:border-zinc-700" onClick={() => setSelected(null)}>Close</button>
          </div>}
        </section>
      </div>}
    </div>
  );
}
