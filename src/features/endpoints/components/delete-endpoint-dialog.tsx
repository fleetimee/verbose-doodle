import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import type { Endpoint } from "@/features/endpoints/types";
import { messages } from "@/lib/i18n";

type DeleteEndpointDialogProps = {
  endpoint: Endpoint | null;
  isDeleting?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function DeleteEndpointDialog({
  endpoint,
  isDeleting = false,
  onConfirm,
  onOpenChange,
  open,
}: DeleteEndpointDialogProps) {
  if (!endpoint) {
    return null;
  }

  const responseCount = endpoint.responses.length;
  const responseLabel = `${responseCount} configured response${
    responseCount === 1 ? "" : "s"
  }`;

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {messages.endpoints.deleteEndpointConfirmTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {messages.endpoints.deleteEndpointConfirmDescription}{" "}
            <span className="font-semibold">
              {endpoint.method} {endpoint.url}
            </span>
            . {messages.endpoints.deleteEndpointResponseDescription}{" "}
            <span className="font-semibold">{responseLabel}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {messages.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting && <Spinner className="mr-2" />}
            {isDeleting
              ? messages.endpoints.deleting
              : messages.endpoints.deleteEndpointConfirmAction}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
