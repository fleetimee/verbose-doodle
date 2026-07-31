import { SocketTesterLayout } from "@/features/socket-tester/components/socket-tester-layout";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function TcpServerPage() {
  useDocumentMeta({
    description:
      "TCP server socket testing powered by the backend WebSocket bridge.",
    keywords: ["socket test", "tcp server", "websocket", "developer tools"],
    title: "TCP Server | SocketTest | BPDDIY DevTools",
  });

  return <SocketTesterLayout mode="tcp-server" />;
}
