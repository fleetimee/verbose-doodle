import { SocketTesterLayout } from "@/features/socket-tester/components/socket-tester-layout";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function TcpServerPage() {
  useDocumentMeta({
    description: messages.socketTester.tcpServerDocumentDescription,
    keywords: ["socket test", "tcp server", "websocket", "developer tools"],
    title: messages.socketTester.tcpServerDocumentTitle,
  });

  return <SocketTesterLayout mode="tcp-server" />;
}
