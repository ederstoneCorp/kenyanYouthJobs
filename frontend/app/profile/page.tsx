"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, LoaderCircle, Save, UserRound } from "lucide-react";
import { supabase } from "../lib/supabase";

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
      if (profileError) setError("Unable to load your profile. Please check the database setup and try again.");
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
    if (!chosen.type.startsWith("image/")) { setError("Choose an image file."); return; }
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
      if (uploadError) { setSaving(false); setError("Photo upload failed. Check the Supabase avatar bucket and storage policies, then try again."); return; }
      avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    }
    const { error: updateError } = await supabase.from("users").update({
      full_name: form.full_name.trim(), headline: form.headline.trim() || null,
      bio: form.bio.trim() || null, location_label: form.location_label.trim() || null,
      avatar_url: avatarUrl || null,
    }).eq("id", userId);
    setSaving(false);
    if (updateError) { setError("Your profile couldn't be saved. Please check the profile database setup and try again."); return; }
    setForm({ ...form, full_name: form.full_name.trim(), avatar_url: avatarUrl });
    setFile(null); setMessage("Profile saved successfully.");
  }

  if (loading) return <main className="min-h-screen bg-sand p-10 text-center">Loading your profile…</main>;
  return <main className="min-h-screen bg-sand px-5 py-8 text-ink"><div className="mx-auto max-w-2xl">
    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-forest"><ArrowLeft size={16}/> Back to directory</Link>
    <section className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-9">
      <p className="text-xs font-bold uppercase tracking-widest text-forest">Your professional identity</p><h1 className="mt-2 text-3xl font-black">Edit profile</h1><p className="mt-2 text-sm text-black/60">Add a photo and tell customers what you do best.</p>
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div className="flex flex-wrap items-center gap-5"><div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-sand text-forest">{preview ? <img src={preview} alt="Profile preview" className="h-full w-full object-cover"/> : <UserRound size={36}/>}</div><div><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-bold"><Camera size={17}/> Choose profile photo<input type="file" accept="image/*" capture="user" onChange={choosePhoto} className="sr-only"/></label><p className="mt-2 text-xs text-black/50">Images up to 5 MB. On supported phones, you can use the camera.</p></div></div>
        <label className="block text-sm font-semibold">Full name<input required maxLength={100} value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-forest"/></label>
        <label className="block text-sm font-semibold">Professional headline <span className="font-normal text-black/50">(optional)</span><input maxLength={120} value={form.headline} onChange={e=>setForm({...form,headline:e.target.value})} placeholder="e.g. Experienced electrician serving Ruiru" className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-forest"/></label>
        <label className="block text-sm font-semibold">About you <span className="font-normal text-black/50">(optional)</span><textarea rows={5} maxLength={1500} value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Describe your experience, services and the work you do best." className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-forest"/></label>
        <label className="block text-sm font-semibold">Service area <span className="font-normal text-black/50">(optional; do not enter your home address)</span><input maxLength={120} value={form.location_label} onChange={e=>setForm({...form,location_label:e.target.value})} placeholder="e.g. Ruiru, Kiambu County" className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-forest"/></label>
        <div className="text-xs text-black/50">Signed in as {email}. Your role, verification status and ratings cannot be changed here.</div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="rounded-xl bg-mint/40 p-3 text-sm text-forest">{message}</p>}
        <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3.5 font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle size={17} className="animate-spin"/> : <Save size={17}/>} {saving ? "Saving profile…" : "Save profile"}</button>
      </form>
    </section>
  </div></main>;
}
