"use client";

import { useState } from "react";
import { BrandConfig } from "@/lib/brand";
import { buildDoubleDownPrompt } from "@/lib/prompts";
import PromptRunner from "../components/PromptRunner";

type Post = { id: number; title: string; views: number; followers_at_post: number };

export default function DoubleDownClient({ brand, posts }: { brand: BrandConfig; posts: Post[] }) {
  const [postId, setPostId] = useState("");
  const [hook, setHook] = useState("");
  const [format, setFormat] = useState("");

  const selected = posts.find((p) => String(p.id) === postId);
  const topic = selected?.title || "";
  const prompt = buildDoubleDownPrompt(brand, { topic: topic || "(pick or type a topic)", hook, format });
  const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <select value={postId} onChange={(e) => setPostId(e.target.value)} className={inputClass}>
          <option value="">Pick a logged post (optional)…</option>
          {posts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title || `Post #${p.id}`}
            </option>
          ))}
        </select>
        <input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="Its hook (optional)" className={inputClass} />
        <input value={format} onChange={(e) => setFormat(e.target.value)} placeholder="Its format (optional)" className={inputClass} />
      </div>
      <PromptRunner prompt={prompt} label="Generate double-down variants" />
    </div>
  );
}
