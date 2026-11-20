"use client";

import { apiFetch } from "@/lib/api-request";
import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<Equipment[]>([]);
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch(`${API}/api/customer/favorites`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not load favorites.");
        return result.data || [];
      })
      .then((data) => { if (active) setFavorites(data); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Could not load favorites."); })
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove favorite.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <header className="dashboard-page-heading">
        <div><p className="dashboard-eyebrow">CUSTOMER DASHBOARD</p><h1>Favorites</h1><p>Equipment you have saved for later.</p></div>
        <span className="dashboard-count">{favorites.length} saved</span>
      </header>
      {error && <p role="alert" className="dashboard-error">{error}</p>}
      <div className="dashboard-card-grid">
        {loading ? <p className="dashboard-empty">Loading favorites…</p> : favorites.map((item) => (
          <article key={item._id} className="dashboard-card">
            {item.image && <div className="dashboard-card-media"><img src={item.image} alt={item.name} /></div>}
            <div className="dashboard-card-body">
              <div><h2 className="dashboard-card-title">{item.name}</h2><p className="dashboard-card-copy">{item.category} · {item.location}</p></div>
              <dl className="dashboard-card-details">
                <div><dt>Rental price</dt><dd>৳{item.price.toLocaleString()} / {item.rentalType}</dd></div>
                <div><dt>Available</dt><dd>{item.availableQuantity}</dd></div>
              </dl>
              <div className="dashboard-card-actions">
                <button onClick={() => setSelected(item)} className="dashboard-action dashboard-action-primary">View details</button>
                <button disabled={busy === item._id} onClick={() => void remove(item)} className="dashboard-action dashboard-action-danger">{busy === item._id ? "Removing…" : "Remove favorite"}</button>
              </div>
            </div>
          </article>
        ))}
        {!loading && !favorites.length && <div className="dashboard-empty">You have not saved any equipment yet.<br /><Link href="/equipment" className="mt-3 inline-block font-semibold text-primary hover:underline">Browse equipment</Link></div>}
      </div>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="favorite-title" className="dashboard-modal">
          <div className="mb-4 flex justify-between gap-4"><h2 id="favorite-title" className="text-xl font-semibold">{selected.name}</h2><button aria-label="Close" className="dashboard-action" onClick={() => setSelected(null)}>Close</button></div>
          {selected.image && <img src={selected.image} alt={selected.name} className="h-56 w-full rounded-xl object-cover" />}
          <p className="mt-4 text-sm text-muted-foreground">{selected.category} · {selected.location}</p>
          <p className="mt-2">{selected.description}</p>
          <p className="mt-3 text-sm">{selected.condition} · {selected.availableQuantity} available · ৳{selected.price.toLocaleString()} / {selected.rentalType}</p>
          <button className="mt-5 dashboard-action" onClick={() => setSelected(null)}>Close</button>
        </section>
      </div>}
    </div>
  );
}
