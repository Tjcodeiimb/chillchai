import { requireUserId } from "@/lib/auth";
import { getBrand } from "@/lib/brand";
import { redirect } from "next/navigation";
import { completeOnboardingAction, skipOnboardingAction } from "@/lib/onboarding-actions";
import Logo from "../components/Logo";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const userId = await requireUserId();
  const brand = await getBrand(userId);
  if (brand.onboardingComplete) redirect("/");

  return (
    <div className="min-h-[85vh] flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-border/15 bg-card/60 p-8">
        <div className="flex items-center gap-3 mb-1">
          <Logo size={30} />
          <div className="font-heading text-3xl">Welcome to Upcreate</div>
        </div>
        <p className="text-sm text-muted mb-6">
          A couple quick questions so every generator and prompt in here is tuned to your brand. Takes under a
          minute -- you can change all of this later in Brand Foundation, or skip it entirely.
        </p>

        <form action={completeOnboardingAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">Instagram handle</label>
              <input name="handle" required className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5" placeholder="yourhandle" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Display name / tagline</label>
              <input name="nameField" required className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5" placeholder="Jane | Marketing Coach" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Niche</label>
            <input name="niche" required className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5" placeholder="e.g. Market Entry & Business Consulting" />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Sub-niches / topics (comma separated)</label>
            <input name="subniches" className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5" placeholder="Pricing, Client onboarding, Founder lessons" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">Occupation / title</label>
              <input name="occupation" className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5" placeholder="Founder & CEO, Acme Co." />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Bio link / CTA destination</label>
              <input name="bioLink" className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5" placeholder="Link in bio" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Founder story (a paragraph or two)</label>
            <textarea name="founderStory" rows={3} className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5" placeholder="How you got into this, what makes your perspective different..." />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">Current followers</label>
              <input name="followerCount" type="number" defaultValue={0} className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Account status</label>
              <select name="accountStatus" className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5">
                <option value="new">New</option>
                <option value="established">Established</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Posts per week</label>
              <select name="timesPerWeek" className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5">
                <option value="1-2">1-2</option>
                <option value="3-4">3-4</option>
                <option value="5+">5+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Content mix: Authority vs. Journey ({"%"} authority)</label>
            <input name="pillarAuthority" type="range" min={0} max={100} defaultValue={70} className="w-full" />
          </div>

          <div className="pt-2">
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-5 py-2.5">
              Save and continue
            </button>
          </div>
        </form>
        <form action={skipOnboardingAction} className="mt-3">
          <button className="text-sm text-muted underline">Skip for now</button>
        </form>
      </div>
    </div>
  );
}
