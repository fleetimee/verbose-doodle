import { lazy } from "react";
import { Route } from "react-router";

const EndpointsPage = lazy(() =>
  import("@/pages/dashboard/endpoints").then(({ EndpointsPage }) => ({
    default: EndpointsPage,
  }))
);
const EndpointDetailPage = lazy(() =>
  import("@/pages/dashboard/endpoint-detail").then(
    ({ EndpointDetailPage }) => ({
      default: EndpointDetailPage,
    })
  )
);

export const endpointRoutes = (
  <>
    <Route element={<EndpointsPage />} path="endpoints" />
    <Route element={<EndpointDetailPage />} path="endpoints/:slug" />
  </>
);
