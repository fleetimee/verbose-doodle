import { Navigate } from "react-router";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function SocketTesterPage() {
  useDocumentMeta({
    title: "SocketTest | BPDDIY DevTools",
    description:
      "TCP and UDP socket testing suite powered by the backend WebSocket bridge.",
    keywords: ["socket tester", "tcp", "udp", "websocket", "developer tools"],
  });

  return <Navigate replace to="/dashboard/socket-test/tcp-client" />;
}
