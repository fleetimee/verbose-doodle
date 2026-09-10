import { lazy } from "react";
import { Route } from "react-router";

const SocketTesterPage = lazy(() =>
  import("@/pages/dashboard/socket-tester").then(({ SocketTesterPage }) => ({
    default: SocketTesterPage,
  }))
);
const TcpClientPage = lazy(() =>
  import("@/pages/dashboard/tcp-client").then(({ TcpClientPage }) => ({
    default: TcpClientPage,
  }))
);
const TcpServerPage = lazy(() =>
  import("@/pages/dashboard/tcp-server").then(({ TcpServerPage }) => ({
    default: TcpServerPage,
  }))
);
const UdpPage = lazy(() =>
  import("@/pages/dashboard/udp").then(({ UdpPage }) => ({
    default: UdpPage,
  }))
);

export const socketTesterRoutes = (
  <>
    <Route element={<SocketTesterPage />} path="socket-tester" />
    <Route element={<TcpClientPage />} path="socket-test/tcp-client" />
    <Route element={<TcpServerPage />} path="socket-test/tcp-server" />
    <Route element={<UdpPage />} path="socket-test/udp" />
  </>
);
