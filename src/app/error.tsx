"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("Application route error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-700">Something went wrong</span>
      <h1 className="mt-5 text-3xl font-semibold">This page didn’t load as expected.</h1>
      <p className="mt-3 max-w-lg text-muted-foreground">Try again, or head back to ShareKit and continue browsing.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button onClick={retry} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Try again</button>
        <Link href="/" className="rounded-full border px-5 py-3 text-sm font-semibold">Back to home</Link>
      </div>
    </main>
  );
}
