
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="text-xl font-bold">
        ShareKit
      </Link>

      <div className="flex items-center gap-5">
        <Link href="/">Home</Link>
        <Link href="/equipment">Equipment</Link>

        {isPending ? (
          <span>Loading...</span>
        ) : session ? (
          <>
            <span>{session.user.name}</span>

            <button
              onClick={handleLogout}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
