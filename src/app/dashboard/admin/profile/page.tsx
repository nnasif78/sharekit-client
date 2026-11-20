"use client";

import { authClient } from "@/lib/auth-client";

export default function AdminProfilePage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  return <div className="max-w-3xl"><p className="text-sm font-medium text-gray-500">ADMIN DASHBOARD</p><h1 className="mt-1 text-3xl font-bold">My Profile</h1><p className="mt-2 text-gray-600">Your administrator account information.</p><section className="mt-7 rounded-2xl border bg-white p-6"><div className="flex items-center gap-4 border-b pb-5"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold">{user?.name?.slice(0, 1).toUpperCase() || "A"}</div><div><h2 className="font-semibold">{user?.name}</h2><p className="text-sm text-gray-500">Administrator</p></div></div><dl className="grid gap-5 pt-5 sm:grid-cols-2"><div><dt className="text-sm text-gray-500">Name</dt><dd className="mt-1 font-medium">{user?.name || "—"}</dd></div><div><dt className="text-sm text-gray-500">Email</dt><dd className="mt-1 font-medium">{user?.email || "—"}</dd></div><div><dt className="text-sm text-gray-500">Role</dt><dd className="mt-1 font-medium">Administrator</dd></div></dl><p className="mt-6 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">To change your account details, contact support.</p></section></div>;
}
