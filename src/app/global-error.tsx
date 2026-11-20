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
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-3xl font-semibold">ShareKit hit a snag.</h1>
          <p className="mt-3 text-muted-foreground">Please try loading the page again.</p>
          <button onClick={retry} className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Try again</button>
        </main>
      </body>
    </html>
  );
}
