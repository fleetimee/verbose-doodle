import { useI18n } from "@/components/i18n-provider";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ServerSessionExitDialogProps {
  action: "disconnect" | "leave" | null;
  onCancel: () => void;
  onConfirm: () => void;
  serverName: string;
}

export function ServerSessionExitDialog({
  action,
  onCancel,
  onConfirm,
  serverName,
}: ServerSessionExitDialogProps) {
  const { messages } = useI18n();
  const copy = messages.servers;
  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
      open={action !== null}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="break-words">
            {copy.sessionExitTitle.replace("{server}", serverName)}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {copy.sessionExitDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onCancel} size="sm-compact" variant="outline">
            {copy.sessionKeepConnected}
          </Button>
          <Button onClick={onConfirm} size="sm-compact" variant="destructive">
            {action === "leave"
              ? copy.sessionDisconnectAndLeave
              : copy.sshDisconnect}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
