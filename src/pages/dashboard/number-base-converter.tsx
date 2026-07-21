import { NumberBaseConverter } from "@/features/developer-tools/tools/number-base-converter/components/number-base-converter";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function NumberBaseConverterPage() {
  useDocumentMeta({
    title: messages.numberBaseConverter.pageTitle,
    description: messages.numberBaseConverter.pageDescription,
    keywords: [...messages.numberBaseConverter.pageKeywords],
  });

  return <NumberBaseConverter />;
}
