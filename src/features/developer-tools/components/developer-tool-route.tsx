import type { ComponentType, LazyExoticComponent } from "react";
import type { DeveloperToolDefinition } from "@/features/developer-tools/catalog";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

type DeveloperToolRouteProps = {
  readonly Page: LazyExoticComponent<ComponentType>;
  readonly tool: DeveloperToolDefinition;
};

export function DeveloperToolRoute({ Page, tool }: DeveloperToolRouteProps) {
  useDocumentMeta({
    description: tool.document.description,
    keywords: [...tool.document.keywords],
    title: `${tool.document.title} | ${messages.developerTools.pageTitleSuffix}`,
  });

  return <Page />;
}
