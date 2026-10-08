"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, ShieldCheck, Star, SlidersHorizontal } from "lucide-react";
import { supabase } from "./lib/supabase";

type Artisan = { id: string; name: string; trade: string; rating: number; jobs: number; verified: boolean; available: boolean };
const trades = ["All trades", "Electrician", "Plumber", "Carpenter", "Mechanic", "Tech Repair"];

export default function Home() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [trade, setTrade] = useState("All trades");
  const [query, setQuery] = useState("");
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const result = await supabase.from("public_artisan_directory")
        .select("id, full_name, trade_category, is_verified, is_available, rating_avg, completed_jobs")
        .order("is_available", { ascending: false }).order("rating_avg", { ascending: false });
      if (!active) return;
      if (result.error) {
        console.error("Supabase artisan directory error:", result.error.message);
        setErrorMessage("Unable to load artisan profiles. Check the Supabase connection and directory permissions.");
      } else {
        setArtisans((result.data ?? []).map((row: any) => ({
          id: row.id, name: row.full_name || "Fundi profile", trade: row.trade_category || "General artisan",
          rating: Number(row.rating_avg ?? 0), jobs: Number(row.completed_jobs ?? 0),
          verified: Boolean(row.is_verified), available: Boolean(row.is_available)
        })));
      }
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => artisans.filter(a =>
    (trade === "All trades" || a.trade.toLowerCase() === trade.toLowerCase()) &&
    (!available || a.available) && (a.name + " " + a.trade).toLowerCase().includes(query.toLowerCase())
  ), [artisans, trade, available, query]);

  return <main className="min-h-screen">
    <header className="border-b bg-white px-5 py-5"><div className="mx-auto flex max-w-7xl items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-forest font-black text-white">F</div><div><b className="text-lg">FundiConnect</b><p className="text-[10px] font-bold uppercase tracking-widest text-forest">Local skills. Local jobs.</p></div></div></header>
    <section className="bg-ink px-5 py-16 text-white"><div className="mx-auto max-w-7xl"><p className="mb-4 flex items-center gap-2 text-mint"><MapPin size={17}/> Trusted skills near you</p><h1 className="text-4xl font-black md:text-6xl">Find a trusted fundi.<br/><span className="text-mint">Get the job done.</span></h1><p className="mt-5 max-w-2xl text-white/70">Discover local artisans by trade, availability and reputation.</p><div className="mt-8 flex max-w-2xl items-center gap-3 rounded-xl bg-white px-4"><Search size={20} className="text-black/40"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or trade" className="w-full py-4 text-sm text-ink outline-none"/></div></div></section>
    <section id="find" className="mx-auto max-w-7xl px-5 py-10"><div className="mb-6"><p className="text-sm font-bold text-forest">ARTISAN DIRECTORY</p><h2 className="mt-1 text-3xl font-black">Skilled people ready to help</h2><p className="mt-2 text-sm text-black/50">Profiles below are loaded from your Supabase database.</p></div>
    <div className="mb-7 flex flex-wrap gap-2">{trades.map(t => <button key={t} onClick={() => setTrade(t)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${trade === t ? "border-forest bg-forest text-white" : "border-black/10 bg-white"}`}>{t}</button>)}<button onClick={() => setAvailable(!available)} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${available ? "bg-mint" : "bg-white"}`}><SlidersHorizontal size={15}/> Available now</button></div>
    {loading ? <p className="rounded-2xl bg-white p-10 text-center">Loading artisan profiles…</p> : errorMessage ? <p role="alert" className="rounded-2xl bg-white p-10 text-center">{errorMessage}</p> : filtered.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center"><h3 className="font-black">No artisan profiles found</h3><p className="mt-2 text-sm text-black/60">{artisans.length === 0 ? "The connection worked, but no artisan profiles have been added yet." : "Try changing your search or filters."}</p></div> :
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.map(a => <article key={a.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><h3 className="font-black">{a.name}</h3><p className="text-sm text-black/50">{a.trade}</p></div>{a.verified && <ShieldCheck className="text-forest" size={20}/>}</div><div className="mt-5 flex gap-4 text-sm"><span className="flex items-center gap-1 font-bold"><Star size={16} className="fill-amber text-amber"/>{a.rating.toFixed(1)}</span><span className="text-black/50">{a.jobs} jobs</span></div><div className="mt-4 flex justify-between border-t pt-4 text-sm"><b>{a.verified ? "Verified profile" : "Not verified"}</b><span className={a.available ? "font-bold text-forest" : "text-black/40"}>{a.available ? "Available" : "Busy"}</span></div></article>)}</div>}
    </section>
    <section id="how" className="border-y bg-white px-5 py-14"><div className="mx-auto max-w-7xl"><h2 className="text-3xl font-black">How FundiConnect works</h2><div className="mt-6 grid gap-5 md:grid-cols-3">{[["01","Tell us what you need"],["02","Compare nearby fundis"],["03","Hire with confidence"]].map(x => <div key={x[0]} className="rounded-2xl bg-sand p-6"><b className="text-forest">{x[0]}</b><h3 className="mt-3 text-xl font-black">{x[1]}</h3></div>)}</div></div></section>
    <footer className="bg-ink px-5 py-8 text-sm text-white/60"><div className="mx-auto max-w-7xl">© 2026 FundiConnect · Built for local skills and local opportunity in Kenya.</div></footer>
  </main>;
}
