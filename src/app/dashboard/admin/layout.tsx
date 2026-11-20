"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

const links = [
  ["All Users", "/dashboard/admin/users"],
  ["All Equipment", "/dashboard/admin/equipment"],
  ["All Rentals", "/dashboard/admin/rentals"],
  ["My Profile", "/dashboard/admin/profile"],
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  useEffect(() => {
    if (!isPending && !session) router.replace(`/login?callbackURL=${encodeURIComponent(pathname)}`);
  }, [isPending, pathname, router, session]);
  if (isPending || !session) return <main className="mx-auto max-w-6xl p-10 text-gray-500">Loading admin dashboard…</main>;
  if (role !== "admin") return <main className="mx-auto max-w-3xl p-10"><h1 className="text-2xl font-semibold">Admin access required</h1><p className="mt-3 text-gray-600">Your account does not have administrator access.</p></main>;
  return <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[230px_1fr] lg:px-8"><aside className="h-fit rounded-2xl border bg-white p-4"><p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Admin dashboard</p><nav className="flex gap-2 overflow-x-auto lg:flex-col">{links.map(([label, href]) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}>{label}</Link>; })}</nav></aside><section className="min-w-0">{children}</section></div>;
}
