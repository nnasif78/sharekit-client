
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleSignIn from "@/components/google-sign-in";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");

        try {
            setLoading(true);

            const { error } = await authClient.signIn.email({
                email,
                password,
            });

            if (error) {
                setError(error.message || "Login failed");
                return;
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="mx-auto mt-16 max-w-md px-6">
            <h1 className="mb-6 text-2xl font-bold">
                Welcome Back
            </h1>

            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded border p-3"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded border p-3"
                />

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="mt-4">
                Do not have an account?{" "}
                <Link href="/register" className="text-blue-600">
                    Register
                </Link>
            </p>
            <div className="my-4 text-center text-sm text-gray-500">
                OR
            </div>

            <GoogleSignIn />
        </main>

    );
}
