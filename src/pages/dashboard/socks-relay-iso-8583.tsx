import { SocksRelayPage } from "@/features/socks-relay/components/socks-relay-page";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function SocksRelayIso8583Page() {
  useDocumentMeta({
    description: messages.socksRelay.iso8583DocumentDescription,
    keywords: ["socks relay", "iso 8583", "relay", "developer tools"],
    title: messages.socksRelay.iso8583DocumentTitle,
  });

  return <SocksRelayPage mode="ISO_8583" />;
}
