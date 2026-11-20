"use client";
import { apiFetch } from "@/lib/api-request";

import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Profile = { name: string; email: string; image: string; phoneNumber: string; address: string; role: string };
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DashboardProfile() {
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", image: "", phoneNumber: "", address: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { let active = true; apiFetch(`${API}/api/profile`, { credentials: "include", cache: "no-store" }).then(async (r) => { const result = await r.json(); if (!r.ok || !result.success) throw new Error(result.message || "Could not load profile."); return result.data; }).then((data) => { if (active) setProfile(data); }).catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : "Could not load profile."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const change = (field: keyof Pick<Profile, "name" | "image" | "phoneNumber" | "address">, value: string) => setProfile((p) => ({ ...p, [field]: value }));
  const save = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setMessage("");
    try { setSaving(true); const response = await apiFetch(`${API}/api/profile`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: profile.name, image: profile.image, phoneNumber: profile.phoneNumber, address: profile.address }) }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Could not save profile."); setMessage("Profile updated."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save profile."); }
    finally { setSaving(false); }
  };
  const role = profile.role || (session?.user as { role?: string } | undefined)?.role || "customer";
  if (loading) return <p className="py-10 text-gray-500">Loading your profile…</p>;
  return <div className="max-w-3xl"><p className="text-sm font-medium text-gray-500">{role.toUpperCase()} DASHBOARD</p><h1 className="mt-1 text-3xl font-bold">My Profile</h1><p className="mt-2 text-gray-600">Update the information shown on your account.</p><form onSubmit={save} className="mt-7 space-y-5 rounded-2xl border bg-white p-6"><div className="flex items-center gap-4 border-b pb-5"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xl font-semibold">{profile.image ? <img src={profile.image} alt="Profile" className="h-full w-full object-cover"/> : profile.name.slice(0, 1).toUpperCase() || "U"}</div><div className="min-w-0 flex-1"><label className="mb-1 block text-sm font-medium" htmlFor="profile-image">Profile image URL</label><input id="profile-image" type="url" value={profile.image} onChange={(e) => change("image", e.target.value)} placeholder="https://…" className="w-full rounded-lg border p-2.5"/></div></div><label className="block text-sm font-medium">Name<input required value={profile.name} onChange={(e) => change("name", e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label><label className="block text-sm font-medium">Email<input readOnly value={profile.email} className="mt-1 w-full rounded-lg border bg-gray-50 p-3 text-gray-500"/><span className="mt-1 block text-xs font-normal text-gray-500">Email changes are managed through account support.</span></label><label className="block text-sm font-medium">Phone number<input type="tel" value={profile.phoneNumber} onChange={(e) => change("phoneNumber", e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label><label className="block text-sm font-medium">Address<textarea rows={3} value={profile.address} onChange={(e) => change("address", e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}<button disabled={saving} className="rounded-lg bg-black px-5 py-3 font-medium text-white disabled:opacity-50">{saving ? "Saving…" : "Save profile"}</button></form></div>;
}
