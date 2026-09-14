import { SocksRelayPage } from "@/features/socks-relay/components/socks-relay-page";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function SocksRelayRestApiPage() {
  useDocumentMeta({
    description: messages.socksRelay.restApiDocumentDescription,
    keywords: ["socks relay", "rest api", "relay", "developer tools"],
    title: messages.socksRelay.restApiDocumentTitle,
  });

  return <SocksRelayPage mode="REST_API" />;
}
