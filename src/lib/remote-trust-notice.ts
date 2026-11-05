import { toast } from "sonner";
import { getMessages } from "@/lib/i18n";

let notified = false;

export function notifyRemoteAutoTrust() {
  if (notified) {
    return;
  }
  notified = true;
  const copy = getMessages().servers;
  toast.info(copy.autoTrustTitle, {
    description: copy.autoTrustDescription,
    duration: 8000,
    id: "remote-auto-trust",
  });
}
