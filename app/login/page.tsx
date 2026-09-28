import { isAuthConfigured } from "@/lib/auth";
import { loginAction } from "@/lib/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = isAuthConfigured();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-border/15 bg-card/60 p-8">
        <div className="font-heading text-3xl mb-1">Upforge</div>
        <p className="text-sm text-muted mb-6">content os</p>

        {!configured ? (
          <p className="text-sm text-muted">
            No <code>APP_PASSWORD</code> is set, so the app is open with no login required.
            Set <code>APP_PASSWORD</code> in your environment to require a password here before
            deploying this somewhere public.
          </p>
        ) : (
          <form action={loginAction} className="space-y-3">
            <div>
              <label className="text-xs text-muted block mb-1">Password</label>
              <input
                type="password"
                name="password"
                autoFocus
                required
                className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5"
              />
            </div>
            {error && <p className="text-xs text-red-400">Wrong password — try again.</p>}
            <button className="w-full rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2.5">
              Enter
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
