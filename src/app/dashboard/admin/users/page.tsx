"use client";

import { apiFetch } from "@/lib/api-request";
import { notifySuccess, reportError } from "@/lib/notifications";
import {
  compareDate,
  DashboardCollectionPagination,
  DashboardCollectionToolbar,
  useDashboardCollection,
  type DashboardSortOption,
} from "@/components/dashboard-collection-controls";
import { useCallback, useEffect, useState } from "react";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "owner" | "admin";
  createdAt?: string;
  disabled: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const userSearchText = (user: AdminUser) =>
  `${user.name} ${user.email} ${user.role} ${user.disabled ? "disabled" : "active"}`;
const userSortOptions: DashboardSortOption<AdminUser>[] = [
  { value: "name-asc", label: "Name: A to Z", compare: (a, b) => a.name.localeCompare(b.name) },
  { value: "name-desc", label: "Name: Z to A", compare: (a, b) => b.name.localeCompare(a.name) },
  { value: "newest", label: "Registration: newest", compare: (a, b) => compareDate(b.createdAt, a.createdAt) },
  { value: "oldest", label: "Registration: oldest", compare: (a, b) => compareDate(a.createdAt, b.createdAt) },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const collection = useDashboardCollection({
    items: users,
    getSearchText: userSearchText,
    sortOptions: userSortOptions,
    initialSort: "newest",
  });

  const load = useCallback(async () => {
    try {
      const response = await apiFetch(`${API}/api/admin/users`, { credentials: "include", cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not load users.");
      setError("");
      setUsers(result.data || []);
    } catch (err) {
      setError(reportError(err, "Could not load users."));
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
      .catch((err: unknown) => { if (active) setError(reportError(err, "Could not load users.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

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
      notifySuccess(payload.role ? "User role updated." : "User access updated.");
      await load();
    } catch (err) {
      setError(reportError(err, "Could not update user."));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-8 bg-[#F7F6F2] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex flex-col justify-between gap-4 border-b border-stone-200/90 pb-6 sm:flex-row sm:items-end dark:border-zinc-800/90">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
            Admin Access Control
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            All Users
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Review accounts, assign permissions, and manage platform access.
          </p>
        </div>

        <span className="border border-stone-200/90 bg-white px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
          {users.length} users
        </span>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 border border-red-200 bg-red-50/80 px-5 py-3.5 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300"
        >
          <span>{error}</span>
          <button
            onClick={() => void load()}
            className="border border-red-300 bg-white px-3 py-1 font-mono text-xs uppercase tracking-wider text-red-800 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900/60 dark:focus-visible:outline-red-300"
          >
            Retry
          </button>
        </div>
      )}

      <DashboardCollectionToolbar
        search={collection.search}
        onSearchChange={collection.setSearch}
        searchLabel="Search users"
        searchPlaceholder="Search name, email, or role"
        sort={collection.sort}
        onSortChange={collection.setSort}
        sortOptions={userSortOptions}
        pageSize={collection.pageSize}
        onPageSizeChange={collection.setPageSize}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="col-span-full border border-stone-200/90 bg-white py-16 text-center font-mono text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
            Loading users…
          </p>
        ) : (
          collection.visibleItems.map((user) => {
            const initials = (user.name || user.email || "U")
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            const isBusy = busy === user._id;

            return (
              <article
                key={user._id}
                className="flex flex-col border border-stone-200/90 bg-white transition-colors hover:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-600"
              >
                <div className="flex-1 space-y-5 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-stone-200 bg-[#F7F6F2] font-mono text-xs font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-amber-300">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-medium tracking-tight text-zinc-950 dark:text-white">
                          {user.name || "Unnamed user"}
                        </h2>
                        <p className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        user.disabled
                          ? "border-red-700/30 bg-red-500/10 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300"
                          : "border-emerald-700/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
                      }`}
                    >
                      {user.disabled ? "Disabled" : "Active"}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 dark:border-zinc-800/90">
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Registration
                      </dt>
                      <dd className="mt-1 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                      </dd>
                    </div>

                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Account role
                      </dt>
                      <dd className="mt-1 font-mono text-xs capitalize text-zinc-950 dark:text-zinc-100">
                        {user.role}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-3 border-t border-stone-200/80 bg-[#F7F6F2]/70 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/60 sm:px-6">
                  <label className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <span>Role</span>
                    <select
                      aria-label={`Role for ${user.name}`}
                      disabled={isBusy}
                      value={user.role}
                      onChange={(event) => void updateUser(user, { role: event.target.value })}
                      className="border border-stone-300 bg-white px-3 py-1.5 font-mono text-xs capitalize text-zinc-900 focus:border-zinc-950 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-amber-300 dark:focus-visible:outline-amber-300"
                    >
                      <option value="customer">Customer</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>

                  <button
                    disabled={isBusy}
                    onClick={() => void updateUser(user, { disabled: !user.disabled })}
                    className={`border px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${
                      user.disabled
                        ? "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800 focus-visible:outline-zinc-950 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200 dark:focus-visible:outline-amber-300"
                        : "border-red-300 bg-white text-red-700 hover:bg-red-50 focus-visible:outline-red-700 dark:border-red-800/80 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-950/60 dark:focus-visible:outline-red-300"
                    }`}
                  >
                    {isBusy ? "Saving…" : user.disabled ? "Restore access" : "Disable access"}
                  </button>
                </div>
              </article>
            );
          })
        )}

        {!loading && !collection.totalItems && (
          <p className="col-span-full border border-stone-200/90 bg-white py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
            {users.length ? "No users match your search." : "No users found."}
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
    </div>
  );
}