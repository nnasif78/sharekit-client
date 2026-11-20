import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[72vh] flex-col items-center justify-center bg-[#F7F6F2] px-6 py-16 text-center text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <span className="font-mono text-8xl font-medium tracking-tight text-zinc-300 dark:text-zinc-700">404</span>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Page not found</p>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">This page is unavailable.</h1>
      <p className="mt-3 max-w-md text-sm text-zinc-600 dark:text-zinc-400">The address may be outdated, or the page may have moved.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/equipment" className="inline-flex items-center gap-2 border border-zinc-950 bg-zinc-950 px-5 py-3 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200 dark:focus-visible:outline-amber-300"><Search size={16} /> Explore equipment</Link>
        <Link href="/" className="inline-flex items-center gap-2 border border-stone-300 bg-white px-5 py-3 font-mono text-xs uppercase tracking-wider text-zinc-950 transition-colors hover:border-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:focus-visible:outline-amber-300"><ArrowLeft size={16} /> Back home</Link>
      </div>
    </main>
  );
}
