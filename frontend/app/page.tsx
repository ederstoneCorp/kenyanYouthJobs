"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, ShieldCheck, Star, SlidersHorizontal, Hammer, Wrench, Zap, Scissors, Menu, House, Compass, BriefcaseBusiness, MessageCircle, UserRound, ArrowUpRight, BadgeCheck, Users, Clock3 } from "lucide-react";
import { supabase } from "./lib/supabase";

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
          <Link href={isSignedIn ? "/profile" : "/login"} className="rounded-xl px-3 py-2 text-sm font-bold text-[#244b3a] hover:bg-[#244b3a]/5">{isSignedIn ? "Edit profile" : "Sign in"}</Link>
          <Link href="/register" className="rounded-xl bg-[#b9573d] px-3.5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#98442f] sm:px-4 sm:text-sm">Join the network</Link>
        </div>
      </div>
    </header>

    <section className="relative overflow-hidden bg-[#1d3027] text-white">
      <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border-[44px] border-white/[.035] sm:h-[28rem] sm:w-[28rem]"/>
      <div className="pointer-events-none absolute -bottom-40 right-[20%] h-80 w-80 rounded-full bg-[#b9573d]/15 blur-3xl"/>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-3.5 py-2 text-xs font-semibold text-[#f2c4a7]"><span className="h-2 w-2 rounded-full bg-[#e5a34e]"/> Built for Kenya's Jua Kali talent</div>
          <h1 className="max-w-3xl text-[2.65rem] font-black leading-[1.04] tracking-[-.045em] sm:text-6xl lg:text-[4.4rem]">Your skill is your <span className="text-[#e8ad63]">story.</span><br/>Make it visible.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">A professional network for fundis, makers and skilled tradespeople. Show your work, build trust and connect with people who need your skills.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#e5a34e] px-5 py-3 text-sm font-extrabold text-[#1d3027] shadow-lg shadow-black/10 transition hover:bg-[#f0b76d]">Find a fundi <ArrowUpRight size={17}/></Link>
            <Link href="/register" className="inline-flex min-h-12 items-center rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Build your profile</Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-white/65">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-[#e5a34e]"/> Trust-first profiles</span>
            <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-[#e5a34e]"/> Local connections</span>
            <span className="inline-flex items-center gap-2"><Users size={16} className="text-[#e5a34e]"/> Made for skilled work</span>
          </div>
        </div>
        <div className="mx-auto w-full max-w-lg lg:ml-auto">
          <div className="rounded-[1.8rem] border border-white/10 bg-[#fffdf9] p-4 text-[#1c2923] shadow-2xl shadow-black/20 sm:p-5">
            <div className="flex items-center justify-between px-1 pb-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#a95338]">The local talent network</p><h2 className="mt-1 text-xl font-black tracking-tight">Good work deserves to be seen.</h2></div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f4e5d8] text-[#a95338]"><BadgeCheck size={23}/></span></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f5eee4] p-4"><span className="text-xs font-semibold text-[#6d756f]">Your next connection</span><p className="mt-2 text-lg font-black">Starts locally.</p><p className="mt-1 text-xs leading-5 text-[#68736c]">Search by trade and service area.</p></div>
              <div className="rounded-2xl bg-[#e6eee6] p-4"><span className="text-xs font-semibold text-[#52675a]">Your reputation</span><p className="mt-2 text-lg font-black">Built on proof.</p><p className="mt-1 text-xs leading-5 text-[#52675a]">Showcase skills and completed jobs.</p></div>
              <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-[#1d3027]/10 p-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#244b3a] text-white"><Hammer size={20}/></div><div className="min-w-0 flex-1"><p className="font-extrabold">From Jua Kali to a trusted digital profile</p><p className="mt-1 text-xs leading-5 text-[#68736c]">A clear place to share your craft, experience and work.</p></div><ArrowUpRight size={19} className="shrink-0 text-[#a95338]"/></div>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-white/45">A growing network for skilled people across Kenya</p>
        </div>
      </div>
    </section>




    <footer className="bg-[#1d3027] px-5 py-8 text-white/60"><div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><b className="text-sm text-white">FundiConnect</b><p className="mt-1 text-xs">Local skills. Local opportunity.</p></div><p className="text-xs">Built for Kenya's skilled community · © 2026 FundiConnect</p></div></footer>

    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#1d3027]/10 bg-[#fffdf9]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(28,41,35,.08)] backdrop-blur md:hidden">
      {[{label:"Home",href:"/",icon:House},{label:"Discover",href:"/discover",icon:Compass},{label:"My Works",href:"/works",icon:BriefcaseBusiness},{label:"Inbox",href:"/inbox",icon:MessageCircle}].map(item=><Link key={item.label} href={item.href} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${item.label === "Home" ? "text-[#a95338]" : "text-[#68736c]"}`}><item.icon size={19}/>{item.label}</Link>)}
    </nav>
  </main>;
}
