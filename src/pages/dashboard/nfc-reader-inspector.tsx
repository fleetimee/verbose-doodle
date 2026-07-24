import { NfcReaderInspector } from "@/features/developer-tools/tools/nfc-reader-inspector/components/nfc-reader-inspector";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function NfcReaderInspectorPage() {
  useDocumentMeta({
    description: messages.developerTools.nfcReaderDocumentDescription,
    keywords: [...messages.developerTools.nfcReaderDocumentKeywords],
    title: messages.developerTools.nfcReaderDocumentTitle,
  });

  return <NfcReaderInspector />;
}
