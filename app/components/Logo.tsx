// Upcreate wordmark: a monogram "U" with an upward arrow cut through it,
// standing in for both the "up" in Upcreate and content moving up a
// funnel/calendar. Pure inline SVG (no external asset) so it themes with
// `currentColor` and the accent CSS variable, and never needs a separate
// favicon pipeline.
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M7 6v11a9 9 0 0 0 18 0V6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M16 23V5M16 5l-5 5M16 5l5 5"
        stroke="var(--accent, #e0a458)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
