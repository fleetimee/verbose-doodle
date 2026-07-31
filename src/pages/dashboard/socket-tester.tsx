import { Navigate } from "react-router";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function SocketTesterPage() {
  useDocumentMeta({
    description:
      "TCP and UDP socket testing suite powered by the backend WebSocket bridge.",
    keywords: ["socket tester", "tcp", "udp", "websocket", "developer tools"],
    title: "SocketTest | BPDDIY DevTools",
  });

  return <Navigate replace to="/dashboard/socket-test/tcp-client" />;
}
