import { SocksRelayPage } from "@/features/socks-relay/components/socks-relay-page";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function SocksRelayIso8583Page() {
  useDocumentMeta({
    title: "ISO 8583 | Socks Relay | BPDDIY DevTools",
    description: "Manage ISO 8583 sock relay instances and live relay logs.",
    keywords: ["socks relay", "iso 8583", "relay", "developer tools"],
  });

  return <SocksRelayPage mode="ISO_8583" />;
}
