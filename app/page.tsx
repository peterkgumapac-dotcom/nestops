"use client";

import { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   NESTOPS LANDING PAGE — v3 (Market-Aligned)
   Sections:
     1. Nav
     2. Hero
     3. Social proof bar
     4. Pain Points (NEW)
     5. Features — Tier 1/2 angles (REWRITTEN)
     6. Replace Your Tool Stack (NEW)
     7. Competitive Matrix (NEW)
     8. How It Works
     9. Role-Based Portals
    10. Testimonials
    11. Pricing
    12. CTA
    13. Footer
   ───────────────────────────────────────────── */

// ── Icons (inline SVG components) ──────────────────

function IconShield({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function IconSun({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  );
}

function IconCube({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}

function IconUsers({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function IconSparkles({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function IconClipboard({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
    </svg>
  );
}

function IconBolt({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

function IconArchive({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  );
}

function IconHome({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function IconChat({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  );
}

function IconCheck({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function IconX({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function IconMinus({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

function IconQuote({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function IconArrowRight({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

// ── Data ──────────────────────────────────────

const painPoints = [
  {
    quote: "Not enough layers for authorisation — all housekeepers have same access as coordinators",
    source: "Breezeway review",
    pain: "Your cleaner can see owner financials. Your contractor can modify SOPs. Everyone has the same access.",
  },
  {
    quote: "Improved inventory management needed",
    source: "Breezeway review",
    pain: "Guest finds no towels at 8pm. You find out from a 1-star review. Spreadsheet says you had 20.",
  },
  {
    quote: "Charges for every single SMS notification — including internal alerts",
    source: "Enso Connect review",
    pain: "You're paying per text just to tell your own team about a check-in. Every notification has a price tag.",
  },
  {
    quote: "Filters not enough or inconsistent",
    source: "Breezeway review",
    pain: "Maintenance tech arrives at an occupied property. Nobody told him there was a guest. No system flagged it.",
  },
];

const toolStackData = [
  { tool: "Breezeway", does: "Cleaning + maintenance ops", cost: "$80–200/mo", replacedBy: "Operations Hub + Cleaning Calendar" },
  { tool: "SuiteOp / Enso", does: "Guest verification + portal", cost: "$50–150/mo", replacedBy: "Guest Experience Engine" },
  { tool: "Touchstay", does: "Digital guidebooks", cost: "$15–40/mo", replacedBy: "AI Guidebooks from Property Library" },
  { tool: "Asana / ClickUp", does: "Task management", cost: "$35–125/mo", replacedBy: "Operations Hub (Tasks + Kanban + SOPs)" },
  { tool: "Notion", does: "SOPs, docs, property info", cost: "$50–75/mo", replacedBy: "Property Library + SOPs + Meeting Notes" },
  { tool: "Turno", does: "Cleaning coordination", cost: "$80/mo", replacedBy: "Cleaning Calendar + Turnover Templates" },
  { tool: "WhatsApp", does: "Team coordination", cost: "20–40 hrs/mo", replacedBy: "Activity Thread on every task" },
];

const competitiveFeatures = [
  { feature: "Permission to Enter (PTE) system", nestops: "full", breezeway: "no", suiteop: "no", enso: "no", touchstay: "no", generic: "no" },
  { feature: "Daily briefing (pre-login, role-aware)", nestops: "full", breezeway: "no", suiteop: "no", enso: "no", touchstay: "no", generic: "no" },
  { feature: "Inventory auto-deduction from cleanings", nestops: "full", breezeway: "no", suiteop: "no", enso: "no", touchstay: "no", generic: "no" },
  { feature: "Role-based access (4-tier)", nestops: "full", breezeway: "no", suiteop: "partial", enso: "no", touchstay: "no", generic: "partial" },
  { feature: "Property Library (10-tab data foundation)", nestops: "full", breezeway: "no", suiteop: "no", enso: "no", touchstay: "no", generic: "no" },
  { feature: "AI guidebooks from property data", nestops: "full", breezeway: "no", suiteop: "no", enso: "no", touchstay: "partial", generic: "no" },
  { feature: "Guest verification (conditional gates)", nestops: "full", breezeway: "no", suiteop: "full", enso: "full", touchstay: "no", generic: "no" },
  { feature: "Cleaning checklists + photo proof", nestops: "full", breezeway: "full", suiteop: "partial", enso: "no", touchstay: "no", generic: "no" },
  { feature: "Owner portal with payment", nestops: "full", breezeway: "no", suiteop: "no", enso: "no", touchstay: "no", generic: "no" },
  { feature: "Contractor self-service + work orders", nestops: "full", breezeway: "no", suiteop: "no", enso: "no", touchstay: "no", generic: "no" },
  { feature: "SOP acknowledgement tracking", nestops: "full", breezeway: "no", suiteop: "no", enso: "no", touchstay: "no", generic: "no" },
  { feature: "Compliance + cert expiry alerts", nestops: "full", breezeway: "no", suiteop: "no", enso: "no", touchstay: "no", generic: "no" },
  { feature: "Vendor AI email ordering", nestops: "full", breezeway: "no", suiteop: "no", enso: "no", touchstay: "no", generic: "no" },
  { feature: "Upsells with staff approval chain", nestops: "full", breezeway: "full", suiteop: "full", enso: "full", touchstay: "full", generic: "no" },
  { feature: "Task management", nestops: "full", breezeway: "full", suiteop: "full", enso: "no", touchstay: "no", generic: "partial" },
  { feature: "Digital guidebooks", nestops: "full", breezeway: "full", suiteop: "full", enso: "full", touchstay: "full", generic: "no" },
];

// ── Component ────────────────────────────────

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#1a1a1a] antialiased">
      {/* ═══════════════════════ NAV ═══════════════════════ */}
      <nav className="fixed top-0 z-50 w-full border-b border-[#e8e6e1] bg-[#fafaf8]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] text-sm font-bold text-white">
              N
            </div>
            <span className="text-lg font-semibold tracking-tight">NestOps</span>
            <span className="rounded-full bg-[#e8e6e1] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[#666]">
              v2.0
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#pain" className="text-sm text-[#666] transition hover:text-[#1a1a1a]">Why NestOps</a>
            <a href="#features" className="text-sm text-[#666] transition hover:text-[#1a1a1a]">Features</a>
            <a href="#compare" className="text-sm text-[#666] transition hover:text-[#1a1a1a]">Compare</a>
            <a href="#portals" className="text-sm text-[#666] transition hover:text-[#1a1a1a]">Portals</a>
            <a href="#pricing" className="text-sm text-[#666] transition hover:text-[#1a1a1a]">Pricing</a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="text-sm text-[#666] transition hover:text-[#1a1a1a]">
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#333]"
            >
              Try free
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#e8e6e1] bg-[#fafaf8] px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#pain" className="text-sm text-[#666]" onClick={() => setMobileMenuOpen(false)}>Why NestOps</a>
              <a href="#features" className="text-sm text-[#666]" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#compare" className="text-sm text-[#666]" onClick={() => setMobileMenuOpen(false)}>Compare</a>
              <a href="#portals" className="text-sm text-[#666]" onClick={() => setMobileMenuOpen(false)}>Portals</a>
              <a href="#pricing" className="text-sm text-[#666]" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <hr className="border-[#e8e6e1]" />
              <Link href="/login" className="text-sm text-[#666]">Sign in</Link>
              <Link href="/login" className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-center text-sm font-medium text-white">
                Try free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        {/* subtle grid bg */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Pill */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e6e1] bg-white px-4 py-1.5 text-xs font-medium text-[#666] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              YOUR PMS RUNS BOOKINGS. NESTOPS RUNS EVERYTHING AFTER.
            </div>
          </div>

          <h1 className="mx-auto max-w-4xl text-center text-4xl font-bold leading-tight tracking-tight md:text-6xl md:leading-[1.1]">
            Stop duct-taping
            <br />
            <span className="text-[#999]">5 tools together</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-[#666] md:text-xl">
            NestOps replaces Breezeway + Asana + Notion + Touchstay + WhatsApp
            with one operations platform — plus features none of them have.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#333] hover:shadow-xl"
            >
              Start free trial
              <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e8e6e1] bg-white px-8 py-3.5 text-sm font-semibold text-[#1a1a1a] shadow-sm transition hover:border-[#ccc] hover:shadow-md"
            >
              View demo
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-[#999]">
            No credit card required · 14-day free trial · Cancel anytime
          </p>

          {/* Dashboard mock */}
          <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-[#e8e6e1] bg-white shadow-2xl shadow-black/5">
            <div className="flex items-center gap-2 border-b border-[#e8e6e1] bg-[#fafaf8] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#e8e6e1]" />
                <div className="h-3 w-3 rounded-full bg-[#e8e6e1]" />
                <div className="h-3 w-3 rounded-full bg-[#e8e6e1]" />
              </div>
              <div className="mx-auto rounded-md bg-[#e8e6e1] px-4 py-1 text-[11px] text-[#999]">
                nestops.app/operator/dashboard
              </div>
            </div>
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden w-52 border-r border-[#e8e6e1] bg-[#fafaf8] p-4 md:block">
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1a1a1a] text-[10px] font-bold text-white">N</div>
                  <span className="text-sm font-semibold">NestOps</span>
                </div>
                {["Dashboard", "Properties", "Tasks & SOPs", "Team", "Cleaning", "Inventory", "Guest Services"].map((item) => (
                  <div key={item} className={`mb-1 rounded-md px-3 py-2 text-xs ${item === "Dashboard" ? "bg-white font-medium shadow-sm" : "text-[#666]"}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 p-6">
                <p className="text-sm text-[#666]">Good morning, Peter ☀️</p>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { label: "Properties", value: "24", change: "+2" },
                    { label: "Open Tasks", value: "18", change: "-3" },
                    { label: "Staff Online", value: "7", change: "" },
                    { label: "PTE Pending", value: "2", change: "⚡" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-[#e8e6e1] bg-[#fafaf8] p-4">
                      <p className="text-[11px] text-[#999]">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                      {stat.change && (
                        <span className="mt-1 inline-block text-[10px] text-emerald-600">{stat.change}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { text: "PTE approved by guest at Ocean View — door code unlocked until 15:00", time: "2m ago", badge: "PTE" },
                    { text: "Maria completed turnover at Sunset Villa — 10 towels auto-deducted", time: "15m ago", badge: "Inventory" },
                    { text: "Bjorn's briefing: 3 jobs today, 1 occupied (PTE pending)", time: "1h ago", badge: "Briefing" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-[#e8e6e1] bg-white px-4 py-3">
                      <span className="mt-0.5 rounded-md bg-[#f0efe9] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#666]">
                        {activity.badge}
                      </span>
                      <span className="flex-1 text-xs text-[#444]">{activity.text}</span>
                      <span className="text-[10px] text-[#bbb]">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF BAR ═══════════ */}
      <section className="border-y border-[#e8e6e1] bg-white py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-10 px-6 md:gap-16">
          {[
            { value: "$310–670", label: "saved per month vs separate tools" },
            { value: "30 sec", label: "PTE demo that sells itself" },
            { value: "5→1", label: "tools consolidated" },
            { value: "20-40 hrs", label: "WhatsApp time eliminated monthly" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold tracking-tight md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-[#999]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ PAIN POINTS (NEW) ═══════════ */}
      <section id="pain" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#999]">The real problem</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Sound familiar?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#666]">
              These are real complaints from operators using Breezeway, SuiteOp, Enso, and generic tools — plus the pain nobody talks about because they don&apos;t know a solution exists.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {painPoints.map((item, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-[#e8e6e1] bg-white p-8 transition hover:border-[#ccc] hover:shadow-lg"
              >
                <IconQuote className="mb-4 text-[#e8e6e1] transition group-hover:text-[#ccc]" />
                <p className="text-sm font-medium italic leading-relaxed text-[#444]">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <p className="mt-2 text-xs text-[#999]">— {item.source}</p>
                <div className="mt-5 border-t border-[#f0efe9] pt-5">
                  <p className="text-sm text-[#666] leading-relaxed">{item.pain}</p>
                </div>
              </div>
            ))}
          </div>

          {/* The unspoken pain */}
          <div className="mt-10 rounded-2xl border border-dashed border-[#d5d3cc] bg-[#f7f6f3] p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#999]">And the pain nobody reviews — because they don&apos;t know a solution exists</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                "Staff entering occupied properties without guest permission",
                "Cleaners finish turnover, forget to restock — guest finds out at 8pm",
                "Operator spends the first hour every morning in WhatsApp archaeology",
                "Staff drives 25 min to a property and doesn't know the gate code",
              ].map((pain, i) => (
                <div key={i} className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                    <IconX className="w-3 h-3" />
                  </span>
                  <p className="text-sm text-[#666] leading-relaxed">{pain}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES — TIER 1/2 (REWRITTEN) ═══════════ */}
      <section id="features" className="border-t border-[#e8e6e1] bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#999]">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Things no other tool can do
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#666]">
              NestOps doesn&apos;t just do what Breezeway, SuiteOp, and Asana do. It does what none of them can — because it&apos;s built from the ground up for STR operations.
            </p>
          </div>

          {/* Tier 1 — The big three */}
          <div className="mt-16">
            <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-emerald-600">
              ⚡ Demo in 30 seconds — highest conversion
            </p>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* PTE */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#1a1a1a] bg-[#1a1a1a] p-8 text-white">
                <div className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  Only NestOps
                </div>
                <IconShield className="mb-4 h-10 w-10 text-emerald-400" />
                <h3 className="text-xl font-bold">Permission to Enter (PTE)</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Your maintenance tech arrives. A guest is inside. <strong className="text-white">Does your software know?</strong>
                </p>
                <div className="mt-6 space-y-2">
                  {[
                    "System auto-detects occupied property",
                    "Guest approves entry from 11:00–15:00",
                    "Door code unlocks on the tech's task",
                    "Time window expires — code re-locks",
                    "Full audit trail. Zero liability.",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-white/80">{step}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs text-white/40">No competitor has this. Not Breezeway. Not SuiteOp. Not Enso. Nobody.</p>
              </div>

              {/* Daily Briefing */}
              <div className="rounded-2xl border border-[#e8e6e1] bg-[#fafaf8] p-8">
                <div className="mb-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Only NestOps
                </div>
                <IconSun className="mb-4 h-10 w-10 text-amber-500" />
                <h3 className="text-xl font-bold">Daily Briefing</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#666]">
                  <strong className="text-[#1a1a1a]">How many WhatsApp messages did you send before 9am today?</strong>
                </p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-[#e8e6e1] bg-white p-4">
                    <p className="text-[10px] font-semibold uppercase text-[#999]">Maria — Cleaner</p>
                    <p className="mt-1 text-xs text-[#666]">3 properties today, sorted by time. Turnover gap warning on Sunset Villa (2.5h — tight). Weather: 4°C, snow — packs extra floor cleaner.</p>
                  </div>
                  <div className="rounded-xl border border-[#e8e6e1] bg-white p-4">
                    <p className="text-[10px] font-semibold uppercase text-[#999]">Bjorn — Maintenance</p>
                    <p className="mt-1 text-xs text-[#666]">Jobs sorted by PTE: vacant properties first (go now), occupied waiting for PTE (go later).</p>
                  </div>
                  <div className="rounded-xl border border-[#e8e6e1] bg-white p-4">
                    <p className="text-[10px] font-semibold uppercase text-[#999]">Peter — Operator</p>
                    <p className="mt-1 text-xs text-[#666]">1 overnight issue (already assigned), clock-in status, 2 check-ins with readiness. Ten minutes, done.</p>
                  </div>
                </div>
              </div>

              {/* Inventory Auto-Deduction */}
              <div className="rounded-2xl border border-[#e8e6e1] bg-[#fafaf8] p-8">
                <div className="mb-4 inline-flex rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Only NestOps
                </div>
                <IconArchive className="mb-4 h-10 w-10 text-blue-500" />
                <h3 className="text-xl font-bold">Inventory Auto-Deduction</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#666]">
                  <strong className="text-[#1a1a1a]">Breezeway&apos;s #1 reviewer complaint, solved.</strong>
                </p>
                <div className="mt-6 space-y-3 text-sm text-[#666]">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-500">→</span>
                    <p>Maria finishes turnover. System auto-deducts 10 towels, 5 linen sets.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-500">→</span>
                    <p>She adds: &ldquo;3 extra towels — pet hair.&rdquo; Stock updated.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-500">→</span>
                    <p>Restock alert created. Vendor cart ready.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-500">→</span>
                    <p>AI drafts vendor email. Review, send. No spreadsheet.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 2 — Explain in 60 seconds */}
          <div className="mt-20">
            <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-[#999]">
              Explain in 60 seconds — differentiation drivers
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <IconUsers className="h-8 w-8 text-violet-500" />,
                  title: "Guest Experience Engine",
                  desc: "Conditional verification gates, AI-generated guidebooks from your Property Library, guest-initiated issue reporting with PTE — all in one.",
                  replaces: "Replaces SuiteOp ($60–150/mo) + Touchstay ($15–40/mo)",
                },
                {
                  icon: <IconBolt className="h-8 w-8 text-amber-500" />,
                  title: "Upsells + Staff Approval",
                  desc: "Guest buys early check-in. System checks calendar. Cleaner sees their real schedule impact before approving — not guesswork.",
                  replaces: "Nobody else connects upsells to field staff workload",
                },
                {
                  icon: <IconHome className="h-8 w-8 text-emerald-500" />,
                  title: "Property Library Flywheel",
                  desc: "Enter data once — door codes, WiFi, parking, fusebox. It feeds every task, guidebook, compliance check, and owner portal automatically.",
                  replaces: "No competitor uses property data as a foundation for everything",
                },
                {
                  icon: <IconChat className="h-8 w-8 text-blue-500" />,
                  title: "Vendor AI Ordering",
                  desc: "Restock alerts trigger vendor cart. AI drafts per-vendor emails. Review, send. Items move to 'Ordered.' Team notified on arrival.",
                  replaces: "Procurement in 3 clicks, not 30 emails",
                },
              ].map((feature, i) => (
                <div key={i} className="rounded-2xl border border-[#e8e6e1] bg-[#fafaf8] p-6 transition hover:border-[#ccc] hover:shadow-md">
                  {feature.icon}
                  <h3 className="mt-4 text-base font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#666]">{feature.desc}</p>
                  <p className="mt-4 text-[11px] font-medium text-emerald-600">{feature.replaces}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional features grid */}
          <div className="mt-16">
            <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-[#999]">
              Plus everything you&apos;d expect
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <IconClipboard className="h-5 w-5" />, label: "SOPs + Acknowledgement" },
                { icon: <IconShield className="h-5 w-5" />, label: "Compliance + Cert Tracking" },
                { icon: <IconCube className="h-5 w-5" />, label: "Cleaning Calendar" },
                { icon: <IconSparkles className="h-5 w-5" />, label: "AI Meeting Notes → Tasks" },
                { icon: <IconUsers className="h-5 w-5" />, label: "Contractor Self-Service" },
                { icon: <IconHome className="h-5 w-5" />, label: "Owner Portal + Payments" },
                { icon: <IconBolt className="h-5 w-5" />, label: "Workflow Automation" },
                { icon: <IconChat className="h-5 w-5" />, label: "Activity Thread per Task" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-[#e8e6e1] bg-white px-5 py-4">
                  <span className="text-[#999]">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ REPLACE YOUR TOOL STACK (NEW) ═══════════ */}
      <section id="compare" className="border-t border-[#e8e6e1] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#999]">Cost comparison</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              What you&apos;re paying vs. what you could be paying
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#666]">
              For a 10-property operator with 5 staff. These are real prices from competitor websites as of March 2026.
            </p>
          </div>

          {/* Tool stack table */}
          <div className="mt-14 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[#e8e6e1]">
                  <th className="pb-4 pr-4 text-xs font-semibold uppercase tracking-wider text-[#999]">Tool you&apos;re using</th>
                  <th className="pb-4 pr-4 text-xs font-semibold uppercase tracking-wider text-[#999]">What it does</th>
                  <th className="pb-4 pr-4 text-xs font-semibold uppercase tracking-wider text-[#999]">Monthly cost</th>
                  <th className="pb-4 text-xs font-semibold uppercase tracking-wider text-emerald-600">NestOps replaces with</th>
                </tr>
              </thead>
              <tbody>
                {toolStackData.map((row, i) => (
                  <tr key={i} className="border-b border-[#f0efe9]">
                    <td className="py-4 pr-4 font-medium">{row.tool}</td>
                    <td className="py-4 pr-4 text-[#666]">{row.does}</td>
                    <td className="py-4 pr-4">
                      <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                        {row.cost}
                      </span>
                    </td>
                    <td className="py-4 text-[#444]">{row.replacedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Savings callout */}
          <div className="mt-10 flex flex-col items-center justify-between gap-6 rounded-2xl border-2 border-[#1a1a1a] bg-[#1a1a1a] p-8 text-white md:flex-row md:p-10">
            <div>
              <p className="text-lg font-bold md:text-xl">Total you&apos;re paying today</p>
              <p className="mt-1 text-sm text-white/60">Plus 20–40 hours/month in WhatsApp coordination</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-white/60 line-through">$310–670/mo</p>
              <p className="text-3xl font-bold text-emerald-400 md:text-4xl">$49–149/mo</p>
              <p className="mt-1 text-sm text-white/60">with NestOps</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ COMPETITIVE MATRIX (NEW) ═══════════ */}
      <section className="border-t border-[#e8e6e1] bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#999]">Feature comparison</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              NestOps vs. everyone else
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#666]">
              Features verified from competitor websites, reviews, and product pages as of March 2026.
            </p>
          </div>

          <div className="mt-14 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[#e8e6e1]">
                  <th className="pb-4 pr-4 text-xs font-semibold uppercase tracking-wider text-[#999] min-w-[220px]">Feature</th>
                  <th className="pb-4 px-3 text-center text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] bg-emerald-50 rounded-t-lg min-w-[90px]">NestOps</th>
                  <th className="pb-4 px-3 text-center text-xs font-semibold uppercase tracking-wider text-[#999] min-w-[90px]">Breezeway</th>
                  <th className="pb-4 px-3 text-center text-xs font-semibold uppercase tracking-wider text-[#999] min-w-[90px]">SuiteOp</th>
                  <th className="pb-4 px-3 text-center text-xs font-semibold uppercase tracking-wider text-[#999] min-w-[90px]">Enso</th>
                  <th className="pb-4 px-3 text-center text-xs font-semibold uppercase tracking-wider text-[#999] min-w-[90px]">Touchstay</th>
                  <th className="pb-4 px-3 text-center text-xs font-semibold uppercase tracking-wider text-[#999] min-w-[100px]">Asana/Notion</th>
                </tr>
              </thead>
              <tbody>
                {competitiveFeatures.map((row, i) => (
                  <tr key={i} className="border-b border-[#f0efe9]">
                    <td className="py-3 pr-4 text-[#444] font-medium">{row.feature}</td>
                    {(["nestops", "breezeway", "suiteop", "enso", "touchstay", "generic"] as const).map((col) => (
                      <td key={col} className={`py-3 px-3 text-center ${col === "nestops" ? "bg-emerald-50/50" : ""}`}>
                        {row[col] === "full" ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <IconCheck className="w-3.5 h-3.5" />
                          </span>
                        ) : row[col] === "partial" ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <IconMinus className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f5f4f0] text-[#ccc]">
                            <IconX className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-center text-xs text-[#999]">
            ✅ = Has it &nbsp;·&nbsp; ⚠️ = Partial/limited &nbsp;·&nbsp; ❌ = Doesn&apos;t have it
          </p>

          {/* Scope disclaimer */}
          <div className="mt-10 rounded-xl border border-[#e8e6e1] bg-[#fafaf8] p-6">
            <p className="text-sm font-semibold">What NestOps intentionally doesn&apos;t do</p>
            <p className="mt-2 text-sm text-[#666] leading-relaxed">
              AI guest messaging (PMS territory), IoT/smart device management, and noise monitoring. These aren&apos;t weaknesses — they&apos;re scope boundaries. Your PMS handles bookings and guest messaging. NestOps handles everything operational. They complement each other.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="border-t border-[#e8e6e1] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#999]">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Up and running in a day
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#666]">
              No lengthy onboarding. No consultants. 30-minute property intake wizard.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Onboard Your Properties",
                desc: "12-step Airbnb-style intake wizard. Add properties, upload docs, configure compliance. Import from any existing system.",
              },
              {
                step: "02",
                title: "Set Up Your Team",
                desc: "Invite operators, owners, staff, inspectors, and guest services. Each role gets a tailored portal with exactly the right access.",
              },
              {
                step: "03",
                title: "Operations on Autopilot",
                desc: "Automations handle scheduling, alerts fire before deadlines, briefings assemble overnight. Your team executes with clarity.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#1a1a1a] text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-[#666] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ROLE-BASED PORTALS ═══════════ */}
      <section id="portals" className="border-t border-[#e8e6e1] bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#999]">Role-based portals</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              The right view for every role
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#666]">
              Five tailored portals ensure everyone sees exactly what they need — and nothing more. No more &ldquo;same access for everyone.&rdquo;
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[
              {
                abbr: "O",
                role: "Operator",
                color: "bg-[#1a1a1a] text-white",
                desc: "Full operational control",
                items: ["Portfolio-wide dashboard", "SOP library & assignment", "Team management", "Automation builder", "AI guidebook generation"],
              },
              {
                abbr: "O",
                role: "Owner",
                color: "bg-blue-600 text-white",
                desc: "Property owner transparency",
                items: ["Performance overview", "Approve maintenance", "View docs & reports", "Track billing", "Pay by Card / Invoice Later"],
              },
              {
                abbr: "S",
                role: "Staff",
                color: "bg-emerald-600 text-white",
                desc: "Mobile-first for field teams",
                items: ["Daily briefing + job queue", "SOP acknowledgement", "Photo uploads", "PTE-sorted tasks", "Shift scheduling"],
              },
              {
                abbr: "I",
                role: "Inspector",
                color: "bg-amber-600 text-white",
                desc: "Quality control built-in",
                items: ["Inspection queue", "Property intake forms", "Work order creation", "Photo evidence", "Defect tracking"],
              },
              {
                abbr: "G",
                role: "Guest Svc",
                color: "bg-violet-600 text-white",
                desc: "Guest-first coordination",
                items: ["Issue tracking + PTE", "Check-in coordination", "Guidebook management", "Urgency triage", "Maintenance follow-up"],
              },
            ].map((portal) => (
              <div key={portal.role} className="rounded-2xl border border-[#e8e6e1] bg-[#fafaf8] p-6">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${portal.color}`}>
                  {portal.abbr}
                </div>
                <h3 className="text-base font-bold">{portal.role} Portal</h3>
                <p className="mt-1 text-xs text-[#999]">{portal.desc}</p>
                <div className="mt-4 space-y-2">
                  {portal.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <IconCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span className="text-xs text-[#666]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="border-t border-[#e8e6e1] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#999]">Testimonials</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Loved by STR operators
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                text: "NestOps cut our onboarding time for new properties by 60%. The SOP system alone is worth it.",
                name: "Amanda R.",
                role: "STR Operator · 42 properties",
              },
              {
                text: "Finally a platform that gives our cleaning staff exactly what they need without drowning them in features.",
                name: "James T.",
                role: "Property Manager · 18 units",
              },
              {
                text: "The owner portal changed how we communicate with property owners. Complaints dropped immediately.",
                name: "Sofia M.",
                role: "Co-host Agency · 90 properties",
              },
            ].map((testimonial, i) => (
              <div key={i} className="rounded-2xl border border-[#e8e6e1] bg-white p-8">
                <IconQuote className="mb-4 text-[#e8e6e1]" />
                <p className="text-sm leading-relaxed text-[#444]">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8e6e1] text-xs font-bold text-[#666]">
                    {testimonial.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-[#999]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="pricing" className="border-t border-[#e8e6e1] bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#999]">Pricing</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#666]">
              14-day free trial on all plans. No credit card required.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
            {/* Starter */}
            <div className="rounded-2xl border border-[#e8e6e1] bg-[#fafaf8] p-8">
              <h3 className="text-lg font-bold">Starter</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-sm text-[#999]">/mo</span>
              </div>
              <p className="mt-2 text-sm text-[#666]">For independent hosts getting operations organized.</p>
              <Link href="/login" className="mt-6 block rounded-lg border border-[#e8e6e1] bg-white py-3 text-center text-sm font-semibold transition hover:border-[#ccc]">
                Start free trial
              </Link>
              <div className="mt-6 space-y-3">
                {["Up to 5 properties", "3 team members", "SOP library", "Task management", "Property Library", "Email support"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-sm text-[#666]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth — highlighted */}
            <div className="relative rounded-2xl border-2 border-[#1a1a1a] bg-white p-8 shadow-xl shadow-black/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1a1a1a] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Most Popular
              </div>
              <h3 className="text-lg font-bold">Growth</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold">$149</span>
                <span className="text-sm text-[#999]">/mo</span>
              </div>
              <p className="mt-2 text-sm text-[#666]">For scaling operators who need full team coordination.</p>
              <Link href="/login" className="mt-6 block rounded-lg bg-[#1a1a1a] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#333]">
                Start free trial
              </Link>
              <div className="mt-6 space-y-3">
                {[
                  "Up to 30 properties",
                  "Unlimited team members",
                  "All Starter features",
                  "PTE system",
                  "Daily briefing",
                  "Inventory + auto-deduction",
                  "Guest verification",
                  "Owner portal",
                  "AI features",
                  "Priority support",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-sm text-[#666]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-[#e8e6e1] bg-[#fafaf8] p-8">
              <h3 className="text-lg font-bold">Enterprise</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <p className="mt-2 text-sm text-[#666]">For large portfolios and co-host agencies.</p>
              <Link href="/login" className="mt-6 block rounded-lg border border-[#e8e6e1] bg-white py-3 text-center text-sm font-semibold transition hover:border-[#ccc]">
                Contact sales
              </Link>
              <div className="mt-6 space-y-3">
                {[
                  "Unlimited properties",
                  "Unlimited team members",
                  "All Growth features",
                  "Custom integrations",
                  "Dedicated onboarding",
                  "SLA guarantee",
                  "White-label option",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-sm text-[#666]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="border-t border-[#e8e6e1] py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to replace 5 tools with one?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#666]">
            Join operators who have eliminated spreadsheets, group chats, and $300–600/month in scattered tools.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#333]"
            >
              Get started free
              <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e8e6e1] bg-white px-8 py-3.5 text-sm font-semibold text-[#1a1a1a] shadow-sm transition hover:border-[#ccc]"
            >
              View demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-[#999]">No credit card · 14-day trial · Cancel anytime</p>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-[#e8e6e1] bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div className="max-w-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] text-sm font-bold text-white">N</div>
                <span className="text-lg font-semibold">NestOps</span>
              </div>
              <p className="mt-3 text-sm text-[#999] leading-relaxed">
                The operational layer for short-term rental professionals. Your PMS runs bookings. NestOps runs everything after.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#999]">Product</p>
                <div className="mt-3 flex flex-col gap-2">
                  <a href="#features" className="text-sm text-[#666] hover:text-[#1a1a1a]">Features</a>
                  <a href="#pricing" className="text-sm text-[#666] hover:text-[#1a1a1a]">Pricing</a>
                  <a href="#compare" className="text-sm text-[#666] hover:text-[#1a1a1a]">Compare</a>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#999]">Portals</p>
                <div className="mt-3 flex flex-col gap-2">
                  <Link href="/login" className="text-sm text-[#666] hover:text-[#1a1a1a]">Operator</Link>
                  <Link href="/login" className="text-sm text-[#666] hover:text-[#1a1a1a]">Owner</Link>
                  <Link href="/login" className="text-sm text-[#666] hover:text-[#1a1a1a]">Staff</Link>
                  <Link href="/login" className="text-sm text-[#666] hover:text-[#1a1a1a]">Vendor</Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#999]">Company</p>
                <div className="mt-3 flex flex-col gap-2">
                  <a href="#" className="text-sm text-[#666] hover:text-[#1a1a1a]">About</a>
                  <a href="#" className="text-sm text-[#666] hover:text-[#1a1a1a]">Blog</a>
                  <a href="#" className="text-sm text-[#666] hover:text-[#1a1a1a]">Contact</a>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#999]">Legal</p>
                <div className="mt-3 flex flex-col gap-2">
                  <a href="#" className="text-sm text-[#666] hover:text-[#1a1a1a]">Privacy</a>
                  <a href="#" className="text-sm text-[#666] hover:text-[#1a1a1a]">Terms</a>
                  <a href="#" className="text-sm text-[#666] hover:text-[#1a1a1a]">Security</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#e8e6e1] pt-8 md:flex-row">
            <p className="text-xs text-[#999]">NestOps © 2026 · Built for STR operators</p>
            <p className="text-xs text-[#999]">All systems operational</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
