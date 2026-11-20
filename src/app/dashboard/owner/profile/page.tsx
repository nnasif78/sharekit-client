"use client";

import { authClient } from "@/lib/auth-client";

export default function OwnerProfilePage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  return <div className="max-w-3xl"><p className="text-sm font-medium text-gray-500">OWNER DASHBOARD</p><h1 className="mt-1 text-3xl font-bold">My Profile</h1><p className="mt-2 text-gray-600">Your account information used for your equipment listings.</p><section className="mt-7 rounded-2xl border bg-white p-6"><div className="flex items-center gap-4 border-b pb-5"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold">{user?.name?.slice(0, 1).toUpperCase() || "O"}</div><div><h2 className="font-semibold">{user?.name}</h2><p className="text-sm text-gray-500">Equipment owner</p></div></div><dl className="grid gap-5 pt-5 sm:grid-cols-2"><div><dt className="text-sm text-gray-500">Full name</dt><dd className="mt-1 font-medium">{user?.name || "—"}</dd></div><div><dt className="text-sm text-gray-500">Email address</dt><dd className="mt-1 font-medium">{user?.email || "—"}</dd></div><div><dt className="text-sm text-gray-500">Account role</dt><dd className="mt-1 font-medium">{(user as { role?: string } | undefined)?.role || "owner"}</dd></div><div><dt className="text-sm text-gray-500">Email verified</dt><dd className="mt-1 font-medium">{user?.emailVerified ? "Verified" : "Not verified"}</dd></div></dl><p className="mt-6 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">To change your account details, contact support.</p></section></div>;
}
