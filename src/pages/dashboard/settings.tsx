import { SettingsWorkspace } from "@/features/settings/components/settings-workspace";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function SettingsPage() {
  useDocumentMeta({
    title: messages.theme.settings.documentTitle,
    description: messages.theme.settings.documentDescription,
    keywords: [
      "settings",
      "color scheme",
      "theme",
      "appearance",
      "palette",
      "language",
    ],
  });

  return <SettingsWorkspace />;
}
