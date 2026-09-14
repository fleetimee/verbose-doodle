import { SocketTesterLayout } from "@/features/socket-tester/components/socket-tester-layout";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function TcpClientPage() {
  useDocumentMeta({
    description: messages.socketTester.tcpClientDocumentDescription,
    keywords: ["socket test", "tcp client", "websocket", "developer tools"],
    title: messages.socketTester.tcpClientDocumentTitle,
  });

  return <SocketTesterLayout mode="tcp-client" />;
}
