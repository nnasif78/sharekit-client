"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#F7F6F2] px-6 text-center text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
            ShareKit / System error
          </p>
          <h1 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
            The application could not load.
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Try loading the page again.
          </p>
          <button
            onClick={retry}
            className="mt-6 border border-zinc-950 bg-zinc-950 px-5 py-3 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200 dark:focus-visible:outline-amber-300"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
