import { toast } from "sonner";
import { z } from "zod";
import { formatMessage, getMessages } from "@/lib/i18n";

export const remoteTrustAcceptanceSchema = z.object({
  host: z.string(),
  port: z.number().int().min(1).max(65_535),
  fingerprint: z.string(),
});

export function notifyRemoteAutoTrust(
  acceptance: z.infer<typeof remoteTrustAcceptanceSchema>
) {
  const copy = getMessages().servers;
  toast.info(copy.autoTrustTitle, {
    description: formatMessage(copy.autoTrustDescription, {
      host: `${acceptance.host}:${acceptance.port}`,
    }),
    duration: 8000,
    id: `remote-auto-trust:${acceptance.host}:${acceptance.port}:${acceptance.fingerprint}`,
  });
}
