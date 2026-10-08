"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-sand px-5 py-10 text-ink">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-forest">
          <ArrowLeft size={16} /> Back to FundiConnect
        </Link>

        <section className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-9">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-forest text-xl font-black text-white">F</div>
          <h1 className="mt-5 text-3xl font-black">Sign in</h1>
          <p className="mt-2 text-sm text-black/60">Access your FundiConnect account.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold">
              Email address
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-forest"
                placeholder="you@example.com"
              />
            </label>

            <label className="block text-sm font-semibold">
              Password
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-forest"
                placeholder="Your password"
              />
            </label>

            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-forest px-4 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-black/60">
            Need an account? <Link href="/register/" className="font-bold text-forest underline">Register</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
