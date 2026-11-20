"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { notifyError } from "@/lib/notifications";

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.54-1.14 2.85-2.4 3.72v3.05h3.88c2.27-2.09 3.665-5.17 3.665-8.54z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

export default function GoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");

      const callbackURL = new URLSearchParams(window.location.search).get("callbackURL");

      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL?.startsWith("/") ? callbackURL : "/",
      });
    } catch {
      const message = "Google authentication failed. Please try again.";
      setError(message);
      notifyError(message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2.5 border border-stone-300 bg-white px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-zinc-950 transition-colors hover:border-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-amber-300 dark:focus-visible:outline-amber-300"
      >
        <GoogleIcon />
        <span>{loading ? "Redirecting..." : "Continue with Google"}</span>
      </button>

      {error && (
        <p
          role="alert"
          className="border border-red-200 bg-red-50/80 px-3.5 py-2 text-xs text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}