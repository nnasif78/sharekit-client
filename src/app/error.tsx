"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("Application route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[65vh] flex-col items-center justify-center bg-[#F7F6F2] px-6 py-16 text-center text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <span className="border border-red-700/30 bg-red-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
        Something went wrong
      </span>
      <h1 className="mt-5 text-3xl font-medium tracking-tight sm:text-4xl">
        This page didn’t load as expected.
      </h1>
      <p className="mt-3 max-w-lg text-sm text-zinc-600 dark:text-zinc-400">
        Try again, or return to ShareKit and continue browsing.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          onClick={retry}
          className="border border-zinc-950 bg-zinc-950 px-5 py-3 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200 dark:focus-visible:outline-amber-300"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-stone-300 bg-white px-5 py-3 font-mono text-xs uppercase tracking-wider text-zinc-950 transition-colors hover:border-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:focus-visible:outline-amber-300"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
