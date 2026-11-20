import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[72vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="font-serif text-8xl font-semibold tracking-tight text-primary/20">404</span>
      <p className="mt-2 text-xs font-bold uppercase tracking-[.2em] text-muted-foreground">Wrong turn?</p>
      <h1 className="mt-4 text-3xl font-semibold">This page isn’t part of the kit.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">The page may have moved, or the link might be out of date. Let’s find something useful nearby.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/equipment" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"><Search size={16} /> Explore equipment</Link>
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold"><ArrowLeft size={16} /> Back home</Link>
      </div>
    </main>
  );
}
