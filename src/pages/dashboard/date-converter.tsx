import { DateConverter } from "@/features/developer-tools/tools/date-converter/components/date-converter";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function DateConverterPage() {
  useDocumentMeta({
    title: messages.dateConverter.pageTitle,
    description: messages.dateConverter.pageDescription,
    keywords: [...messages.dateConverter.pageKeywords],
  });

  return <DateConverter />;
}
