"use client";
import { apiFetch } from "@/lib/api-request";

import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { notifySuccess, reportError } from "@/lib/notifications";

type Profile = { name: string; email: string; image: string; phoneNumber: string; address: string; role: string };
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DashboardProfile() {
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", image: "", phoneNumber: "", address: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { let active = true; apiFetch(`${API}/api/profile`, { credentials: "include", cache: "no-store" }).then(async (r) => { const result = await r.json(); if (!r.ok || !result.success) throw new Error(result.message || "Could not load profile."); return result.data; }).then((data) => { if (active) setProfile(data); }).catch((e: unknown) => { if (active) setError(reportError(e, "Could not load profile.")); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const change = (field: keyof Pick<Profile, "name" | "image" | "phoneNumber" | "address">, value: string) => setProfile((p) => ({ ...p, [field]: value }));
  const save = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setMessage("");
    try { setSaving(true); const response = await apiFetch(`${API}/api/profile`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: profile.name, image: profile.image, phoneNumber: profile.phoneNumber, address: profile.address }) }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Could not save profile."); setMessage("Profile updated."); notifySuccess("Profile updated."); }
    catch (e) { setError(reportError(e, "Could not save profile.")); }
    finally { setSaving(false); }
  };
  const role = profile.role || (session?.user as { role?: string } | undefined)?.role || "customer";
  if (loading) {
    return (
      <p className="py-10 font-mono text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Loading profile…
      </p>
    );
  }

  const fieldClassName =
    "mt-2 w-full border border-stone-300 bg-white px-3.5 py-2.5 font-sans text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-amber-300 dark:focus-visible:outline-amber-300";
  const labelClassName =
    "grid gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400";

  return (
    <div className="space-y-8 text-zinc-950 dark:text-zinc-100">
      <header className="border-b border-stone-200/90 pb-6 dark:border-zinc-800/90">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
          {role} profile
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
          Account profile
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Update your account details.
        </p>
      </header>

      <form
        onSubmit={save}
        className="max-w-3xl border border-stone-200/90 bg-white dark:border-zinc-800/90 dark:bg-zinc-900/60"
      >
        <div className="grid gap-6 p-5 sm:p-7">
          <div className="grid gap-4 border-b border-stone-200/90 pb-6 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-center dark:border-zinc-800/90">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden border border-stone-200 bg-[#F7F6F2] font-mono text-lg text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-amber-300">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.name.slice(0, 1).toUpperCase() || "U"
              )}
            </div>
            <label className={labelClassName} htmlFor="profile-image">
              Profile image URL
              <input
                id="profile-image"
                type="url"
                value={profile.image}
                onChange={(e) => change("image", e.target.value)}
                placeholder="https://…"
                className={fieldClassName}
              />
            </label>
          </div>

          <label className={labelClassName} htmlFor="profile-name">
            Name
            <input
              id="profile-name"
              required
              value={profile.name}
              onChange={(e) => change("name", e.target.value)}
              className={fieldClassName}
            />
          </label>

          <label className={labelClassName} htmlFor="profile-email">
            Email
            <input
              id="profile-email"
              readOnly
              value={profile.email}
              className={`${fieldClassName} bg-stone-100 text-zinc-500 dark:bg-zinc-950`}
            />
            <span className="font-sans text-xs normal-case tracking-normal text-zinc-500 dark:text-zinc-400">
              Email changes are handled by account support.
            </span>
          </label>

          <label className={labelClassName} htmlFor="profile-phone">
            Phone number
            <input
              id="profile-phone"
              type="tel"
              value={profile.phoneNumber}
              onChange={(e) => change("phoneNumber", e.target.value)}
              className={fieldClassName}
            />
          </label>

          <label className={labelClassName} htmlFor="profile-address">
            Address
            <textarea
              id="profile-address"
              rows={3}
              value={profile.address}
              onChange={(e) => change("address", e.target.value)}
              className={fieldClassName}
            />
          </label>
        </div>

        {(error || message) && (
          <div className="grid gap-3 px-5 pb-5 sm:px-7">
            {error && (
              <p
                role="alert"
                className="border border-red-700/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300"
              >
                {error}
              </p>
            )}
            {message && (
              <p
                role="status"
                className="border border-emerald-700/30 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
              >
                {message}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end border-t border-stone-200/90 bg-[#F7F6F2]/70 px-5 py-4 dark:border-zinc-800/90 dark:bg-zinc-950/60 sm:px-7">
          <button
            disabled={saving}
            className="border border-zinc-950 bg-zinc-950 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:opacity-50 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200 dark:focus-visible:outline-amber-300"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
