import { SocketTesterLayout } from "@/features/socket-tester/components/socket-tester-layout";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function UdpPage() {
  useDocumentMeta({
    description: messages.socketTester.udpDocumentDescription,
    keywords: ["socket test", "udp", "websocket", "developer tools"],
    title: messages.socketTester.udpDocumentTitle,
  });

  return <SocketTesterLayout mode="udp" />;
}
