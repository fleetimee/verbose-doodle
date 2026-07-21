import { JsonSchemaValidator } from "@/features/developer-tools/tools/json-schema-validator/components/json-schema-validator";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function JsonSchemaValidatorPage() {
  useDocumentMeta({
    title: messages.jsonSchemaValidator.pageTitle,
    description: messages.jsonSchemaValidator.pageDescription,
    keywords: [...messages.jsonSchemaValidator.pageKeywords],
  });

  return <JsonSchemaValidator />;
}
