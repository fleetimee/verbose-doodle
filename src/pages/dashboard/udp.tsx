import { SocketTesterLayout } from "@/features/socket-tester/components/socket-tester-layout";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function UdpPage() {
  useDocumentMeta({
    title: "UDP | SocketTest | BPDDIY DevTools",
    description: "UDP socket testing powered by the backend WebSocket bridge.",
    keywords: ["socket test", "udp", "websocket", "developer tools"],
  });

  return <SocketTesterLayout mode="udp" />;
}
