import { useI18n } from "@/components/i18n-provider";
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
import { formatMessage, messages } from "@/lib/i18n";

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
  useI18n();
  if (!endpoint) {
    return null;
  }

  const responseCount = endpoint.responses.length;
  const responseLabel = formatMessage(
    messages.endpoints.configuredResponsesCount,
    { count: responseCount }
  );

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
            disabled={isDeleting}
            onClick={onConfirm}
            variant="destructive"
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
