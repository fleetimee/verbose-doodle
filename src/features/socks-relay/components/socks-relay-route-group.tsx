import { Outlet } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";
import { ForbiddenPage } from "@/features/socks-relay/components/forbidden-page";
import { SocksRelayProvider } from "@/features/socks-relay/context/socks-relay-context";

export function SocksRelayRouteGroup() {
  return (
    <ProtectedRoute fallback={<ForbiddenPage />} requiredRole="ADMIN">
      <SocksRelayProvider>
        <Outlet />
      </SocksRelayProvider>
    </ProtectedRoute>
  );
}
