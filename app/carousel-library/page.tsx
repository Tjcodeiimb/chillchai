import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { SectionHeader, Badge, Card } from "../components/ui";
import CarouselLibraryClient from "./CarouselLibraryClient";
import {
  isCarouselBatch1Seeded,
  isCarouselBatch2Seeded,
  isCarouselBatch3Seeded,
  seedCarouselBatch1Action,
  seedCarouselBatch2Action,
  seedCarouselBatch3Action,
} from "@/lib/carousel-actions";
import { CAROUSEL_BATCH_1 } from "@/lib/seed-data/carouselBatch1";
import { CAROUSEL_BATCH_2 } from "@/lib/seed-data/carouselBatch2";
import { CAROUSEL_BATCH_3 } from "@/lib/seed-data/carouselBatch3";

export type LibraryCarousel = {
  id: number;
  title: string;
  pillar: string;
  content_type: string;
  archetype: string;
  cta_type: string;
  funnel_stage: string;
  status: string;
  topic_tag: string;
  segment: string;
  slide_count: number;
  background_style: string;
  background_category: string;
  design_notes: string;
};

export const dynamic = "force-dynamic";

export default async function CarouselLibraryPage() {
  const userId = await requireUserId();
  const [carousels, batch1Seeded, batch2Seeded, batch3Seeded] = await Promise.all([
    sql<LibraryCarousel[]>`
      SELECT id, title, pillar, content_type, archetype, cta_type, funnel_stage, status, topic_tag, segment,
             slide_count, background_style, background_category, design_notes
      FROM carousels WHERE user_id = ${userId} ORDER BY created_at DESC
    `,
    isCarouselBatch1Seeded(),
    isCarouselBatch2Seeded(),
    isCarouselBatch3Seeded(),
  ]);

  return (
    <div>
      <SectionHeader
        num="13"
        title="Carousel Library"
        description="Every carousel from every batch, in one place -- filter by archetype, funnel stage, topic, and background style."
      />

      {(CAROUSEL_BATCH_1.length > 0 || CAROUSEL_BATCH_2.length > 0 || CAROUSEL_BATCH_3.length > 0) && (
        <Card className="mb-6">
          <h3 className="font-heading text-lg mb-3">Test content batches</h3>
          <div className="flex flex-wrap gap-3">
            {CAROUSEL_BATCH_1.length > 0 &&
              (batch1Seeded ? (
                <Badge tone="accent">Batch 1 imported ({CAROUSEL_BATCH_1.length})</Badge>
              ) : (
                <form action={seedCarouselBatch1Action}>
                  <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
                    Import batch 1 ({CAROUSEL_BATCH_1.length} carousels)
                  </button>
                </form>
              ))}
            {CAROUSEL_BATCH_2.length > 0 &&
              (batch2Seeded ? (
                <Badge tone="accent">Batch 2 imported ({CAROUSEL_BATCH_2.length})</Badge>
              ) : (
                <form action={seedCarouselBatch2Action}>
                  <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
                    Import batch 2 ({CAROUSEL_BATCH_2.length} carousels)
                  </button>
                </form>
              ))}
            {CAROUSEL_BATCH_3.length > 0 &&
              (batch3Seeded ? (
                <Badge tone="accent">Batch 3 imported ({CAROUSEL_BATCH_3.length})</Badge>
              ) : (
                <form action={seedCarouselBatch3Action}>
                  <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
                    Import batch 3 ({CAROUSEL_BATCH_3.length} carousels)
                  </button>
                </form>
              ))}
          </div>
        </Card>
      )}

      {carousels.length === 0 ? (
        <p className="text-sm text-muted">
          No carousels yet -- generate one in{" "}
          <a href="/carousels" className="text-accent underline">
            Carousel Studio
          </a>
          .
        </p>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <Badge tone="accent">{carousels.length} carousels total</Badge>
          </div>
          <CarouselLibraryClient carousels={carousels} />
        </>
      )}
    </div>
  );
}
