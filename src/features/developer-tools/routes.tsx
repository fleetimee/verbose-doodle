import { type ComponentType, type LazyExoticComponent, lazy } from "react";
import { Route } from "react-router";
import {
  DEVELOPER_TOOLS,
  type DeveloperToolDefinition,
} from "@/features/developer-tools/catalog";
import { DeveloperToolRoute } from "@/features/developer-tools/components/developer-tool-route";

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

const DeveloperToolsPage = lazy(() =>
  import("@/pages/dashboard/developer-tools").then(
    ({ DeveloperToolsPage }) => ({ default: DeveloperToolsPage })
  )
);

export const developerToolRoutes = (
  <>
    <Route element={<DeveloperToolsPage />} path="developer-tools" />
    {DEVELOPER_TOOL_ROUTES.map(({ Page, path, tool }) => (
      <Route
        element={<DeveloperToolRoute Page={Page} tool={tool} />}
        key={tool.id}
        path={path}
      />
    ))}
  </>
);
