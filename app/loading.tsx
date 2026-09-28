export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-foreground/10" />
        <div className="h-10 w-72 rounded bg-foreground/10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 rounded-2xl border border-border/15 bg-card/40" />
        ))}
      </div>
      <div className="h-64 rounded-2xl border border-border/15 bg-card/40" />
    </div>
  );
}
