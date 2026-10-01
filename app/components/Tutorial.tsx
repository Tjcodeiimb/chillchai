"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "upcreate_tutorial_dismissed";

const STEPS = [
  {
    title: "Welcome to Upcreate",
    body: "This is your content operating system: research, hooks, scripts, a calendar, and prompts, all tuned to your brand. This quick tour covers the main stops -- skip any time.",
  },
  {
    title: "Brand Foundation",
    body: "Everything else pulls from here: your niche, voice, and content ratios. Update it any time your positioning shifts.",
  },
  {
    title: "Research & Hook Lab",
    body: "Log outliers you find in the wild, then turn the best ones into hook stacks you can reuse across scripts.",
  },
  {
    title: "Script Studio & Library",
    body: "Generate scripts with AI-assisted prompts, or bulk-import ones you already wrote -- they're auto-classified into the same filters as everything else.",
  },
  {
    title: "Calendar & Production",
    body: "Schedule scripts to dates, then move through the Production Planner to shoot-ready shot lists.",
  },
  {
    title: "Settings",
    body: "Plug in any AI provider -- Gemini, OpenAI, Anthropic, or a custom endpoint -- with your own API key. Nothing works without a key connected here.",
  },
];

const SKIP_ROUTES = ["/login", "/signup", "/onboarding"];

export default function Tutorial() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const skip = SKIP_ROUTES.includes(pathname);

  useEffect(() => {
    if (skip) return;
    const timer = setTimeout(() => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
      } catch {
        // Private browsing / blocked storage -- just skip the tutorial rather
        // than showing it every load with no way to dismiss it permanently.
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [skip]);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Nothing we can do if storage is blocked -- the tutorial just won't
      // remember it was dismissed next load.
    }
  }

  if (!open) return null;

  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/15 bg-card p-6">
        <div className="text-xs text-muted tracking-widest uppercase mb-2">
          {step + 1} / {STEPS.length}
        </div>
        <h2 className="font-heading text-2xl mb-2">{STEPS[step].title}</h2>
        <p className="text-sm text-muted mb-6">{STEPS[step].body}</p>
        <div className="flex items-center justify-between">
          <button onClick={dismiss} className="text-sm text-muted underline">
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-full border border-border/20 text-sm px-4 py-2"
              >
                Back
              </button>
            )}
            <button
              onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
              className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2"
            >
              {isLast ? "Get started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
