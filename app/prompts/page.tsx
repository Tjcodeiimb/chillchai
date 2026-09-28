import { getBrand } from "@/lib/brand";
import { SectionHeader } from "../components/ui";
import PromptsClient from "./PromptsClient";

export default async function PromptsPage() {
  const brand = await getBrand();
  const hasKey = !!process.env.GEMINI_API_KEY;

  return (
    <div>
      <SectionHeader
        num="08"
        title="Master Prompt Library"
        description="Every prompt from your playbook, pre-filled with your real brand context. Run it here, or export the whole thing to Word."
      />
      <PromptsClient brand={brand} hasKey={hasKey} />
    </div>
  );
}
