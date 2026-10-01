"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/auth-actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="text-xs text-muted block mb-1">Email</label>
        <input
          type="email"
          name="email"
          autoFocus
          required
          className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5"
        />
      </div>
      <div>
        <label className="text-xs text-muted block mb-1">Password</label>
        <input
          type="password"
          name="password"
          required
          className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5"
        />
      </div>
      {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2.5 disabled:opacity-60">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
