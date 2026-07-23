import type { ComponentType, LazyExoticComponent } from "react";
import type { DeveloperToolDefinition } from "@/features/developer-tools/catalog";
import { useDocumentMeta } from "@/hooks/use-document-meta";

type DeveloperToolRouteProps = {
  readonly Page: LazyExoticComponent<ComponentType>;
  readonly tool: DeveloperToolDefinition;
};

export function DeveloperToolRoute({ Page, tool }: DeveloperToolRouteProps) {
  useDocumentMeta({
    title: tool.document.title,
    description: tool.document.description,
    keywords: [...tool.document.keywords],
  });

  return <Page />;
}
