export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-14" aria-live="polite">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="mt-4 h-4 max-w-md animate-pulse rounded bg-muted" />
      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
      </div>
      <p className="sr-only">Loading ShareKit…</p>
    </main>
  );
}
