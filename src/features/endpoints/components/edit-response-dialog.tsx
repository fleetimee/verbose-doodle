import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditResponseJsonForm } from "@/features/endpoints/forms/edit-response-json-form";
import { EditResponseNameForm } from "@/features/endpoints/forms/edit-response-name-form";
import { EditResponseStatusCodeForm } from "@/features/endpoints/forms/edit-response-status-code-form";
import { useEndpointWorkspace } from "@/features/endpoints/hooks/use-endpoint-workspace";
import type { EndpointResponse } from "@/features/endpoints/types";
import { messages } from "@/lib/i18n";

type EditType = "name" | "statusCode" | "json";

type EditResponseDialogProps = {
  endpointId: string;
  response: EndpointResponse;
  editType: EditType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditResponseDialog({
  endpointId,
  response,
  editType,
  open,
  onOpenChange,
}: EditResponseDialogProps) {
  const { updateResponse } = useEndpointWorkspace(endpointId);
  const { mutate: updateResponseMutation, isPending } = updateResponse;

  const handleSubmit = (data: {
    name?: string;
    statusCode?: number;
    json?: string;
  }) => {
    updateResponseMutation(
      {
        endpointId,
        responseId: response.id,
        changes: data,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const getDialogTitle = () => {
    switch (editType) {
      case "name":
        return messages.endpoints.editResponseName;
      case "statusCode":
        return messages.endpoints.editStatusCode;
      case "json":
        return messages.endpoints.editJsonResponse;
      default:
        return messages.endpoints.editResponse;
    }
  };

  const getDialogDescription = () => {
    switch (editType) {
      case "name":
        return messages.endpoints.editResponseNameDescription;
      case "statusCode":
        return messages.endpoints.editStatusCodeDescription;
      case "json":
        return messages.endpoints.editJsonResponseDescription;
      default:
        return messages.endpoints.editResponseDescription;
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {editType === "name" && (
          <EditResponseNameForm
            defaultValue={response.name}
            isLoading={isPending}
            onCancel={() => onOpenChange(false)}
            onSubmit={handleSubmit}
          />
        )}

        {editType === "statusCode" && (
          <EditResponseStatusCodeForm
            defaultValue={response.statusCode}
            isLoading={isPending}
            onCancel={() => onOpenChange(false)}
            onSubmit={handleSubmit}
          />
        )}

        {editType === "json" && (
          <EditResponseJsonForm
            defaultValue={response.json}
            isLoading={isPending}
            onCancel={() => onOpenChange(false)}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
