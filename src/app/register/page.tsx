
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleSignIn from "@/components/google-sign-in";
import { clearAccessToken } from "@/lib/api-request";

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
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
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
                setError(error.message || "Registration failed");
                return;
            }

            clearAccessToken();
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
                Create an Account
            </h1>

            <form onSubmit={handleRegister} className="space-y-4">
                <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded border p-3"
                />

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
                    minLength={6}
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
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>

            <p className="mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600">
                    Login
                </Link>
            </p>
            <div className="my-4 text-center text-sm text-gray-500">
                OR
            </div>

            <GoogleSignIn />
        </main>
    );
}
