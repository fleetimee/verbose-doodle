import { SocketTesterLayout } from "@/features/socket-tester/components/socket-tester-layout";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function TcpServerPage() {
  useDocumentMeta({
    title: "TCP Server | SocketTest | BPDDIY DevTools",
    description:
      "TCP server socket testing powered by the backend WebSocket bridge.",
    keywords: ["socket test", "tcp server", "websocket", "developer tools"],
  });

  return <SocketTesterLayout mode="tcp-server" />;
}
