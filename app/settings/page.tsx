import { getMaskedAiSettings, AI_PROVIDERS, PROVIDER_LABELS, DEFAULT_MODELS } from "@/lib/ai-providers";
import { requireUserId } from "@/lib/auth";
import { Card, SectionHeader } from "../components/ui";
import SettingsClient, { RemoveKeyButton } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const settings = await getMaskedAiSettings(userId);

  return (
    <div>
      <SectionHeader
        num="12"
        title="Settings"
        description="Plug in any AI provider's API key -- every Generate button in the app (prompts, improver, bulk import classification) routes through whatever's configured here. Swap providers or rotate a key any time, no redeploy needed."
      />

      <Card className="mb-6">
        <h3 className="font-heading text-xl mb-2">How this works</h3>
        <p className="text-sm text-muted">
          Pick a provider, paste its API key, and optionally override the model. The key is stored server-side only
          and never sent back to your browser -- the field below shows just the last 4 characters once saved. Leaving
          the key field blank on a later save keeps whatever key is already stored (so you can change the model
          without re-pasting the key).
        </p>
      </Card>

      <Card>
        <h3 className="font-heading text-xl mb-4">AI provider connection</h3>
        <SettingsClient settings={settings} providers={AI_PROVIDERS} labels={PROVIDER_LABELS} defaultModels={DEFAULT_MODELS} />
        <RemoveKeyButton hasKey={settings.hasKey} />
      </Card>
    </div>
  );
}
