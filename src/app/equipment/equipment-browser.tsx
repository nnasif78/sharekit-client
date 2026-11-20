
"use client";

import { apiFetch } from "@/lib/api-request";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { notifySuccess, reportError } from "@/lib/notifications";

interface Equipment {
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
}

const equipmentDetailsUrl = (item: Equipment) => {
  const slug = item.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "equipment";
  return `/equipment/${encodeURIComponent(slug)}`;
};

export default function EquipmentBrowser({ initialSearch = "", initialCategory = "" }: { initialSearch?: string; initialCategory?: string }) {
  const { data: session } = authClient.useSession();
  const isCustomer = (session?.user as { role?: string } | undefined)?.role === "customer";
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [rentalType, setRentalType] = useState("");
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteError, setFavoriteError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isCustomer) return;
    let active = true;
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/customer/favorites`, { credentials: "include", cache: "no-store" })
      .then(async (response) => { const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Could not load favorites."); return result.data || []; })
      .then((items) => { if (active) setFavorites(items.map((item: { _id: string }) => item._id)); })
      .catch((error: unknown) => { if (active) { setFavorites([]); reportError(error, "Could not load favorites."); } });
    return () => { active = false; };
  }, [isCustomer]);

  const toggleFavorite = async (id: string) => {
    const isFavorite = favorites.includes(id);
    try {
      setFavoriteError("");
      const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/customer/favorites/${id}`, { method: isFavorite ? "DELETE" : "POST", credentials: "include" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not update favorite.");
      setFavorites((items) => isFavorite ? items.filter((item) => item !== id) : [...items, id]);
      notifySuccess(isFavorite ? "Removed from favorites." : "Added to favorites.");
    } catch (err) { setFavoriteError(reportError(err, "Could not update favorite.")); }
  };

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (search.trim()) params.set("search", search.trim());
        if (category) params.set("category", category);
        if (rentalType) params.set("rentalType", rentalType);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (availability) params.set("availability", availability);
        if (sort) params.set("sort", sort);
        params.set("page", String(page));
        params.set("pageSize", "9");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/equipment?${params.toString()}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch equipment"
          );
        }

        setEquipment(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (err) {
        setError(reportError(err, "Something went wrong"));
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [search, category, rentalType, minPrice, maxPrice, availability, sort, page]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 text-zinc-900 dark:text-stone-100 sm:px-6 sm:py-14">
      <div className="mb-8 border-b border-stone-300 pb-7 dark:border-zinc-700">
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">ShareKit / Equipment index</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          All Equipment
        </h1>

        <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-300">
          Find the right equipment. Filter by price, schedule, and availability.
        </p>
      </div>

      <div className="mb-8 grid gap-3 border border-stone-300 bg-stone-50 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4 dark:border-zinc-700 dark:bg-zinc-900">
        <input
          type="search"
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="min-w-0 border border-stone-300 bg-white px-3 py-3 text-zinc-900 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100 dark:placeholder:text-zinc-400"
        />

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="min-w-0 border border-stone-300 bg-white px-3 py-3 text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
        >
          <option value="">All Categories</option>
          <option value="Construction Equipment">
            Construction Equipment
          </option>
          <option value="Photography Equipment">
            Photography Equipment
          </option>
          <option value="Vehicles & Transportation">
            Vehicles & Transportation
          </option>
          <option value="Agriculture Equipment">
            Agriculture Equipment
          </option>
          <option value="Electronics">Electronics</option>
          <option value="Event Equipment">Event Equipment</option>
          <option value="Tools">Tools</option>
          <option value="Other">Other</option>
        </select>

        <input type="number" min="0" aria-label="Minimum rental price" placeholder="Min price" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} className="min-w-0 border border-stone-300 bg-white px-3 py-3 text-zinc-900 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100 dark:placeholder:text-zinc-400" />
        <input type="number" min="0" aria-label="Maximum rental price" placeholder="Max price" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} className="min-w-0 border border-stone-300 bg-white px-3 py-3 text-zinc-900 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100 dark:placeholder:text-zinc-400" />
        <select aria-label="Filter availability" value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1); }} className="min-w-0 border border-stone-300 bg-white px-3 py-3 text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"><option value="">Any availability</option><option value="available">Available now</option><option value="unavailable">Currently unavailable</option></select>

        <select
          value={rentalType}
          onChange={(e) => { setRentalType(e.target.value); setPage(1); }}
          className="min-w-0 border border-stone-300 bg-white px-3 py-3 text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
        >
          <option value="">All Rental Types</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="min-w-0 border border-stone-300 bg-white px-3 py-3 text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
        >
          <option value="">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="recent">Recently Added</option>
        </select>
      </div>

      {loading && (
        <p className="border border-stone-300 py-10 text-center font-mono text-sm uppercase tracking-wider text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          Loading equipment...
        </p>
      )}

      {error && (
        <p className="border-l-2 border-red-600 bg-red-50 p-4 text-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {favoriteError && <p role="alert" className="mb-4 border-l-2 border-red-600 bg-red-50 p-3 text-red-800 dark:bg-red-950/40 dark:text-red-300">{favoriteError}</p>}

      {!loading && !error && equipment.length === 0 && (
        <div className="border border-stone-300 bg-stone-50 p-8 sm:p-12 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">No results</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-stone-100">
            No equipment available
          </h2>

          <p className="mt-2 text-zinc-600 dark:text-zinc-300">
            Approved equipment will appear here.
          </p>
        </div>
      )}

      {!loading && equipment.length > 0 && (
        <>
          <p className="mb-5 font-mono text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
            {equipment.length} equipment item(s) shown
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item) => (
              <article
                key={item._id}
                className="group relative flex h-full flex-col overflow-hidden border border-stone-300 bg-stone-50 transition-colors hover:border-amber-600 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-amber-400"
              >
                <Link href={equipmentDetailsUrl(item)} aria-label={`View details for ${item.name}`} className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"><span className="sr-only">Open {item.name} details</span></Link>
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-52 w-full shrink-0 object-cover"
                />

                <div className="flex flex-1 flex-col p-5">
                  <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-800 dark:text-amber-400">
                    {item.category}
                  </p>

                  <h2 className="min-h-14 text-xl font-semibold leading-7 tracking-tight text-zinc-900 dark:text-stone-100">
                    {item.name}
                  </h2>

                  <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {item.description}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-200 pt-4 text-sm dark:border-zinc-700">
                    <div className="col-span-2 min-w-0">
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Location</dt>
                      <dd className="mt-0.5 truncate" title={item.location}>{item.location}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Condition</dt>
                      <dd className="mt-0.5 truncate" title={item.condition}>{item.condition}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Availability</dt>
                      <dd className="mt-0.5 truncate">
                        {item.availableQuantity > 0 ? `${item.availableQuantity} available` : "Currently unavailable"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-auto">
                    <div className="mt-5 border-t border-stone-200 pt-4 dark:border-zinc-700">
                      <p className="font-mono text-xl font-semibold text-zinc-900 dark:text-stone-100">
                        ৳{item.price}
                        <span className="text-xs font-normal uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {" "}/ {item.rentalType}
                        </span>
                      </p>
                    </div>
                    <Link href={equipmentDetailsUrl(item)} className="relative z-20 mt-4 block w-full border border-zinc-900 bg-zinc-900 px-4 py-3 text-center font-mono text-xs font-semibold uppercase tracking-wider text-stone-50 hover:border-amber-700 hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-amber-400 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300">View details</Link>
                    {isCustomer && <button onClick={() => void toggleFavorite(item._id)} className="relative z-20 mt-3 w-full border border-stone-400 bg-transparent px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:border-amber-600 hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-600 dark:text-stone-200 dark:hover:border-amber-400 dark:hover:bg-zinc-800">{favorites.includes(item._id) ? "Remove from favorites" : "Add to favorites"}</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {totalPages > 1 && <nav aria-label="Equipment pages" className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="border border-stone-400 px-4 py-2 font-mono text-xs uppercase tracking-wider hover:border-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:hover:border-amber-400">Previous</button>
            <span className="px-2 font-mono text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="border border-stone-400 px-4 py-2 font-mono text-xs uppercase tracking-wider hover:border-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:hover:border-amber-400">Next</button>
          </nav>}
        </>
      )}
    </main>
  );
}
