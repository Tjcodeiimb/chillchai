import { getBrand } from "@/lib/brand";
import { PROFILE_RIGHT_WRONG } from "@/lib/reference";
import { Card, SectionHeader } from "../components/ui";
import BrandForm from "./BrandForm";

export default function BrandPage() {
  const brand = getBrand();

  return (
    <div>
      <SectionHeader
        num="01"
        title="Brand Foundation"
        description="The house analogy: foundation (niche), interior (content strategy), exterior (branding). Everything downstream reads from this."
      />

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="font-heading text-xl mb-3">Visual identity (exterior)</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(brand.colors).map(([name, hex]) => (
              <div key={name} className="text-center">
                <div className="w-12 h-12 rounded-lg border border-border/20" style={{ background: hex }} />
                <div className="text-[10px] text-muted mt-1">{name}</div>
                <div className="text-[10px] text-muted">{hex}</div>
              </div>
            ))}
          </div>
          <p className="text-sm">
            <span className="text-muted">Heading font:</span> {brand.fonts.heading} &nbsp;·&nbsp;
            <span className="text-muted">Body font:</span> {brand.fonts.body}
          </p>
          <p className="text-sm mt-2">
            <span className="text-muted">Visual assets:</span> {brand.assetTypes.join(", ")}
          </p>
        </Card>

        <Card>
          <h3 className="font-heading text-xl mb-3">Profile mechanics — right vs wrong</h3>
          <ul className="space-y-2 text-sm">
            {PROFILE_RIGHT_WRONG.map((r) => (
              <li key={r.field} className="border-b border-border/10 pb-2 last:border-0">
                <div className="font-medium">{r.field}</div>
                <div className="text-red-400/80">✗ {r.wrong}</div>
                <div className="text-accent">✓ {r.right}</div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted mt-3">
            Your bio link should be one single destination: <span className="text-foreground">{brand.bioLink}</span>. Name field: <span className="text-foreground">{brand.nameField}</span>
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="font-heading text-xl mb-4">Edit brand config</h3>
        <BrandForm brand={brand} />
      </Card>
    </div>
  );
}
