"use client";

import { apiFetch } from "@/lib/api-request";
import { useCallback, useEffect, useMemo, useState } from "react";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "owner" | "admin";
  createdAt?: string;
  disabled: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await apiFetch(`${API}/api/admin/users`, { credentials: "include", cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not load users.");
      setError("");
      setUsers(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch(`${API}/api/admin/users`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Could not load users.");
        return result.data || [];
      })
      .then((data) => { if (active) setUsers(data); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Could not load users."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(
    () => users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())),
    [users, search],
  );

  const updateUser = async (user: AdminUser, payload: { role?: string; disabled?: boolean }) => {
    const action = payload.role ? "role" : "access";
    try {
      setBusy(user._id);
      setError("");
      const response = await apiFetch(`${API}/api/admin/users/${user._id}/${action}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not update user.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update user.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <header className="dashboard-page-heading">
        <div><p className="dashboard-eyebrow">ADMIN DASHBOARD</p><h1>All Users</h1><p>Review accounts, assign roles, and manage access.</p></div>
        <span className="dashboard-count">{users.length} users</span>
      </header>
      {error && <div role="alert" className="dashboard-error">{error} <button className="dashboard-action" onClick={() => void load()}>Retry</button></div>}
      <div className="dashboard-toolbar">
        <input aria-label="Search users" placeholder="Search name or email" value={search} onChange={(event) => setSearch(event.target.value)} className="dashboard-control dashboard-search" />
      </div>
      <div className="dashboard-card-grid">
        {loading ? <p className="dashboard-empty">Loading users…</p> : filtered.map((user) => {
          const initials = (user.name || user.email || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
          return (
            <article key={user._id} className="dashboard-card">
              <div className="dashboard-card-body">
                <div className="dashboard-user-heading">
                  <span className="dashboard-user-avatar">{initials}</span>
                  <div className="dashboard-user-name"><h2 className="dashboard-card-title">{user.name || "Unnamed user"}</h2><p className="dashboard-card-copy">{user.email}</p></div>
                  <span className={`dashboard-status ${user.disabled ? "dashboard-status-disabled" : "dashboard-status-active"}`}>{user.disabled ? "Disabled" : "Active"}</span>
                </div>
                <dl className="dashboard-card-details">
                  <div><dt>Registration</dt><dd>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</dd></div>
                  <div><dt>Account role</dt><dd className="capitalize">{user.role}</dd></div>
                </dl>
                <div className="dashboard-user-controls">
                  <label className="dashboard-user-role">Role
                    <select aria-label={`Role for ${user.name}`} disabled={busy === user._id} value={user.role} onChange={(event) => void updateUser(user, { role: event.target.value })} className="dashboard-control">
                      <option value="customer">Customer</option><option value="owner">Owner</option><option value="admin">Admin</option>
                    </select>
                  </label>
                  <button disabled={busy === user._id} onClick={() => void updateUser(user, { disabled: !user.disabled })} className={`dashboard-action ${user.disabled ? "dashboard-action-primary" : "dashboard-action-danger"}`}>
                    {busy === user._id ? "Saving…" : user.disabled ? "Restore access" : "Disable access"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {!loading && !filtered.length && <p className="dashboard-empty">{users.length ? "No users match your search." : "No users found."}</p>}
      </div>
    </div>
  );
}
