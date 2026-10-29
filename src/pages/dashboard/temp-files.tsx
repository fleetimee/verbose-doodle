import { TempFilesWorkspace } from "@/features/temp-files/temp-files-workspace";

import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function TempFilesPage() {
  useDocumentMeta({
    title: messages.tempFiles.title,
    description: messages.tempFiles.description,
    keywords: messages.tempFiles.keywords,
  });
  return <TempFilesWorkspace />;
}
