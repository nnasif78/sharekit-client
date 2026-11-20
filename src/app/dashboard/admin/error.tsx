"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto max-w-2xl p-10"><h1 className="text-2xl font-semibold">Admin page failed to load</h1><p className="mt-3 text-gray-600">{error.message || "An unexpected error occurred."}</p><button onClick={reset} className="mt-5 rounded-lg bg-black px-4 py-2 text-white">Try again</button></main>;
}
