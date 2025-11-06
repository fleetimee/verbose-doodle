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
import { useUpdateResponse } from "@/features/endpoints/hooks/use-update-response";
import type { EndpointResponse } from "@/features/endpoints/types";

type EditType = "name" | "statusCode" | "json";

type EditResponseDialogProps = {
  response: EndpointResponse;
  editType: EditType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditResponseDialog({
  response,
  editType,
  open,
  onOpenChange,
}: EditResponseDialogProps) {
  const { mutate: updateResponse, isPending } = useUpdateResponse();

  const handleSubmit = (data: {
    name?: string;
    statusCode?: number;
    json?: string;
  }) => {
    updateResponse(
      {
        responseId: response.id,
        ...data,
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
        return "Edit Response Name";
      case "statusCode":
        return "Edit Status Code";
      case "json":
        return "Edit JSON Response";
      default:
        return "Edit Response";
    }
  };

  const getDialogDescription = () => {
    switch (editType) {
      case "name":
        return "Update the name of this response configuration.";
      case "statusCode":
        return "Update the HTTP status code for this response.";
      case "json":
        return "Update the JSON response body.";
      default:
        return "Update this response configuration.";
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
