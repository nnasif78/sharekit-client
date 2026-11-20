"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

const links = [
  ["Overview", "/dashboard/owner"],
  ["Add Equipment", "/dashboard/owner/add-equipment"],
  ["My Equipment", "/dashboard/owner/my-equipment"],
  ["My Equipment Rentals", "/dashboard/owner/rentals"],
  ["My Profile", "/dashboard/owner/profile"],
] as const;

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isOwner = role === "owner" || role === "admin";

  useEffect(() => {
    if (!isPending && !session) router.replace(`/login?callbackURL=${encodeURIComponent(pathname)}`);
  }, [isPending, pathname, router, session]);

  if (isPending || !session) return <main className="mx-auto max-w-6xl p-10 text-gray-500">Loading owner dashboard…</main>;
  if (!isOwner) return <main className="mx-auto max-w-3xl p-10"><h1 className="text-2xl font-semibold">Owner access required</h1><p className="mt-3 text-gray-600">Your account does not have the owner role yet. Contact an administrator to enable owner access.</p></main>;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[230px_1fr] lg:px-8">
      <aside className="h-fit rounded-2xl border bg-white p-4">
        <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Owner dashboard</p>
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {links.map(([label, href]) => {
            const active = pathname === href || (href !== "/dashboard/owner" && pathname.startsWith(`${href}/`));
            return <Link key={href} href={href} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}>{label}</Link>;
          })}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
