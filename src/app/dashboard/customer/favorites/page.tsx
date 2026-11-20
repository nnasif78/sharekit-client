"use client";

import { apiFetch } from "@/lib/api-request";
import { notifySuccess, reportError } from "@/lib/notifications";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
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
  brand?: string;
  model?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const favoriteSearchText = (item: Equipment) =>
  `${item.name} ${item.category} ${item.location} ${item.brand || ""} ${item.model || ""}`;
const favoriteSortOptions: DashboardSortOption<Equipment>[] = [
  { value: "name-asc", label: "Name: A to Z", compare: (a, b) => a.name.localeCompare(b.name) },
  { value: "name-desc", label: "Name: Z to A", compare: (a, b) => b.name.localeCompare(a.name) },
  { value: "price-low", label: "Price: low to high", compare: (a, b) => a.price - b.price },
  { value: "price-high", label: "Price: high to low", compare: (a, b) => b.price - a.price },
  { value: "available-high", label: "Availability: most", compare: (a, b) => b.availableQuantity - a.availableQuantity },
];

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<Equipment[]>([]);
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const collection = useDashboardCollection({
    items: favorites,
    getSearchText: favoriteSearchText,
    sortOptions: favoriteSortOptions,
    initialSort: "name-asc",
  });

  useEffect(() => {
    let active = true;
    apiFetch(`${API}/api/customer/favorites`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not load favorites.");
        return result.data || [];
      })
      .then((data) => { if (active) setFavorites(data); })
      .catch((err: unknown) => { if (active) setError(reportError(err, "Could not load favorites.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const remove = async (item: Equipment) => {
    try {
      setBusy(item._id);
      setError("");
      const response = await apiFetch(`${API}/api/customer/favorites/${item._id}`, { method: "DELETE", credentials: "include" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not remove favorite.");
      setFavorites((items) => items.filter((favorite) => favorite._id !== item._id));
      if (selected?._id === item._id) setSelected(null);
      notifySuccess("Removed from favorites.");
    } catch (err) {
      setError(reportError(err, "Could not remove favorite."));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-7 text-zinc-950 dark:text-zinc-100">
      <header className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end dark:border-zinc-800">
        <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Customer Saved Gear</p><h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">Favorites</h1><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Equipment you have saved for later.</p></div>
        <span className="border border-stone-300 px-3 py-2 font-mono text-xs uppercase tracking-wider text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">{favorites.length} saved</span>
      </header>
      {error && <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300">{error}</p>}
      <DashboardCollectionToolbar
        search={collection.search}
        onSearchChange={collection.setSearch}
        searchLabel="Search favorites"
        searchPlaceholder="Search by name, category, or location"
        sort={collection.sort}
        onSortChange={collection.setSort}
        sortOptions={favoriteSortOptions}
        pageSize={collection.pageSize}
        onPageSizeChange={collection.setPageSize}
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <p className="col-span-full border border-stone-200 bg-white py-16 text-center font-mono text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">Loading favorites…</p> : collection.visibleItems.map((item) => (
          <article key={item._id} className="border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
            {item.image && <div className="aspect-[16/10] border-b border-stone-200 bg-stone-100 dark:border-zinc-800 dark:bg-zinc-950"><img src={item.image} alt={item.name} className="h-full w-full object-cover" /></div>}
            <div className="p-5">
              <div><h2 className="text-lg font-medium tracking-tight">{item.name}</h2><p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{item.category} · {item.location}</p></div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-100 pt-4 dark:border-zinc-800">
                <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Rental price</dt><dd className="mt-0.5 font-mono text-sm">৳{item.price.toLocaleString()} / {item.rentalType}</dd></div>
                <div><dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Available</dt><dd className="mt-0.5 font-mono text-sm">{item.availableQuantity}</dd></div>
              </dl>
              <div className="mt-5 flex gap-2 border-t border-stone-100 pt-4 dark:border-zinc-800">
                <button onClick={() => setSelected(item)} className="border border-zinc-950 bg-zinc-950 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950">View details</button>
                <button disabled={busy === item._id} onClick={() => void remove(item)} className="border border-red-300 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-red-700 disabled:opacity-50 dark:border-red-800 dark:text-red-300">{busy === item._id ? "Removing…" : "Remove favorite"}</button>
              </div>
            </div>
          </article>
        ))}
        {!loading && !collection.totalItems && <div className="col-span-full border border-stone-200 bg-white py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">{favorites.length ? "No favorites match your search." : <>You have not saved any equipment yet.<br /><Link href="/equipment" className="mt-3 inline-block font-mono text-xs uppercase tracking-wider text-amber-700 hover:underline dark:text-amber-300">Browse equipment</Link></>}</div>}
      </div>
      {!loading && <DashboardCollectionPagination
        page={collection.page}
        pageCount={collection.pageCount}
        pageSize={collection.pageSize}
        totalItems={collection.totalItems}
        onPageChange={collection.setPage}
      />}
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="favorite-title" className="w-full max-w-lg border border-stone-200 bg-[#F7F6F2] p-6 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
          <div className="mb-4 flex justify-between gap-4 border-b border-stone-200 pb-4 dark:border-zinc-800"><div><p className="font-mono text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-300">Saved Item</p><h2 id="favorite-title" className="mt-1 text-xl font-medium">{selected.name}</h2></div><button aria-label="Close" className="border border-stone-300 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider dark:border-zinc-700" onClick={() => setSelected(null)}>Close</button></div>
          {selected.image && <img src={selected.image} alt={selected.name} className="h-56 w-full border border-stone-200 object-cover dark:border-zinc-800" />}
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{selected.category} · {selected.location}</p>
          <p className="mt-2">{selected.description}</p>
          <p className="mt-3 text-sm">{selected.condition} · {selected.availableQuantity} available · ৳{selected.price.toLocaleString()} / {selected.rentalType}</p>
          <button className="mt-5 border border-stone-300 px-4 py-2 font-mono text-xs uppercase tracking-wider dark:border-zinc-700" onClick={() => setSelected(null)}>Close</button>
        </section>
      </div>}
    </div>
  );
}
