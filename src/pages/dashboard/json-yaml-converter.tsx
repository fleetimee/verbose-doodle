import { JsonYamlConverter } from "@/features/json-yaml-converter/components/json-yaml-converter";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function JsonYamlConverterPage() {
  useDocumentMeta({
    title: messages.jsonYamlConverter.pageTitle,
    description: messages.jsonYamlConverter.pageDescription,
    keywords: [...messages.jsonYamlConverter.pageKeywords],
  });

  return <JsonYamlConverter />;
}
