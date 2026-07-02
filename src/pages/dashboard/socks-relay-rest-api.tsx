import { SocksRelayPage } from "@/features/socks-relay/components/socks-relay-page";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function SocksRelayRestApiPage() {
  useDocumentMeta({
    title: "REST API | Socks Relay | BPDDIY DevTools",
    description: "Manage REST API sock relay instances and live relay logs.",
    keywords: ["socks relay", "rest api", "relay", "developer tools"],
  });

  return <SocksRelayPage mode="REST_API" />;
}
