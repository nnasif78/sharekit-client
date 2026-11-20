"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl space-y-5 bg-[#F7F6F2] px-6 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
        Admin / Request error
      </p>
      <h1 className="text-2xl font-medium tracking-tight">
        The admin page could not load.
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="border border-zinc-950 bg-zinc-950 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200 dark:focus-visible:outline-amber-300"
      >
        Try again
      </button>
    </main>
  );
}
