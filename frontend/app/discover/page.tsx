"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, ShieldCheck, Star, SlidersHorizontal, Hammer, Wrench, Zap, Scissors, Menu, House, Compass, BriefcaseBusiness, MessageCircle, UserRound, ArrowUpRight, BadgeCheck, Users, Clock3 } from "lucide-react";
import { supabase } from "../lib/supabase";

type Artisan = { id: string; name: string; trade: string; rating: number; jobs: number; verified: boolean; available: boolean; avatarUrl: string | null; headline: string | null; location: string | null };
const tradeLabels: Record<string, string> = {
  ELECTRICAL: "Electrician", PLUMBING: "Plumber", CARPENTRY: "Carpenter",
  MECHANIC: "Mechanic", TECH_REPAIR: "Tech Repair", WELDING: "Welder",
  JOINERY: "Joiner", TAILORING: "Tailor",
};
const displayTrade = (value: string) => tradeLabels[value.toUpperCase()] ?? value;
const trades = [
  { name: "All trades", icon: Compass },
  { name: "Electrician", icon: Zap },
  { name: "Plumber", icon: Wrench },
  { name: "Carpenter", icon: Hammer },
  { name: "Joiner", icon: Hammer },
  { name: "Welder", icon: Wrench },
  { name: "Tailor", icon: Scissors },
  { name: "Mechanic", icon: SlidersHorizontal },
  { name: "Tech Repair", icon: Menu },
];

export default function Home() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [trade, setTrade] = useState("All trades");
  const [query, setQuery] = useState("");
  const [available, setAvailable] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id ?? null;
      if (active) setIsSignedIn(Boolean(currentUserId));
      const result = await supabase.from("public_artisan_directory")
        .select("id, full_name, trade_category, is_verified, is_available, rating_avg, completed_jobs, avatar_url, headline, location_label")
        .order("is_available", { ascending: false }).order("rating_avg", { ascending: false });
      if (!active) return;
      if (result.error) {
        console.error("Supabase artisan directory error:", result.error.message);
        setErrorMessage("We couldn't load the directory. Check your connection and try again.");
      } else {
        setArtisans((result.data ?? [])
          .filter((row: any) => !currentUserId || row.id !== currentUserId)
          .map((row: any) => ({
            id: row.id, name: row.full_name || "Fundi profile", trade: displayTrade(row.trade_category || "Artisan"),
            rating: Number(row.rating_avg ?? 0), jobs: Number(row.completed_jobs ?? 0),
            verified: Boolean(row.is_verified), available: Boolean(row.is_available),
            avatarUrl: row.avatar_url ?? null, headline: row.headline ?? null, location: row.location_label ?? null
          })));
      }
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => artisans.filter(a =>
    (trade === "All trades" || a.trade.toLowerCase() === trade.toLowerCase()) &&
    (!available || a.available) &&
    (a.name + " " + a.trade + " " + (a.location || "") + " " + (a.headline || "")).toLowerCase().includes(query.toLowerCase())
  ), [artisans, trade, available, query]);

  return <main className="min-h-screen bg-[#f8f5ef] pb-24 text-[#1c2923] md:pb-0">
    <header className="sticky top-0 z-30 border-b border-[#1c2923]/10 bg-[#fffdf9]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="FundiConnect home" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#244b3a] text-lg font-black text-white">F</span>
          <span><b className="block text-base tracking-tight sm:text-lg">FundiConnect</b><span className="block text-[9px] font-bold uppercase tracking-[.2em] text-[#a95338]">Skills that build Kenya</span></span>
        </Link>
        <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link href="/discover" className="text-[#244b3a]">Discover</Link>
          <Link href="/how-it-works" className="text-[#59665f] hover:text-[#244b3a]">How it works</Link>
          <Link href="/profile" className="text-[#59665f] hover:text-[#244b3a]">My profile</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-5">
          <Link href={isSignedIn ? "/profile" : "/login"} className="rounded-xl px-3 py-2 text-sm font-bold text-[#244b3a] hover:bg-[#244b3a]/5">{isSignedIn ? "My Profile" : "Sign in"}</Link>
          {!isSignedIn && <Link href="/register" className="rounded-xl bg-[#b9573d] px-3.5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#98442f] sm:px-4 sm:text-sm">Join the network</Link>}
        </div>
      </div>
    </header>


    <section id="discover" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#a95338]">Discover local talent</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Meet the people behind the work.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#69746d]">Browse artisan profiles, compare experience and find the right skill for your next job.</p></div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#68736c]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e4ece3] text-[#244b3a]"><Users size={16}/></span> Community-first. Skill-led.</div>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-[#1d3027]/10 bg-white px-4 shadow-sm focus-within:border-[#244b3a]/50"><Search size={19} className="shrink-0 text-[#a95338]"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a name, trade or area…" aria-label="Search artisans by name, trade or service area" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#9aa19c]"/></label>
        <button onClick={() => setAvailable(!available)} aria-pressed={available} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-bold transition ${available ? "border-[#244b3a] bg-[#244b3a] text-white" : "border-[#1d3027]/10 bg-white text-[#43534a] hover:border-[#244b3a]/40"}`}><Clock3 size={17}/> Available now</button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Filter by trade">
        {trades.map(({name, icon: Icon}) => <button key={name} onClick={() => setTrade(name)} aria-pressed={trade === name} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition sm:text-sm ${trade === name ? "border-[#244b3a] bg-[#244b3a] text-white shadow-sm" : "border-[#1d3027]/10 bg-white text-[#4e5c53] hover:border-[#244b3a]/40"}`}><Icon size={15}/>{name}</button>)}
      </div>

      <div className="mt-5 flex items-center justify-between"><p className="text-sm font-bold text-[#26382e]">{loading ? "Finding local talent…" : `${filtered.length} ${filtered.length === 1 ? "profile" : "profiles"} to explore`}</p><span className="text-xs text-[#89928c]">Profiles from the community</span></div>

      {loading ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(n=><div key={n} className="animate-pulse rounded-2xl border border-[#1d3027]/5 bg-white p-5"><div className="flex gap-3"><div className="h-14 w-14 rounded-2xl bg-[#e9e6df]"/><div className="flex-1"><div className="h-4 w-2/3 rounded bg-[#e9e6df]"/><div className="mt-3 h-3 w-1/2 rounded bg-[#efede7]"/></div></div><div className="mt-6 h-20 rounded-xl bg-[#efede7]"/></div>)}</div>
      : errorMessage ? <div role="alert" className="mt-5 rounded-2xl border border-[#b9573d]/20 bg-white p-8 text-center"><p className="font-bold">{errorMessage}</p><button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-[#244b3a] px-4 py-2.5 text-sm font-bold text-white">Try again</button></div>
      : filtered.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[#1d3027]/20 bg-white px-6 py-14 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f4e5d8] text-[#a95338]"><Search size={22}/></div><h3 className="mt-4 text-lg font-black">No matching profiles yet</h3><p className="mt-2 text-sm text-[#69746d]">{artisans.length === 0 ? "The directory is ready for local artisans to join." : "Try a different trade, name or service area."}</p><button onClick={() => {setTrade("All trades");setQuery("");setAvailable(false);}} className="mt-4 rounded-xl border border-[#1d3027]/15 px-4 py-2.5 text-sm font-bold text-[#244b3a]">Clear filters</button></div>
      : <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(a => <Link key={a.id} href={`/artisan/?id=${encodeURIComponent(a.id)}`} className="group rounded-2xl border border-[#1d3027]/8 bg-white p-5 shadow-[0_4px_20px_rgba(28,41,35,.035)] transition duration-200 hover:-translate-y-1 hover:border-[#244b3a]/20 hover:shadow-[0_14px_32px_rgba(28,41,35,.09)] focus:outline-none focus:ring-2 focus:ring-[#244b3a]">
        <div className="flex items-start gap-3"><div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#e8eee7] text-lg font-black text-[#244b3a]">{a.avatarUrl ? <img src={a.avatarUrl} alt={a.name + " profile"} loading="lazy" decoding="async" className="h-full w-full object-cover"/> : a.name.slice(0,1).toUpperCase()}{a.available && <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#3f986c]"/>}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="font-extrabold tracking-tight text-[#1d3027] group-hover:text-[#a95338]">{a.name}</h3>{a.verified && <span title="Verified profile" className="shrink-0 text-[#3b7654]"><ShieldCheck size={19}/></span>}</div><p className="mt-1 line-clamp-2 text-sm leading-5 text-[#66736a]">{a.headline || a.trade}</p><p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#8a948d]"><MapPin size={12}/>{a.location || "Kenya"}</p></div></div>
        <div className="mt-5 flex items-center justify-between border-t border-[#1d3027]/8 pt-4"><span className="rounded-lg bg-[#f4eee5] px-2.5 py-1.5 text-xs font-bold text-[#8d4b36]">{a.trade}</span><span className="flex items-center gap-1 text-sm font-extrabold text-[#35483b]"><Star size={15} className="fill-[#e5a34e] text-[#e5a34e]"/>{a.rating.toFixed(1)} <span className="text-xs font-medium text-[#89928c]">({a.jobs} jobs)</span></span></div>
        <div className="mt-4 flex items-center justify-between text-xs"><span className={a.available ? "font-bold text-[#34734e]" : "font-semibold text-[#8a948d]"}>{a.available ? "● Available for work" : "Currently busy"}</span><span className="inline-flex items-center gap-1 font-extrabold text-[#a95338]">View profile <ArrowUpRight size={14}/></span></div>
      </Link>)}</div>}
    </section>


    <footer className="bg-[#1d3027] px-5 py-8 text-white/60"><div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><b className="text-sm text-white">FundiConnect</b><p className="mt-1 text-xs">Local skills. Local opportunity.</p></div><p className="text-xs">Built for Kenya's skilled community · © 2026 FundiConnect</p></div></footer>

    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#1d3027]/10 bg-[#fffdf9]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(28,41,35,.08)] backdrop-blur md:hidden">
      {[{label:"Home",href:"/",icon:House},{label:"Discover",href:"/discover",icon:Compass},{label:"My Works",href:"/works",icon:BriefcaseBusiness},{label:"Inbox",href:"/inbox",icon:MessageCircle}].map(item=><Link key={item.label} href={item.href} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${item.label === "Discover" ? "text-[#a95338]" : "text-[#68736c]"}`}><item.icon size={19}/>{item.label}</Link>)}
    </nav>
  </main>;
}
