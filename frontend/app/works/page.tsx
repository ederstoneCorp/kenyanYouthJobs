"use client";

import Link from "next/link";
import { House, Compass, BriefcaseBusiness, MessageCircle, ArrowLeft } from "lucide-react";

export default function Page() {
  const active = "My Works";
  return <main className="min-h-screen bg-[#f8f5ef] pb-24 text-[#1c2923] md:pb-0">
    <header className="sticky top-0 z-30 border-b border-[#1c2923]/10 bg-[#fffdf9]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="FundiConnect home" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#244b3a] text-lg font-black text-white">F</span>
          <span><b className="block text-base tracking-tight sm:text-lg">FundiConnect</b><span className="block text-[9px] font-bold uppercase tracking-[.2em] text-[#a95338]">Skills that build Kenya</span></span>
        </Link>
        <Link href="/" className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[#244b3a] hover:bg-[#244b3a]/5"><ArrowLeft size={16}/> Home</Link>
        <Link href="/profile/" className="ml-auto inline-flex min-h-10 items-center rounded-xl border border-[#244b3a]/15 px-3 py-2 text-sm font-bold text-[#244b3a] hover:bg-[#244b3a]/5">My Profile</Link>
      </div>
    </header>
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#a95338]">FundiConnect</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">My Works</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#69746d]">A dedicated space for artisans to showcase their skills and completed projects.</p>
      <div className="mt-8 rounded-3xl border border-[#1d3027]/10 bg-[#fffdf9] p-7 sm:p-10"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e6eee6] text-[#244b3a]"><BriefcaseBusiness size={25}/></div><h2 className="mt-5 text-xl font-black">Your work portfolio</h2><p className="mt-2 max-w-xl text-sm leading-7 text-[#69746d]">This is where your completed jobs, project photos and work samples will live. Portfolio uploads are not enabled yet.</p></div>
    </section>
    <footer className="border-t border-[#1d3027]/10 bg-[#fffdf9] px-5 py-6 text-center text-xs text-[#69746d]">FundiConnect · Local skills. Local opportunity.</footer>
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#1d3027]/10 bg-[#fffdf9]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(28,41,35,.08)] backdrop-blur md:hidden">
      {[{label:"Home",href:"/",icon:House},{label:"Discover",href:"/discover",icon:Compass},{label:"My Works",href:"/works",icon:BriefcaseBusiness},{label:"Inbox",href:"/inbox",icon:MessageCircle}].map(item=><Link key={item.label} href={item.href} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${item.label === active ? "text-[#a95338]" : "text-[#68736c]"}`}><item.icon size={19}/>{item.label}</Link>)}
    </nav>
  </main>;
}
