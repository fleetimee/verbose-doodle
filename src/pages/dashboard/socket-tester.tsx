import { Navigate } from "react-router";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function SocketTesterPage() {
  useDocumentMeta({
    description: messages.socketTester.documentDescription,
    keywords: ["socket tester", "tcp", "udp", "websocket", "developer tools"],
    title: messages.socketTester.documentTitle,
  });

  return <Navigate replace to="/dashboard/socket-test/tcp-client" />;
}
