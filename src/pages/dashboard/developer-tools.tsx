import { DeveloperToolsCatalog } from "@/features/developer-tools/components/developer-tools-catalog";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function DeveloperToolsPage() {
  useDocumentMeta({
    title: messages.developerTools.documentTitle,
    description: messages.developerTools.documentDescription,
    keywords: [
      "developer tools",
      "json",
      "yaml",
      "cron",
      "validation",
      "conversion",
      "scheduling",
    ],
  });

  return <DeveloperToolsCatalog />;
}
