
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleSignIn from "@/components/google-sign-in";
import { clearAccessToken } from "@/lib/api-request";
import { notifyError, notifySuccess, reportError } from "@/lib/notifications";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");

        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
            setError("Password must contain uppercase and lowercase letters.");
            notifyError("Password must contain uppercase and lowercase letters.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            notifyError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            const { error } = await authClient.signUp.email({
                name,
                email,
                password,
            });

            if (error) {
                const message = error.message || "Registration failed";
                setError(message);
                notifyError(message);
                return;
            }

            clearAccessToken();
            notifySuccess("Account created.");
            router.push("/");
            router.refresh();
        } catch (error) {
            setError(reportError(error, "Something went wrong. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="mx-auto max-w-md px-5 py-12 sm:py-20">
            <section className="border border-stone-300 bg-stone-50 p-6 shadow-[6px_6px_0_0_rgba(39,39,42,0.08)] dark:border-zinc-700 dark:bg-zinc-900 sm:p-8">
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">ShareKit / Join the network</p>
            <h1 className="mb-7 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-stone-100">
                Create an account
            </h1>

            <form onSubmit={handleRegister} className="space-y-4">
                <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-stone-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100 dark:placeholder:text-zinc-400"
                />

                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-stone-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100 dark:placeholder:text-zinc-400"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full border border-stone-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100 dark:placeholder:text-zinc-400"
                />

                {error && (
                    <p className="border-l-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full border border-zinc-900 bg-zinc-900 px-4 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-stone-50 transition-colors hover:border-amber-700 hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-400 dark:bg-amber-400 dark:text-zinc-950 dark:hover:bg-amber-300"
                >
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>

            <p className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">
                Already with us?{" "}
                <Link href="/login" className="font-semibold text-amber-800 underline decoration-amber-500 underline-offset-4 hover:text-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:text-amber-400">
                    Sign in
                </Link>
            </p>
            <div className="my-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 before:h-px before:flex-1 before:bg-stone-300 after:h-px after:flex-1 after:bg-stone-300 dark:text-zinc-400 dark:before:bg-zinc-700 dark:after:bg-zinc-700">
                Or continue with
            </div>

            <GoogleSignIn />
            </section>
        </main>
    );
}
