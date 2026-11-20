export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl bg-[#F7F6F2] px-6 py-14 dark:bg-zinc-950" aria-live="polite">
      <div className="h-9 w-64 animate-pulse border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60" />
      <div className="mt-4 h-4 max-w-md animate-pulse bg-stone-200 dark:bg-zinc-800" />
      <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-[4/3] animate-pulse border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60" />)}
      </div>
      <p className="sr-only">Loading ShareKit…</p>
    </main>
  );
}
