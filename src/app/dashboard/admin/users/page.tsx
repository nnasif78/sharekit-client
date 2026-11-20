"use client";
import { apiFetch } from "@/lib/api-request";

import { useCallback, useEffect, useMemo, useState } from "react";

type AdminUser = { _id: string; name: string; email: string; role: "customer" | "owner" | "admin"; createdAt?: string; disabled: boolean };
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const load = useCallback(async () => {
    try { setError(""); const response = await apiFetch(`${API}/api/admin/users`, { credentials: "include", cache: "no-store" }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Could not load users."); setUsers(result.data || []); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load users."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { let active = true; apiFetch(`${API}/api/admin/users`, { credentials: "include", cache: "no-store" }).then(async (r) => { const data = await r.json(); if (!r.ok || !data.success) throw new Error(data.message || "Could not load users."); return data.data || []; }).then((data) => { if (active) setUsers(data); }).catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : "Could not load users."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const filtered = useMemo(() => users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())), [users, search]);
  const updateUser = async (user: AdminUser, payload: { role?: string; disabled?: boolean }) => {
    const action = payload.role ? "role" : "access";
    try { setBusy(user._id); setError(""); const response = await apiFetch(`${API}/api/admin/users/${user._id}/${action}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Could not update user."); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not update user."); }
    finally { setBusy(""); }
  };
  return <div><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-gray-500">ADMIN DASHBOARD</p><h1 className="mt-1 text-3xl font-bold">All Users</h1><p className="mt-2 text-gray-600">Review accounts, assign roles, and manage access.</p></div><span className="rounded-full bg-gray-100 px-4 py-2 text-sm">{users.length} users</span></div>
    {error && <div role="alert" className="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm text-red-700"><span>{error}</span><button onClick={() => void load()} className="font-semibold underline">Retry</button></div>}
    <input aria-label="Search users" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 w-full rounded-lg border bg-white p-3 sm:max-w-sm"/>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[840px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Name", "Email", "Role", "Registration Date", "Account", "Manage Users"].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y">{filtered.map((user) => <tr key={user._id}><td className="px-4 py-4 font-medium">{user.name || "—"}</td><td className="px-4 py-4">{user.email}</td><td className="px-4 py-4"><select aria-label={`Role for ${user.name}`} disabled={busy === user._id} value={user.role} onChange={(e) => void updateUser(user, { role: e.target.value })} className="rounded-lg border p-2"><option value="customer">Customer</option><option value="owner">Owner</option><option value="admin">Admin</option></select></td><td className="px-4 py-4">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td><td className="px-4 py-4"><span className={user.disabled ? "text-red-700" : "text-green-700"}>{user.disabled ? "Disabled" : "Active"}</span></td><td className="px-4 py-4"><button disabled={busy === user._id} onClick={() => void updateUser(user, { disabled: !user.disabled })} className="rounded-lg border px-3 py-2 hover:bg-gray-50 disabled:opacity-50">{busy === user._id ? "Saving…" : user.disabled ? "Restore access" : "Disable access"}</button></td></tr>)}</tbody></table>{loading ? <p className="p-10 text-center text-gray-500">Loading users…</p> : !filtered.length && <p className="p-10 text-center text-gray-500">No users found.</p>}</div>
  </div>;
}
