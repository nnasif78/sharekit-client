
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

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
      setError("Google authentication failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full rounded border p-3 disabled:opacity-50"
      >
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
