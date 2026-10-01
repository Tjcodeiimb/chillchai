"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth-actions";
import Logo from "./Logo";

const SECTIONS = [
  { href: "/", label: "Dashboard", num: "00" },
  { href: "/brand", label: "Brand Foundation", num: "01" },
  { href: "/calendar", label: "Calendar & Batching", num: "02" },
  { href: "/research", label: "Outlier Research", num: "03" },
  { href: "/hooks", label: "Hook Lab", num: "04" },
  { href: "/scripts", label: "Script Studio", num: "05" },
  { href: "/production", label: "Production Planner", num: "06" },
  { href: "/funnel", label: "CTA & Funnel Mapper", num: "07" },
  { href: "/prompts", label: "Master Prompt Library", num: "08" },
  { href: "/analytics", label: "Analytics & Levels", num: "09" },
  { href: "/library", label: "Script Library", num: "10" },
  { href: "/improve", label: "Script Improver", num: "11" },
  { href: "/settings", label: "Settings", num: "12" },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {SECTIONS.map((s) => {
        const active = pathname === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-accent text-accent-deep font-medium"
                : "text-foreground/80 hover:bg-foreground/10 hover:text-foreground"
            }`}
          >
            <span className="text-[10px] text-muted tabular-nums">{s.num}</span>
            {s.label}
          </Link>
        );
      })}
    </>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") return null;

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border/15 bg-background/95 backdrop-blur px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-heading text-xl leading-none">
          <Logo size={22} />
          Upcreate
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg border border-border/20 p-2 text-foreground"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <line x1="1" y1="4" x2="17" y2="4" />
            <line x1="1" y1="9" x2="17" y2="9" />
            <line x1="1" y1="14" x2="17" y2="14" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-card border-l border-border/20 px-5 py-6 flex flex-col gap-1 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Logo size={26} />
                <div>
                  <div className="font-heading text-2xl leading-none">Upcreate</div>
                  <div className="text-xs text-muted mt-1">content os</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-muted text-2xl leading-none px-2">
                ×
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <form action={logoutAction} className="mt-auto pt-4">
              <button className="text-xs text-muted hover:text-foreground px-3">Log out</button>
            </form>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <nav className="w-64 shrink-0 border-r border-border/20 bg-card/40 px-5 py-8 hidden md:flex md:flex-col gap-1 sticky top-0 h-screen overflow-y-auto">
        <div className="mb-8 px-1 flex items-center gap-3">
          <Logo size={32} />
          <div>
            <div className="font-heading text-3xl leading-none">Upcreate</div>
            <div className="text-xs text-muted mt-1">content os</div>
          </div>
        </div>
        <NavLinks pathname={pathname} />
        <form action={logoutAction} className="mt-auto pt-4">
          <button className="text-xs text-muted hover:text-foreground px-3">Log out</button>
        </form>
      </nav>
    </>
  );
}
