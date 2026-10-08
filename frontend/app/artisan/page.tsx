"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, ShieldCheck, Star, UserRound } from "lucide-react";
import { supabase } from "../lib/supabase";

type Profile = {
  id: string; full_name: string; trade_category: string; is_verified: boolean;
  is_available: boolean; rating_avg: number | string; total_reviews: number;
  completed_jobs: number; avatar_url: string | null; headline: string | null;
  bio: string | null; location_label: string | null;
};

const tradeLabels: Record<string, string> = {
  ELECTRICAL: "Electrician", PLUMBING: "Plumber", CARPENTRY: "Carpenter",
  MECHANIC: "Mechanic", TECH_REPAIR: "Tech Repair",
};

export default function ArtisanPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const profileId = new URLSearchParams(window.location.search).get("id") || "";
    if (!profileId) {
      setError("No artisan profile was selected. Return to the directory and choose an artisan.");
      setLoading(false);
      return;
    }
    let active = true;
    async function loadProfile() {
      const { data, error: queryError } = await supabase.from("public_artisan_directory")
        .select("id, full_name, trade_category, is_verified, is_available, rating_avg, total_reviews, completed_jobs, avatar_url, headline, bio, location_label")
        .eq("id", profileId).maybeSingle();
      if (!active) return;
      if (queryError) {
        console.error("Artisan profile error:", queryError.message);
        setError("We couldn't load this profile. Please try again shortly.");
      } else if (!data) setError("This artisan profile could not be found.");
      else setProfile(data as Profile);
      setLoading(false);
    }
    loadProfile();
    return () => { active = false; };
  }, []);

  const trade = profile ? (tradeLabels[profile.trade_category?.toUpperCase()] || profile.trade_category || "Artisan") : "";
  return <main className="min-h-screen bg-sand px-5 py-8 text-ink"><div className="mx-auto max-w-4xl">
    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-forest"><ArrowLeft size={16}/> Back to directory</Link>
    {loading ? <div className="mt-6 rounded-3xl bg-white p-10 text-center">Loading artisan profile…</div> :
      error ? <div role="alert" className="mt-6 rounded-3xl bg-white p-10 text-center"><h1 className="text-xl font-black">Profile unavailable</h1><p className="mt-2 text-sm text-black/60">{error}</p></div> :
      profile ? <section className="mt-6 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-forest to-ink sm:h-44"/>
        <div className="px-6 pb-8 sm:px-10">
          <div className="-mt-12 flex flex-wrap items-end gap-4 sm:-mt-16">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-sand text-3xl font-black text-forest sm:h-32 sm:w-32">
              {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name + " profile"} className="h-full w-full object-cover"/> : <UserRound size={42}/>}
            </div>
            <div className="flex-1 pb-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-black sm:text-3xl">{profile.full_name}</h1>{profile.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-mint/40 px-3 py-1 text-xs font-bold text-forest"><ShieldCheck size={14}/> Verified</span>}</div><p className="mt-1 font-semibold text-forest">{profile.headline || trade}</p></div>
            <span className={profile.is_available ? "rounded-full bg-mint/40 px-3 py-2 text-sm font-bold text-forest" : "rounded-full bg-sand px-3 py-2 text-sm font-semibold text-black/60"}>{profile.is_available ? "Available for work" : "Currently busy"}</span>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-sand p-4"><p className="text-xs font-semibold uppercase tracking-wide text-black/50">Trade</p><p className="mt-1 font-bold">{trade}</p></div>
            <div className="rounded-2xl bg-sand p-4"><p className="text-xs font-semibold uppercase tracking-wide text-black/50">Rating</p><p className="mt-1 flex items-center gap-2 font-bold"><Star size={17} className="fill-amber text-amber"/>{Number(profile.rating_avg || 0).toFixed(1)} <span className="text-sm font-normal text-black/50">({profile.total_reviews || 0} reviews)</span></p></div>
            <div className="rounded-2xl bg-sand p-4"><p className="text-xs font-semibold uppercase tracking-wide text-black/50">Completed jobs</p><p className="mt-1 font-bold">{profile.completed_jobs || 0}</p></div>
          </div>
          {profile.location_label && <p className="mt-6 flex items-center gap-2 text-sm text-black/60"><MapPin size={16}/>{profile.location_label}</p>}
          <div className="mt-8"><h2 className="text-xl font-black">About</h2><p className="mt-3 whitespace-pre-wrap leading-7 text-black/70">{profile.bio || "This artisan hasn't added a professional introduction yet."}</p></div>
          <div className="mt-8 rounded-2xl border border-black/10 p-5"><h2 className="font-black">Interested in working with {profile.full_name.split(" ")[0]}?</h2><p className="mt-2 text-sm text-black/60">Job requests and direct messaging will be added in the next stage.</p><Link href="/login" className="mt-4 inline-flex rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white">Sign in to FundiConnect</Link></div>
        </div>
      </section> : null}
  </div></main>;
}
