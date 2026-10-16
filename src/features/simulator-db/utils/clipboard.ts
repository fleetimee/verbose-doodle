import { toast } from "sonner";
import { getMessages } from "@/lib/i18n";

export async function copyDatabaseValue(value: string) {
  const { simulatorDb: messages } = getMessages();
  try {
    await navigator.clipboard.writeText(value);
    toast.success(messages.copied);
    return true;
  } catch {
    toast.error(messages.copyFailed);
    return false;
  }
}
