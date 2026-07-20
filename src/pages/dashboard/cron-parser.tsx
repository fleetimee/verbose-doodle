import { CronParser } from "@/features/cron-parser/components/cron-parser";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function CronParserPage() {
  useDocumentMeta({
    title: messages.cronParser.pageTitle,
    description: messages.cronParser.pageDescription,
    keywords: [...messages.cronParser.pageKeywords],
  });

  return <CronParser />;
}
