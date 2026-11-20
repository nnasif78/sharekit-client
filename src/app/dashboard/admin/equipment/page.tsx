"use client";

import { apiFetch } from "@/lib/api-request";
import { notifySuccess, reportError } from "@/lib/notifications";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  compareDate,
  DashboardCollectionPagination,
  DashboardCollectionToolbar,
  useDashboardCollection,
  type DashboardSortOption,
} from "@/components/dashboard-collection-controls";

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
const equipmentSearchText = (item: Equipment) =>
  `${item.name} ${item.category} ${item.location} ${item.ownerName} ${item.ownerEmail} ${item.status}`;
const equipmentSortOptions: DashboardSortOption<Equipment>[] = [
  { value: "newest", label: "Submitted: newest", compare: (a, b) => compareDate(b.createdAt, a.createdAt) },
  { value: "oldest", label: "Submitted: oldest", compare: (a, b) => compareDate(a.createdAt, b.createdAt) },
  { value: "name-asc", label: "Name: A to Z", compare: (a, b) => a.name.localeCompare(b.name) },
  { value: "price-low", label: "Price: low to high", compare: (a, b) => a.price - b.price },
  { value: "price-high", label: "Price: high to low", compare: (a, b) => b.price - a.price },
];

const statusBadgeClass = (status: string) => {
  if (status === "approved") {
    return "border-emerald-700/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300";
  }
  if (status === "rejected") {
    return "border-red-700/30 bg-red-500/10 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300";
  }
  return "border-amber-600/30 bg-amber-500/10 text-amber-800 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-300";
};

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
      setError(reportError(err, "Could not load equipment."));
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
      .catch((err: unknown) => { if (active) setError(reportError(err, "Could not load equipment.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(
    () => equipment.filter((item) => statusFilter === "all" || item.status === statusFilter),
    [equipment, statusFilter],
  );
  const collection = useDashboardCollection({
    items: filtered,
    getSearchText: equipmentSearchText,
    sortOptions: equipmentSortOptions,
    initialSort: "newest",
  });

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
      notifySuccess(`Listing ${status}.`);
      await load();
    } catch (err) {
      setError(reportError(err, "Status update failed."));
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
      notifySuccess("Equipment listing updated.");
      setEditing(null);
      await load();
    } catch (err) {
      setError(reportError(err, "Equipment update failed."));
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
      notifySuccess("Equipment listing deleted.");
      await load();
    } catch (err) {
      setError(reportError(err, "Delete failed."));
    } finally {
      setBusy("");
    }
  };

  const pendingCount = equipment.filter((item) => item.status === "pending").length;

  return (
    <div className="space-y-8 text-zinc-950 dark:text-zinc-100">

      <header className="flex flex-col justify-between gap-4 border-b border-stone-200/90 pb-6 sm:flex-row sm:items-end dark:border-zinc-800/90">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
            Admin Inventory Control
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            All Equipment
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Review submissions, moderate statuses, and edit live inventory records.
          </p>
        </div>

        <button
          onClick={() => void load()}
          className="inline-flex shrink-0 items-center justify-center border border-stone-300 bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider text-zinc-900 transition-colors hover:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-400"
        >
          Refresh
        </button>
      </header>


      <DashboardCollectionToolbar
        search={collection.search}
        onSearchChange={collection.setSearch}
        searchLabel="Search equipment"
        searchPlaceholder="Search listing, category, location, or owner"
        sort={collection.sort}
        onSortChange={collection.setSort}
        sortOptions={equipmentSortOptions}
        pageSize={collection.pageSize}
        onPageSizeChange={collection.setPageSize}
      >
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <strong className="font-semibold text-zinc-950 dark:text-amber-300">{pendingCount}</strong> pending approval
        </span>

        <select
          aria-label="Filter equipment by status"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            collection.setPage(1);
          }}
          className="border border-stone-300 bg-[#F7F6F2] px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-zinc-900 focus:border-zinc-950 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-amber-300"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </DashboardCollectionToolbar>


      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 border border-red-200 bg-red-50/80 px-5 py-3.5 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300"
        >
          <span>{error}</span>
          <button
            onClick={() => void load()}
            className="border border-red-300 bg-white px-3 py-1 font-mono text-xs uppercase tracking-wider text-red-800 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900/60"
          >
            Retry
          </button>
        </div>
      )}


      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="col-span-full border border-stone-200/90 bg-white py-16 text-center font-mono text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
            Loading equipment…
          </p>
        ) : (
          collection.visibleItems.map((item) => {
            const isBusy = busy === item._id;
            const currentStatus = item.status || "pending";

            return (
              <article
                key={item._id}
                className="flex flex-col justify-between border border-stone-200/90 bg-white transition-colors hover:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-600"
              >
                <div>
                  {item.image && (
                    <div className="aspect-[16/10] w-full overflow-hidden border-b border-stone-200/80 bg-stone-100 dark:border-zinc-800 dark:bg-zinc-950">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-medium tracking-tight text-zinc-950 dark:text-white">
                          {item.name}
                        </h2>
                        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          {item.category} · {item.location}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${statusBadgeClass(currentStatus)}`}
                      >
                        {currentStatus}
                      </span>
                    </div>

                    <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                      Listed by{" "}
                      <span className="font-medium text-zinc-900 dark:text-zinc-200">
                        {item.ownerName || "Equipment owner"}
                      </span>{" "}
                      · <span className="font-mono text-[11px]">{item.ownerEmail || "—"}</span>
                    </p>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-100 pt-4 dark:border-zinc-800/90">
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Rental price
                        </dt>
                        <dd className="mt-0.5 font-mono text-sm font-medium text-zinc-950 dark:text-zinc-100">
                          ৳{item.price.toLocaleString()} / {item.rentalType}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Available
                        </dt>
                        <dd className="mt-0.5 font-mono text-sm font-medium text-zinc-950 dark:text-zinc-100">
                          {item.availableQuantity}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Condition
                        </dt>
                        <dd className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">
                          {item.condition || "—"}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Submitted
                        </dt>
                        <dd className="mt-0.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>


                <div className="flex flex-wrap items-center gap-2 border-t border-stone-200/80 bg-[#F7F6F2]/70 px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-950/60">
                  {item.status === "pending" && (
                    <>
                      <button
                        disabled={isBusy}
                        onClick={() => void updateStatus(item, "approved")}
                        className="border border-zinc-950 bg-zinc-950 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
                      >
                        Approve
                      </button>
                      <button
                        disabled={isBusy}
                        onClick={() => void updateStatus(item, "rejected")}
                        className="border border-red-300 bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800/80 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-950/60"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setEditing(item);
                      setForm({
                        name: item.name,
                        price: item.price,
                        availableQuantity: item.availableQuantity,
                        location: item.location,
                      });
                    }}
                    className="border border-stone-300 bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-zinc-800 transition-colors hover:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-400"
                  >
                    Update
                  </button>

                  <button
                    disabled={isBusy}
                    onClick={() => void remove(item)}
                    className="ml-auto border border-transparent px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:border-red-900/70 dark:hover:bg-red-950/50"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })
        )}

        {!loading && !collection.totalItems && (
          <p className="col-span-full border border-stone-200/90 bg-white py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
            {equipment.length ? "No listings match your search or filters." : "No equipment found."}
          </p>
        )}
      </div>
      {!loading && <DashboardCollectionPagination
        page={collection.page}
        pageCount={collection.pageCount}
        pageSize={collection.pageSize}
        totalItems={collection.totalItems}
        onPageChange={collection.setPage}
      />}


      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-equipment-dialog-title"
            className="w-full max-w-md border border-stone-200 bg-[#F7F6F2] p-6 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
              Edit Record
            </p>
            <h2 id="admin-equipment-dialog-title" className="mt-1 text-xl font-medium tracking-tight">
              Update equipment
            </h2>

            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Name
                </span>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-zinc-950 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-amber-300"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Location
                </span>
                <input
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  className="w-full border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-zinc-950 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-amber-300"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Price
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                    className="w-full border border-stone-300 bg-white px-3.5 py-2.5 font-mono text-sm text-zinc-950 focus:border-zinc-950 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-amber-300"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Available quantity
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.availableQuantity}
                    onChange={(event) => setForm({ ...form, availableQuantity: Number(event.target.value) })}
                    className="w-full border border-stone-300 bg-white px-3.5 py-2.5 font-mono text-sm text-zinc-950 focus:border-zinc-950 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-amber-300"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-stone-200 pt-4 dark:border-zinc-800">
              <button
                onClick={() => setEditing(null)}
                className="border border-stone-300 bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider text-zinc-800 transition-colors hover:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-400"
              >
                Cancel
              </button>
              <button
                disabled={Boolean(busy)}
                onClick={() => void save()}
                className="border border-zinc-950 bg-zinc-950 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}