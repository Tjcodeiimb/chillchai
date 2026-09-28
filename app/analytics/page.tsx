import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { createOwnPost, deleteOwnPost } from "@/lib/actions";
import { Card, SectionHeader, Badge, DeleteForm } from "../components/ui";
import DoubleDownClient from "./DoubleDownClient";

type Post = {
  id: number;
  title: string;
  posted_date: string;
  views: number;
  followers_at_post: number;
  pillar: string;
  notes: string;
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [brand, posts] = await Promise.all([
    getBrand(),
    sql<Post[]>`SELECT * FROM own_posts ORDER BY posted_date DESC`,
  ]);

  const withMultiple = posts.map((p) => ({
    ...p,
    multiple: p.followers_at_post > 0 ? p.views / p.followers_at_post : 0,
  }));
  const top5 = [...withMultiple].sort((a, b) => b.views - a.views).slice(0, 5);
  const bottom5 = [...withMultiple].sort((a, b) => a.views - b.views).slice(0, 5);

  const inputClass = "w-full rounded-lg border border-border/15 bg-foreground/95 text-background text-sm p-2.5";

  return (
    <div>
      <SectionHeader num="09" title="Analytics & Level Tracker" description="Track what actually worked, and double down on it deliberately." />

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-4">Log a posted video</h3>
        <form action={createOwnPost} className="grid md:grid-cols-3 gap-3">
          <input name="title" placeholder="Title / topic" className={`${inputClass} md:col-span-2`} />
          <input required type="date" name="posted_date" className={inputClass} />
          <input type="number" name="views" placeholder="Views" className={inputClass} />
          <input type="number" name="followers_at_post" placeholder="Followers at time of post" className={inputClass} />
          <select name="pillar" className={inputClass} defaultValue="authority">
            <option value="authority">Authority</option>
            <option value="journey">Journey</option>
          </select>
          <input name="notes" placeholder="Notes" className={`${inputClass} md:col-span-3`} />
          <div className="md:col-span-3">
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">Log post</button>
          </div>
        </form>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <h3 className="font-heading text-xl mb-3">Top 5 by views</h3>
          {top5.length === 0 ? (
            <p className="text-sm text-muted">No posts logged yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {top5.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{p.title || `Post #${p.id}`}</span>
                  <span className="flex gap-2">
                    <Badge>{p.views.toLocaleString()} views</Badge>
                    {p.multiple >= 5 && <Badge tone="accent">{p.multiple.toFixed(1)}x</Badge>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="font-heading text-xl mb-3">Bottom 5 by views</h3>
          {bottom5.length === 0 ? (
            <p className="text-sm text-muted">No posts logged yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {bottom5.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{p.title || `Post #${p.id}`}</span>
                  <Badge>{p.views.toLocaleString()} views</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mb-8">
        <h3 className="font-heading text-xl mb-3">Double-down generator</h3>
        <p className="text-xs text-muted mb-3">Pick a post that outperformed your average and get 3 remix variants (A/B/C).</p>
        <DoubleDownClient brand={brand} posts={posts.map((p) => ({ id: p.id, title: p.title, views: p.views, followers_at_post: p.followers_at_post }))} />
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-4">All logged posts ({posts.length})</h3>
        {posts.length === 0 ? (
          <p className="text-sm text-muted">Nothing logged yet.</p>
        ) : (
          <div className="space-y-2">
            {withMultiple.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-border/10 p-3 text-sm">
                <span>
                  <span className="text-muted mr-3">{p.posted_date}</span>
                  {p.title || `Post #${p.id}`}
                </span>
                <span className="flex items-center gap-2">
                  <Badge>{p.views.toLocaleString()} views</Badge>
                  {p.multiple >= 5 && <Badge tone="accent">{p.multiple.toFixed(1)}x outlier</Badge>}
                  <DeleteForm action={deleteOwnPost} id={p.id} />
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
