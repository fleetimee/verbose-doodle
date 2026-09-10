import { lazy } from "react";
import { Navigate, Route } from "react-router";
import { SocksRelayRouteGroup } from "@/features/socks-relay/components/socks-relay-route-group";

const SocksRelayRestApiPage = lazy(() =>
  import("@/pages/dashboard/socks-relay-rest-api").then(
    ({ SocksRelayRestApiPage }) => ({
      default: SocksRelayRestApiPage,
    })
  )
);
const SocksRelayIso8583Page = lazy(() =>
  import("@/pages/dashboard/socks-relay-iso-8583").then(
    ({ SocksRelayIso8583Page }) => ({
      default: SocksRelayIso8583Page,
    })
  )
);

export const socksRelayRoutes = (
  <Route element={<SocksRelayRouteGroup />} path="socks-relay">
    <Route
      element={<Navigate replace to="/dashboard/socks-relay/rest-api" />}
      index
    />
    <Route element={<SocksRelayRestApiPage />} path="rest-api" />
    <Route element={<SocksRelayIso8583Page />} path="iso-8583" />
  </Route>
);
