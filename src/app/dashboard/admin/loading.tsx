export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-7xl bg-[#F7F6F2] px-6 py-8 dark:bg-zinc-950" aria-live="polite">
      <div className="h-8 w-56 animate-pulse border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60" />
      <div className="mt-6 h-24 animate-pulse border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60" />
      <div className="mt-4 h-72 animate-pulse border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60" />
      <p className="sr-only">Loading admin dashboard…</p>
    </main>
  );
}
