import { SocketTesterLayout } from "@/features/socket-tester/components/socket-tester-layout";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function UdpPage() {
  useDocumentMeta({
    description: "UDP socket testing powered by the backend WebSocket bridge.",
    keywords: ["socket test", "udp", "websocket", "developer tools"],
    title: "UDP | SocketTest | BPDDIY DevTools",
  });

  return <SocketTesterLayout mode="udp" />;
}
