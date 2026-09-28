"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth-actions";

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
];

export default function Nav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="w-64 shrink-0 border-r border-border/20 bg-card/40 px-5 py-8 hidden md:flex md:flex-col gap-1 sticky top-0 h-screen overflow-y-auto">
      <div className="mb-8 px-1">
        <div className="font-heading text-3xl leading-none">Upforge</div>
        <div className="text-xs text-muted mt-1">content os</div>
      </div>
      {SECTIONS.map((s) => {
        const active = pathname === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-accent text-accent-deep font-medium"
                : "text-foreground/80 hover:bg-foreground/5"
            }`}
          >
            <span className="text-[10px] text-muted tabular-nums">{s.num}</span>
            {s.label}
          </Link>
        );
      })}
      <form action={logoutAction} className="mt-auto pt-4">
        <button className="text-xs text-muted hover:text-foreground px-3">Log out</button>
      </form>
    </nav>
  );
}
