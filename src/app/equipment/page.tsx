
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

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

export default function EquipmentPage() {
  const { data: session } = authClient.useSession();
  const isCustomer = (session?.user as { role?: string } | undefined)?.role === "customer";
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [rentalType, setRentalType] = useState("");
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteError, setFavoriteError] = useState("");

  useEffect(() => {
    if (!isCustomer) return;
    let active = true;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/customer/favorites`, { credentials: "include", cache: "no-store" })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.message || "Could not load favorites."); return result.data || []; })
      .then((items) => { if (active) setFavorites(items.map((item: { _id: string }) => item._id)); })
      .catch(() => { if (active) setFavorites([]); });
    return () => { active = false; };
  }, [isCustomer]);

  const toggleFavorite = async (id: string) => {
    const isFavorite = favorites.includes(id);
    try {
      setFavoriteError("");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/customer/favorites/${id}`, { method: isFavorite ? "DELETE" : "POST", credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update favorite.");
      setFavorites((items) => isFavorite ? items.filter((item) => item !== id) : [...items, id]);
    } catch (err) { setFavoriteError(err instanceof Error ? err.message : "Could not update favorite."); }
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

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/equipment?${params.toString()}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch equipment"
          );
        }

        setEquipment(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [search, category, rentalType, minPrice, maxPrice, availability, sort]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          All Equipment
        </h1>

        <p className="mt-2 text-gray-500">
          Find the equipment you need to rent.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border p-3"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border p-3"
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

        <input type="number" min="0" aria-label="Minimum rental price" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="rounded-lg border p-3" />
        <input type="number" min="0" aria-label="Maximum rental price" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="rounded-lg border p-3" />
        <select aria-label="Filter availability" value={availability} onChange={(e) => setAvailability(e.target.value)} className="rounded-lg border p-3"><option value="">Any availability</option><option value="available">Available now</option><option value="unavailable">Currently unavailable</option></select>

        <select
          value={rentalType}
          onChange={(e) => setRentalType(e.target.value)}
          className="rounded-lg border p-3"
        >
          <option value="">All Rental Types</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border p-3"
        >
          <option value="">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="recent">Recently Added</option>
        </select>
      </div>

      {loading && (
        <p className="py-10 text-center">
          Loading equipment...
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {favoriteError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{favoriteError}</p>}

      {!loading && !error && equipment.length === 0 && (
        <div className="rounded-lg border p-10 text-center">
          <h2 className="text-xl font-semibold">
            No equipment available
          </h2>

          <p className="mt-2 text-gray-500">
            Approved equipment will appear here.
          </p>
        </div>
      )}

      {!loading && equipment.length > 0 && (
        <>
          <p className="mb-5 text-gray-500">
            {equipment.length} equipment item(s) found
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item) => (
              <article
                key={item._id}
                className="group relative overflow-hidden rounded-xl border transition-shadow hover:shadow-lg"
              >
                <Link href={equipmentDetailsUrl(item)} aria-label={`View details for ${item.name}`} className="absolute inset-0 z-10 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><span className="sr-only">Open {item.name} details</span></Link>
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">
                  <p className="mb-2 text-sm text-gray-500">
                    {item.category}
                  </p>

                  <h2 className="text-xl font-semibold">
                    {item.name}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                    {item.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <strong>Location:</strong>{" "}
                      {item.location}
                    </p>

                    <p>
                      <strong>Condition:</strong>{" "}
                      {item.condition}
                    </p>

                    <p>
                      <strong>Availability:</strong>{" "}
                      {item.availableQuantity > 0 ? `${item.availableQuantity} available` : "Currently unavailable"}
                    </p>
                  </div>

                  <div className="mt-5 border-t pt-4">
                    <p className="text-xl font-bold">
                      ৳{item.price}
                      <span className="text-sm font-normal text-gray-500">
                        {" "}/ {item.rentalType}
                      </span>
                    </p>
                  </div>
                  <Link href={equipmentDetailsUrl(item)} className="relative z-20 mt-4 block w-full rounded-lg bg-black px-4 py-2.5 text-center font-medium text-white hover:bg-gray-800">View Details</Link>
                  {isCustomer && <button onClick={() => void toggleFavorite(item._id)} className="relative z-20 mt-4 w-full rounded-lg border bg-white px-4 py-2 font-medium hover:bg-gray-50">{favorites.includes(item._id) ? "Remove from favorites" : "Add to favorites"}</button>}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
