"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, LoaderCircle, Save, UserRound, MapPin, ShieldCheck, BadgeCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";

type ProfileForm = { full_name: string; headline: string; bio: string; location_label: string; avatar_url: string };

export default function EditProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState<ProfileForm>({ full_name: "", headline: "", bio: "", location_label: "", avatar_url: "" });
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !authData.user) { router.replace("/login"); return; }
      setUserId(authData.user.id);
      setEmail(authData.user.email || "");
      const { data, error: profileError } = await supabase.from("users")
        .select("full_name, headline, bio, location_label, avatar_url")
        .eq("id", authData.user.id).maybeSingle();
      if (!active) return;
      if (profileError) setError("Unable to load your profile. Please try again.");
      else if (data) {
        const next = { full_name: data.full_name || "", headline: data.headline || "", bio: data.bio || "", location_label: data.location_label || "", avatar_url: data.avatar_url || "" };
        setForm(next); setPreview(next.avatar_url);
      }
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [router]);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] || null;
    setError(""); setMessage("");
    if (!chosen) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(chosen.type)) { setError("Choose a JPG, PNG, WebP or GIF image."); return; }
    if (chosen.size > 5 * 1024 * 1024) { setError("The image must be 5 MB or smaller."); return; }
    setFile(chosen); setPreview(URL.createObjectURL(chosen));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    if (!userId) { setError("Please sign in again before saving."); return; }
    setSaving(true);
    let avatarUrl = form.avatar_url;
    if (file) {
      const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = userId + "/" + Date.now() + "." + extension;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) { setSaving(false); setError("Photo upload failed. Please try another image or try again later."); return; }
      avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    }
    const { error: updateError } = await supabase.from("users").update({
      full_name: form.full_name.trim(), headline: form.headline.trim() || null,
      bio: form.bio.trim() || null, location_label: form.location_label.trim() || null,
      avatar_url: avatarUrl || null,
    }).eq("id", userId);
    setSaving(false);
    if (updateError) { setError("Your profile couldn't be saved. Please check your connection and try again."); return; }
    setForm({ ...form, full_name: form.full_name.trim(), avatar_url: avatarUrl });
    setFile(null); setMessage("Profile saved successfully.");
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f8f5ef] p-6"><div className="w-full max-w-xl animate-pulse rounded-3xl bg-white p-8"><div className="h-5 w-1/3 rounded bg-[#e9e6df]"/><div className="mt-5 h-10 w-2/3 rounded bg-[#e9e6df]"/><div className="mt-8 h-32 rounded-2xl bg-[#efede7]"/></div></main>;

  return <main className="min-h-screen bg-[#f8f5ef] px-4 py-5 text-[#1c2923] sm:px-6 sm:py-8">
    <div className="mx-auto max-w-5xl">
      <header className="flex items-center justify-between gap-3"><Link href="/profile" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-[#244b3a] hover:bg-[#244b3a]/5"><ArrowLeft size={17}/> Back to my profile</Link><Link href="/" className="flex items-center gap-2 text-sm font-black"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#244b3a] text-white">F</span><span className="hidden sm:inline">FundiConnect</span></Link></header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
        <aside className="h-fit overflow-hidden rounded-[1.6rem] bg-[#1d3027] p-6 text-white sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#e8ad63]"><BadgeCheck size={14}/> Your professional identity</div>
          <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl">Make your work speak for you.</h1>
          <p className="mt-4 text-sm leading-7 text-white/65">Give customers and other professionals a clear picture of who you are, what you do and where you work.</p>
          <div className="mt-7 space-y-4 border-t border-white/10 pt-5 text-sm text-white/75"><p className="flex items-start gap-3"><Camera size={18} className="mt-0.5 shrink-0 text-[#e8ad63]"/> Add a recognizable profile photo.</p><p className="flex items-start gap-3"><UserRound size={18} className="mt-0.5 shrink-0 text-[#e8ad63]"/> Describe your craft and experience.</p><p className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-[#e8ad63]"/> Share your service area, not your home address.</p></div>
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.06] p-4"><p className="flex items-center gap-2 text-xs font-bold text-[#e8ad63]"><ShieldCheck size={15}/> Your account stays yours</p><p className="mt-2 text-xs leading-5 text-white/60">Only you can edit these details. Your role, verification status and ratings are protected.</p></div>
        </aside>

        <section className="rounded-[1.6rem] border border-[#1d3027]/8 bg-white p-5 shadow-[0_8px_32px_rgba(28,41,35,.04)] sm:p-8">
          <div className="border-b border-[#1d3027]/8 pb-5"><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#a95338]">Profile settings</p><h2 className="mt-1 text-2xl font-black tracking-tight">Edit your profile</h2><p className="mt-2 text-sm leading-6 text-[#69746d]">Your profile helps the community recognize your skills and experience.</p></div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="flex flex-col gap-4 rounded-2xl bg-[#f8f5ef] p-4 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-white bg-[#e8eee7] text-[#244b3a] shadow-sm">{preview ? <img src={preview} alt="Profile preview" className="h-full w-full object-cover"/> : <UserRound size={36}/>}</div>
              <div className="min-w-0"><label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#244b3a] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#1d3027]"><Camera size={17}/> Choose profile photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" capture="user" onChange={choosePhoto} className="sr-only"/></label><p className="mt-2 text-xs leading-5 text-[#78837b]">JPG, PNG, WebP or GIF · up to 5 MB. Camera supported on compatible phones.</p></div>
            </div>
            <label className="block text-sm font-bold">Full name<input required maxLength={100} value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} className="mt-2 min-h-12 w-full rounded-xl border border-[#1d3027]/15 bg-white px-4 py-3 font-normal outline-none transition focus:border-[#244b3a] focus:ring-2 focus:ring-[#244b3a]/10"/></label>
            <label className="block text-sm font-bold">Professional headline <span className="font-normal text-[#879189]">(optional)</span><input maxLength={120} value={form.headline} onChange={e=>setForm({...form,headline:e.target.value})} placeholder="e.g. Experienced electrician serving Ruiru" className="mt-2 min-h-12 w-full rounded-xl border border-[#1d3027]/15 bg-white px-4 py-3 font-normal outline-none transition focus:border-[#244b3a] focus:ring-2 focus:ring-[#244b3a]/10"/></label>
            <label className="block text-sm font-bold">About you <span className="font-normal text-[#879189]">(optional)</span><textarea rows={5} maxLength={1500} value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Tell people about your experience, services and the work you do best." className="mt-2 w-full rounded-xl border border-[#1d3027]/15 bg-white px-4 py-3 font-normal leading-6 outline-none transition focus:border-[#244b3a] focus:ring-2 focus:ring-[#244b3a]/10"/></label>
            <label className="block text-sm font-bold">Service area <span className="font-normal text-[#879189]">(optional)</span><span className="mt-1 block text-xs font-normal text-[#879189]">County, town or neighbourhood only. Do not enter your home address.</span><input maxLength={120} value={form.location_label} onChange={e=>setForm({...form,location_label:e.target.value})} placeholder="e.g. Ruiru, Kiambu County" className="mt-2 min-h-12 w-full rounded-xl border border-[#1d3027]/15 bg-white px-4 py-3 font-normal outline-none transition focus:border-[#244b3a] focus:ring-2 focus:ring-[#244b3a]/10"/></label>
            <div className="rounded-xl bg-[#f8f5ef] px-4 py-3 text-xs leading-5 text-[#69746d]">Signed in as <span className="font-bold text-[#34483a]">{email}</span>. Your role, email, verification status and ratings cannot be changed here.</div>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {message && <p role="status" className="rounded-xl border border-[#c9dfcf] bg-[#e6eee6] p-3 text-sm font-semibold text-[#326747]">{message}</p>}
            <button type="submit" disabled={saving} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#b9573d] px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#98442f] disabled:cursor-not-allowed disabled:opacity-60">{saving ? <LoaderCircle size={17} className="animate-spin"/> : <Save size={17}/>} {saving ? "Saving profile…" : "Save profile"}</button>
          </form>
        </section>
      </div>
      <footer className="py-6 text-center text-xs text-[#879189]">FundiConnect · Your skills. Your reputation. Your network.</footer>
    </div>
  </main>;
}
