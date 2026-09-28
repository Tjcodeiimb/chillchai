"use client";

import { useState } from "react";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

export default function FolderNamer() {
  const [date, setDate] = useState("");
  const [topic, setTopic] = useState("");
  const [copied, setCopied] = useState(false);

  const folder = `${date || "YYYY-MM-DD"}_${topic ? slugify(topic) : "topic-slug"}`;

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5" />
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Video topic" className="w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5" />
      </div>
      <div className="flex items-center gap-3">
        <code className="rounded-lg bg-background/40 border border-border/15 px-3 py-2 text-sm">{folder}/</code>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(folder).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs rounded-full border border-border/20 px-2.5 py-1 hover:bg-foreground/5"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-muted mt-2">Create this as the batch subfolder, upload raw clips into it immediately after filming.</p>
    </div>
  );
}
