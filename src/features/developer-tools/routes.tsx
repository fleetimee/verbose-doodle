import { type ComponentType, type LazyExoticComponent, lazy } from "react";
import {
  DEVELOPER_TOOLS,
  type DeveloperToolDefinition,
} from "@/features/developer-tools/catalog";

export type DeveloperToolRouteDefinition = {
  readonly Page: LazyExoticComponent<ComponentType>;
  readonly path: string;
  readonly tool: DeveloperToolDefinition;
};

export const DEVELOPER_TOOL_ROUTES: readonly DeveloperToolRouteDefinition[] =
  DEVELOPER_TOOLS.map((tool) => ({
    Page: lazy(tool.load),
    path: tool.path,
    tool,
  }));
