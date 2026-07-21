import { JwtInspector } from "@/features/developer-tools/tools/jwt-inspector/components/jwt-inspector";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function JwtInspectorPage() {
  useDocumentMeta({
    title: messages.jwtInspector.pageTitle,
    description: messages.jwtInspector.pageDescription,
    keywords: [...messages.jwtInspector.pageKeywords],
  });

  return <JwtInspector />;
}
