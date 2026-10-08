"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserRound, Wrench } from "lucide-react";
import { supabase } from "../lib/supabase";

const trades = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Mechanic",
  "Tech Repair",
  "Welder",
  "Joiner",
  "Tailor",
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "artisan">("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [trade, setTrade] = useState("Electrician");
  const [hourlyRate, setHourlyRate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    const metadata: Record<string, string> = {
      full_name: fullName.trim(),
      phone_number: phone.trim(),
      role,
    };
    if (role === "artisan") {
      metadata.trade_category = trade;
      if (hourlyRate.trim()) metadata.hourly_rate = hourlyRate.trim();
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: metadata },
    });

    setBusy(false);
    if (signupError) {
      setError(signupError.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setMessage(
      "Your registration was submitted. Check your email for a confirmation link, then sign in when confirmation is complete."
    );
  }

  return (
    <main className="min-h-screen bg-sand px-5 py-10 text-ink">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-forest">
          <ArrowLeft size={16} /> Back to FundiConnect
        </Link>

        <section className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-9">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-forest text-xl font-black text-white">F</div>
          <h1 className="mt-5 text-3xl font-black">Create your account</h1>
          <p className="mt-2 text-sm text-black/60">Join FundiConnect to find local services or offer your skills.</p>

          <div className="mt-6 grid grid-cols-2 gap-3" aria-label="Account type">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold ${role === "customer" ? "border-forest bg-forest text-white" : "border-black/10 bg-white"}`}
              aria-pressed={role === "customer"}
            >
              <UserRound size={17} /> I need a fundi
            </button>
            <button
              type="button"
              onClick={() => setRole("artisan")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold ${role === "artisan" ? "border-forest bg-forest text-white" : "border-black/10 bg-white"}`}
              aria-pressed={role === "artisan"}
            >
              <Wrench size={17} /> I am a fundi
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold">
              Full name
              <input
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-forest"
                placeholder="Your full name"
              />
            </label>

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
              Phone number <span className="font-normal text-black/50">(optional)</span>
              <input
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-forest"
                placeholder="+254 7xx xxx xxx"
              />
            </label>

            {role === "artisan" && (
              <>
                <label className="block text-sm font-semibold">
                  Trade
                  <select
                    required
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-3 font-normal outline-none focus:border-forest"
                  >
                    {trades.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>

                <label className="block text-sm font-semibold">
                  Hourly rate in KSh <span className="font-normal text-black/50">(optional)</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-forest"
                    placeholder="e.g. 800"
                  />
                </label>
              </>
            )}

            <label className="block text-sm font-semibold">
              Password
              <input
                required
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-forest"
                placeholder="At least 8 characters"
              />
            </label>

            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {message && <p role="status" className="rounded-xl bg-mint/40 p-3 text-sm text-forest">{message}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-forest px-4 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-black/60">
            Already registered? <Link href="/login" className="font-bold text-forest underline">Sign in</Link>
          </p>
          <p className="mt-4 text-xs leading-5 text-black/50">
            Artisan profiles start unverified. FundiConnect verification must be completed separately.
          </p>
        </section>
      </div>
    </main>
  );
}
