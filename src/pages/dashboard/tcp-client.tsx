import { SocketTesterLayout } from "@/features/socket-tester/components/socket-tester-layout";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function TcpClientPage() {
  useDocumentMeta({
    title: "TCP Client | SocketTest | BPDDIY DevTools",
    description:
      "TCP client socket testing powered by the backend WebSocket bridge.",
    keywords: ["socket test", "tcp client", "websocket", "developer tools"],
  });

  return <SocketTesterLayout mode="tcp-client" />;
}
