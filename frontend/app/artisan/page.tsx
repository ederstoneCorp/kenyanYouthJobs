"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MapPin, ShieldCheck, Star, UserRound, BriefcaseBusiness, Clock3, MessageCircle, Phone, BadgeCheck, Images } from "lucide-react";
import { supabase } from "../lib/supabase";

type Profile = {
  id: string; full_name: string; trade_category: string; is_verified: boolean;
  is_available: boolean; rating_avg: number | string; total_reviews: number;
  completed_jobs: number; avatar_url: string | null; headline: string | null;
  bio: string | null; location_label: string | null;
};

const tradeLabels: Record<string, string> = {
  ELECTRICAL: "Electrician", PLUMBING: "Plumber", CARPENTRY: "Carpenter",
  MECHANIC: "Mechanic", TECH_REPAIR: "Tech Repair", WELDING: "Welder",
  JOINERY: "Joiner", TAILORING: "Tailor",
};

export default function ArtisanPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      const profileId = new URLSearchParams(window.location.search).get("id") || "";
      const { data: authData } = await supabase.auth.getUser();
      if (!active) return;
      setCurrentUserId(authData.user?.id ?? null);
      if (!profileId) {
        setError("No artisan profile was selected. Return to the directory and choose an artisan.");
        setLoading(false);
        return;
      }
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
  const isOwnProfile = Boolean(profile && currentUserId && profile.id === currentUserId);

  return <main className="min-h-screen bg-[#f8f5ef] px-4 pb-10 pt-5 text-[#1c2923] sm:px-6 sm:pt-8">
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <Link href="/discover" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-[#244b3a] hover:bg-[#244b3a]/5"><ArrowLeft size={17}/> Back to directory</Link>
        {!currentUserId && <Link href="/register" className="hidden items-center gap-2 rounded-xl bg-[#b9573d] px-4 py-2.5 text-sm font-extrabold text-white sm:inline-flex">Join FundiConnect <ArrowUpRight size={15}/></Link>}
      </div>

      {loading ? <div className="mt-6 animate-pulse overflow-hidden rounded-[1.8rem] bg-white"><div className="h-36 bg-[#e3e8e0] sm:h-48"/><div className="p-7"><div className="h-20 w-20 rounded-2xl bg-[#e9e6df]"/><div className="mt-5 h-5 w-1/3 rounded bg-[#e9e6df]"/><div className="mt-3 h-4 w-2/3 rounded bg-[#efede7]"/></div></div>
      : error ? <div role="alert" className="mt-6 rounded-3xl border border-[#1d3027]/8 bg-white p-10 text-center"><h1 className="text-xl font-black">Profile unavailable</h1><p className="mt-2 text-sm text-[#69746d]">{error}</p><Link href="/discover" className="mt-5 inline-flex rounded-xl bg-[#244b3a] px-4 py-3 text-sm font-bold text-white">Return to directory</Link></div>
      : profile ? <>
        <section className="mt-5 overflow-hidden rounded-[1.8rem] border border-[#1d3027]/8 bg-white shadow-[0_10px_40px_rgba(28,41,35,.055)]">
          <div className="relative h-32 overflow-hidden bg-[#1d3027] sm:h-48">
            <div className="absolute -right-8 -top-20 h-64 w-64 rounded-full border-[32px] border-white/[.05]"/>
            <div className="absolute bottom-0 left-0 h-1.5 w-full bg-[#b9573d]"/>
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-white/80"><BriefcaseBusiness size={13}/> Artisan profile</div>
          </div>
          <div className="px-5 pb-6 sm:px-9 sm:pb-9">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[1.4rem] border-4 border-white bg-[#e8eee7] text-3xl font-black text-[#244b3a] shadow-sm sm:h-32 sm:w-32">
                {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name + " profile"} loading="eager" decoding="async" className="h-full w-full object-cover"/> : <UserRound size={42}/>}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-black tracking-tight sm:text-3xl">{profile.full_name}</h1>{profile.is_verified && <span title="Verified profile" className="inline-flex items-center gap-1 rounded-full bg-[#e6eee6] px-2.5 py-1 text-xs font-extrabold text-[#326747]"><ShieldCheck size={14}/> Verified</span>}</div>
                <p className="mt-1.5 font-semibold text-[#a95338]">{profile.headline || trade}</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-[#69746d]"><MapPin size={15}/>{profile.location_label || "Service area not added"}</p>
              </div>
              <span className={profile.is_available ? "inline-flex w-fit items-center gap-2 rounded-xl bg-[#e6eee6] px-3.5 py-2.5 text-xs font-extrabold text-[#326747]" : "inline-flex w-fit items-center gap-2 rounded-xl bg-[#f1eee8] px-3.5 py-2.5 text-xs font-bold text-[#777e78]"}><span className={profile.is_available ? "h-2 w-2 rounded-full bg-[#3f986c]" : "h-2 w-2 rounded-full bg-[#a1a69f]"}/>{profile.is_available ? "Available for work" : "Currently busy"}</span>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl bg-[#f8f5ef] p-3 sm:p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#879189] sm:text-xs">Rating</p><p className="mt-2 flex items-center gap-1.5 text-lg font-black sm:text-2xl"><Star size={16} className="fill-[#e5a34e] text-[#e5a34e]"/>{Number(profile.rating_avg || 0).toFixed(1)}</p><p className="mt-1 text-[10px] text-[#879189] sm:text-xs">{profile.total_reviews || 0} reviews</p></div>
              <div className="rounded-2xl bg-[#f8f5ef] p-3 sm:p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#879189] sm:text-xs">Jobs done</p><p className="mt-2 text-lg font-black sm:text-2xl">{profile.completed_jobs || 0}</p><p className="mt-1 text-[10px] text-[#879189] sm:text-xs">Completed jobs</p></div>
              <div className="rounded-2xl bg-[#f8f5ef] p-3 sm:p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#879189] sm:text-xs">Trade</p><p className="mt-2 text-sm font-black sm:text-base">{trade}</p><p className="mt-1 text-[10px] text-[#879189] sm:text-xs">Core skill</p></div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <section className="rounded-[1.5rem] border border-[#1d3027]/8 bg-white p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#a95338]">The person behind the craft</p><h2 className="mt-1 text-xl font-black">About</h2></div><UserRound size={20} className="text-[#244b3a]"/></div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#58665d]">{profile.bio || "This artisan hasn't added a professional introduction yet. Check back as their profile grows."}</p>
            </section>
            <section className="rounded-[1.5rem] border border-[#1d3027]/8 bg-white p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#a95338]">Proof of skill</p><h2 className="mt-1 text-xl font-black">Work portfolio</h2></div><Images size={21} className="text-[#244b3a]"/></div>
              <div className="mt-4 rounded-2xl border border-dashed border-[#1d3027]/15 bg-[#f8f5ef] px-5 py-8 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white text-[#a95338]"><Images size={20}/></div><p className="mt-3 text-sm font-extrabold">Work samples are coming next</p><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#78837b]">This space will showcase finished projects, before-and-after photos and short work clips. No sample work is shown until the artisan uploads it.</p></div>
            </section>
          </div>

          <aside className="h-fit rounded-[1.5rem] border border-[#1d3027]/8 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#a95338]">Connect professionally</p>
            <h2 className="mt-2 text-xl font-black">{isOwnProfile ? "Your public profile" : "Need this skill?"}</h2>
            <p className="mt-2 text-sm leading-6 text-[#69746d]">{isOwnProfile ? "This is how other people see your professional profile." : "Contact and job requests will be enabled after the secure connection flow is ready."}</p>
            {isOwnProfile ? <Link href="/profile/edit" className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#244b3a] px-4 py-3 text-sm font-extrabold text-white">Edit my profile <ArrowUpRight size={16}/></Link>
            : <div className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f1eee8] px-4 py-3 text-sm font-extrabold text-[#777e78]" aria-disabled="true"><MessageCircle size={16}/> Messaging coming soon</div>}
            <div className="mt-5 space-y-3 border-t border-[#1d3027]/8 pt-4 text-xs text-[#69746d]"><p className="flex items-center gap-2"><BadgeCheck size={15} className="text-[#3b7654]"/> Profile details are public</p><p className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#3b7654]"/> Account editing stays private</p><p className="flex items-center gap-2"><Clock3 size={15} className="text-[#a95338]"/> Availability shown by artisan</p></div>
          </aside>
        </div>
      </> : null}
      <footer className="mt-10 flex flex-col gap-2 border-t border-[#1d3027]/10 py-5 text-xs text-[#879189] sm:flex-row sm:items-center sm:justify-between"><span>FundiConnect · Local skills. Local opportunity.</span><Link href="/" className="font-bold text-[#244b3a]">Back to the community</Link></footer>
    </div>
  </main>;
}
