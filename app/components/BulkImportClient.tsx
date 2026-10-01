"use client";

import { useActionState } from "react";
import { bulkImportScriptsAction, type BulkImportResult } from "@/lib/bulk-import-actions";

const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";

export default function BulkImportClient() {
  const [result, formAction, pending] = useActionState<BulkImportResult | null, FormData>(
    bulkImportScriptsAction,
    null
  );

  return (
    <div>
      <p className="text-sm text-muted mb-3">
        Paste multiple scripts at once, each one separated by a line containing just <code>---</code>. Every script
        is automatically classified (pillar, content type, angle, format, CTA, funnel stage, effort, topic) using
        whatever AI provider is connected in{" "}
        <a href="/settings" className="text-accent underline">
          Settings
        </a>
        , then saved straight into the Script Library. Without a provider connected, scripts still import with
        sensible defaults you can refine afterward.
      </p>
      <form action={formAction}>
        <textarea
          name="raw"
          rows={8}
          placeholder={"First script's full text here...\n\n---\n\nSecond script's full text here..."}
          className={`${inputClass} font-mono mb-3`}
          required
        />
        <button
          disabled={pending}
          className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2 disabled:opacity-60"
        >
          {pending ? "Classifying & importing…" : "Bulk import scripts"}
        </button>
      </form>
      {result && (
        <p className="text-xs text-muted mt-3">
          Imported {result.imported} script{result.imported === 1 ? "" : "s"}
          {result.skipped > 0 ? ` -- ${result.skipped} skipped (50-script limit per batch, paste the rest separately)` : ""}.
        </p>
      )}
    </div>
  );
}
