import { sql } from "@/lib/db";
import { getBrand } from "@/lib/brand";
import { requireUserId } from "@/lib/auth";
import { SectionHeader } from "../components/ui";
import CarouselsClient from "./CarouselsClient";

export const dynamic = "force-dynamic";

export default async function CarouselsPage() {
  const userId = await requireUserId();
  const [brand, carousels] = await Promise.all([
    getBrand(userId),
    sql`SELECT id, title, archetype, status, slide_count FROM carousels WHERE user_id = ${userId} ORDER BY created_at DESC`,
  ]);

  return (
    <div>
      <SectionHeader
        num="12"
        title="Carousel Studio"
        description="Multi-slide swipe posts: fill-in-the-blank archetypes, a hook-pattern library, and a growing carousel bank -- same discipline as Script Studio."
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <CarouselsClient brand={brand} carousels={carousels as any} />
    </div>
  );
}
