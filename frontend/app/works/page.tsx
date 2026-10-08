"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { House, Compass, BriefcaseBusiness, MessageCircle, ArrowLeft, ImagePlus, LoaderCircle, Trash2, UploadCloud, X } from "lucide-react";
import { supabase } from "../lib/supabase";

type WorkSample = { id: string; title: string; description: string | null; image_url: string; storage_path: string; created_at: string };

export default function Page() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [isArtisan, setIsArtisan] = useState(false);
  const [samples, setSamples] = useState<WorkSample[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !authData.user) { router.replace("/login/"); return; }
      setUserId(authData.user.id);
      const { data: userProfile, error: userError } = await supabase.from("users")
        .select("role").eq("id", authData.user.id).maybeSingle();
      if (!active) return;
      if (userError) setError(`Unable to load your account (${userError.code || "no error code"}): ${userError.message}`);
      else if (!userProfile) setError("Your account profile was not found. Open My Profile and check your profile setup.");
      else if (userProfile.role !== "artisan") setError("The work portfolio is available to artisan accounts. Your account is currently set up as a customer.");
      else {
        setIsArtisan(true);
        const { data, error: sampleError } = await supabase.from("work_samples")
          .select("id, title, description, image_url, storage_path, created_at")
          .eq("artisan_id", authData.user.id).order("created_at", { ascending: false });
        if (!active) return;
        if (sampleError) setError(`Unable to load your portfolio (${sampleError.code || "no error code"}): ${sampleError.message}`);
        else setSamples((data ?? []) as WorkSample[]);
      }
      if (active) setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [router]);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] || null;
    setError(""); setMessage("");
    if (!chosen) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(chosen.type)) {
      setError("Choose a JPG, PNG, WebP or GIF image."); event.target.value = ""; return;
    }
    if (chosen.size > 5 * 1024 * 1024) {
      setError("The image must be 5 MB or smaller."); event.target.value = ""; return;
    }
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    if (!userId || !isArtisan) { setError("Sign in with an artisan account before uploading work."); return; }
    if (!file) { setError("Choose a project photo to upload."); return; }
    if (!title.trim()) { setError("Add a title for this project."); return; }
    setSaving(true);
    const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = userId + "/" + Date.now() + "-" + crypto.randomUUID() + "." + extension;
    const { error: uploadError } = await supabase.storage.from("work-portfolio")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) {
      setSaving(false); setError(`Image upload failed (${uploadError.statusCode || "no status"}): ${uploadError.message}`); return;
    }
    const imageUrl = supabase.storage.from("work-portfolio").getPublicUrl(path).data.publicUrl;
    const { data, error: insertError } = await supabase.from("work_samples").insert({
      artisan_id: userId, title: title.trim(), description: description.trim() || null,
      image_url: imageUrl, storage_path: path,
    }).select("id, title, description, image_url, storage_path, created_at").single();
    if (insertError || !data) {
      await supabase.storage.from("work-portfolio").remove([path]);
      setSaving(false);
      setError(insertError ? `Saving the work sample failed (${insertError.code || "no error code"}): ${insertError.message}` : "The image uploaded, but no portfolio record was returned.");
      return;
    }
    setSamples(current => [data as WorkSample, ...current]);
    setTitle(""); setDescription(""); setFile(null);
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(""); setSaving(false); setMessage("Project added to your portfolio.");
  }

  async function deleteSample(sample: WorkSample) {
    if (!window.confirm(`Delete “${sample.title}” from your portfolio? This cannot be undone.`)) return;
    setError(""); setMessage(""); setDeletingId(sample.id);
    const { data, error: deleteError } = await supabase.from("work_samples")
      .delete().eq("id", sample.id).eq("artisan_id", userId).select("id").maybeSingle();
    if (deleteError || !data) {
      setDeletingId(""); setError(deleteError ? `Could not delete the work sample (${deleteError.code || "no error code"}): ${deleteError.message}` : "No portfolio record was deleted. Check your permissions and try again.");
      return;
    }
    setSamples(current => current.filter(item => item.id !== sample.id));
    const { error: storageError } = await supabase.storage.from("work-portfolio").remove([sample.storage_path]);
    setDeletingId("");
    if (storageError) setMessage("The portfolio entry was deleted, but its stored image could not be removed. You can continue using your portfolio.");
    else setMessage("Project deleted.");
  }

  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f8f5ef] p-6"><LoaderCircle size={22} className="animate-spin text-[#244b3a]"/></main>;

  return <main className="min-h-screen bg-[#f8f5ef] pb-24 text-[#1c2923] md:pb-0">
    <header className="sticky top-0 z-30 border-b border-[#1c2923]/10 bg-[#fffdf9]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="FundiConnect home" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#244b3a] text-lg font-black text-white">F</span>
          <span><b className="block text-base tracking-tight sm:text-lg">FundiConnect</b><span className="block text-[9px] font-bold uppercase tracking-[.2em] text-[#a95338]">Skills that build Kenya</span></span>
        </Link>
        <Link href="/" className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[#244b3a] hover:bg-[#244b3a]/5"><ArrowLeft size={16}/> Home</Link>
        <Link href="/profile/" className="inline-flex min-h-10 items-center rounded-xl border border-[#244b3a]/15 px-3 py-2 text-sm font-bold text-[#244b3a] hover:bg-[#244b3a]/5">My Profile</Link>
      </div>
    </header>
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#a95338]">FundiConnect</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">My Works</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#69746d]">Show customers the quality of your work with real project photos and concise descriptions.</p>

      {error && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {message && <div role="status" className="mt-4 rounded-xl border border-[#c9dfcf] bg-[#e6eee6] p-4 text-sm font-semibold text-[#326747]">{message}</div>}

      {isArtisan && <div className="mt-7 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <section className="h-fit rounded-3xl border border-[#1d3027]/10 bg-white p-6 sm:p-7">
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e6eee6] text-[#244b3a]"><ImagePlus size={23}/></span><div><h2 className="text-lg font-black">Add a project</h2><p className="text-xs text-[#78837b]">Images up to 5 MB</p></div></div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block text-sm font-bold">Project title<input required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Kitchen sink installation" className="mt-2 min-h-12 w-full rounded-xl border border-[#1d3027]/15 px-4 py-3 font-normal outline-none focus:border-[#244b3a]"/></label>
            <label className="block text-sm font-bold">Description <span className="font-normal text-[#879189]">(optional)</span><textarea rows={3} maxLength={800} value={description} onChange={e => setDescription(e.target.value)} placeholder="Briefly describe the job and what you delivered." className="mt-2 w-full rounded-xl border border-[#1d3027]/15 px-4 py-3 font-normal leading-6 outline-none focus:border-[#244b3a]"/></label>
            <label className="block cursor-pointer rounded-2xl border border-dashed border-[#244b3a]/30 bg-[#f8f5ef] p-4 text-center hover:border-[#244b3a]/60"><UploadCloud size={22} className="mx-auto text-[#244b3a]"/><span className="mt-2 block text-sm font-extrabold">{file ? file.name : "Choose a project photo"}</span><span className="mt-1 block text-xs text-[#78837b]">JPG, PNG, WebP or GIF · up to 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} className="sr-only"/></label>
            {preview && <div className="relative overflow-hidden rounded-2xl bg-[#f8f5ef]"><img src={preview} alt="Selected project preview" className="max-h-64 w-full object-contain"/><button type="button" onClick={() => {setFile(null); if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); setPreview("");}} aria-label="Remove selected photo" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white text-[#244b3a] shadow"><X size={17}/></button></div>}
            <button type="submit" disabled={saving} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#b9573d] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#98442f] disabled:cursor-not-allowed disabled:opacity-60">{saving ? <LoaderCircle size={17} className="animate-spin"/> : <UploadCloud size={17}/>} {saving ? "Uploading project…" : "Add to portfolio"}</button>
          </form>
        </section>

        <section>
          <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#a95338]">Your projects</p><h2 className="mt-1 text-xl font-black">Portfolio gallery</h2></div><span className="text-xs font-bold text-[#78837b]">{samples.length} {samples.length === 1 ? "project" : "projects"}</span></div>
          {samples.length === 0 ? <div className="mt-4 rounded-3xl border border-dashed border-[#1d3027]/20 bg-white px-6 py-12 text-center"><ImagePlus size={28} className="mx-auto text-[#a95338]"/><h3 className="mt-3 font-black">Your portfolio is empty</h3><p className="mt-2 text-sm leading-6 text-[#69746d]">Add a photo of a completed job to help customers understand your skills.</p></div>
          : <div className="mt-4 grid gap-4 sm:grid-cols-2">{samples.map(sample => <article key={sample.id} className="overflow-hidden rounded-2xl border border-[#1d3027]/10 bg-white shadow-sm"><img src={sample.image_url} alt={sample.title} loading="lazy" className="h-48 w-full object-cover"/><div className="p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-extrabold">{sample.title}</h3><button type="button" disabled={deletingId === sample.id} onClick={() => deleteSample(sample)} aria-label={"Delete " + sample.title} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#a95338] hover:bg-[#f4e5d8] disabled:opacity-50">{deletingId === sample.id ? <LoaderCircle size={16} className="animate-spin"/> : <Trash2 size={16}/>}</button></div>{sample.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#69746d]">{sample.description}</p>}<p className="mt-3 text-[11px] text-[#879189]">{new Date(sample.created_at).toLocaleDateString()}</p></div></article>)}</div>}
        </section>
      </div>}
      {!isArtisan && !error && <div className="mt-7 rounded-3xl border border-[#1d3027]/10 bg-white p-8"><p className="text-sm text-[#69746d]">Sign in with an artisan account to manage a work portfolio.</p></div>}
    </section>
    <footer className="border-t border-[#1d3027]/10 bg-[#fffdf9] px-5 py-6 text-center text-xs text-[#69746d]">FundiConnect · Local skills. Local opportunity.</footer>
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#1d3027]/10 bg-[#fffdf9]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(28,41,35,.08)] backdrop-blur md:hidden">
      {[{label:"Home",href:"/",icon:House},{label:"Discover",href:"/discover/",icon:Compass},{label:"My Works",href:"/works/",icon:BriefcaseBusiness},{label:"Inbox",href:"/inbox/",icon:MessageCircle}].map(item=><Link key={item.label} href={item.href} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${item.label === "My Works" ? "text-[#a95338]" : "text-[#68736c]"}`}><item.icon size={19}/>{item.label}</Link>)}
    </nav>
  </main>;
}
