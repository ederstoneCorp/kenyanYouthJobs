"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BadgeCheck, MapPin, Pencil, UserRound, Eye, LoaderCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

type ProfileSummary = {
  role: "customer" | "artisan";
  full_name: string;
  headline: string | null;
  location_label: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export default function MyProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !authData.user) {
        router.replace("/login/");
        return;
      }

      setUserId(authData.user.id);
      setEmail(authData.user.email || "");
      const { data, error: profileError } = await supabase
        .from("users")
        .select("role, full_name, headline, location_label, avatar_url, bio")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (!active) return;
      if (profileError) setError("We couldn't load your profile. Please try again.");
      else if (data) setProfile({
        role: data.role === "artisan" ? "artisan" : "customer",
        full_name: data.full_name || "Your name",
        headline: data.headline || null,
        location_label: data.location_label || null,
        avatar_url: data.avatar_url || null,
        bio: data.bio || null,
      });
      else setError("Your profile details have not been created yet. Open Edit Profile to complete them.");
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [router]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f8f5ef] p-6"><div className="flex items-center gap-3 text-sm font-semibold text-[#244b3a]"><LoaderCircle className="animate-spin" size={20}/> Loading your profile…</div></main>;

  return <main className="min-h-screen bg-[#f8f5ef] px-4 py-6 text-[#1c2923] sm:px-6 sm:py-10">
    <div className="mx-auto max-w-4xl">
      <header className="flex items-center justify-between gap-3">
        <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-[#244b3a] hover:bg-[#244b3a]/5"><ArrowLeft size={17}/> Home</Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-black"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#244b3a] text-white">F</span>FundiConnect</Link>
      </header>

      <section className="mt-7 overflow-hidden rounded-[1.7rem] border border-[#1d3027]/10 bg-white shadow-[0_10px_40px_rgba(28,41,35,.05)]">
        <div className="bg-[#1d3027] px-6 py-7 text-white sm:px-9 sm:py-9">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#e8ad63]">Your account</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">My Profile</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Manage your professional identity, or preview the public profile other people can see.</p>
        </div>

        {error ? <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-8">{error}</div> : profile ? <>
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-8">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#e8eee7] text-[#244b3a]">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="Your profile" className="h-full w-full object-cover"/> : <UserRound size={38}/>}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-black tracking-tight">{profile.full_name}</h2>
              <p className="mt-1 font-semibold text-[#a95338]">{profile.headline || "Add a professional headline"}</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-[#69746d]"><MapPin size={15}/>{profile.location_label || "Service area not added"}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#58665d]">{profile.bio || "Add a short introduction so people can learn about your skills and experience."}</p>
              <p className="mt-4 text-xs text-[#879189]">Signed in as {email}</p>
            </div>
          </div>
          <div className="grid gap-3 border-t border-[#1d3027]/10 bg-[#fffdf9] p-5 sm:grid-cols-2 sm:p-8">
            {profile.role === "artisan" && <Link href={"/artisan/?id=" + encodeURIComponent(userId)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#244b3a]/20 bg-white px-4 py-3 text-sm font-extrabold text-[#244b3a] hover:bg-[#e6eee6]"><Eye size={17}/> View public profile <ArrowUpRight size={15}/></Link>}
            <Link href="/profile/edit/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#b9573d] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#98442f]"><Pencil size={17}/> Edit profile</Link>
          </div>
        </> : <div className="p-5 sm:p-8"><Link href="/profile/edit" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#b9573d] px-4 py-3 text-sm font-extrabold text-white"><Pencil size={17}/> Complete profile</Link></div>}
      </section>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-[#879189]"><BadgeCheck size={14}/> Only you can edit your account details.</p>
    </div>
  </main>;
}
