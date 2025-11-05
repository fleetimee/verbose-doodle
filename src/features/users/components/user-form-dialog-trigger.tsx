import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUserFormDialog } from "../context";

export const UserFormDialogTrigger = () => {
  const { openDialog, setFormMode } = useUserFormDialog();

  return (
    <Button
      variant="outline"
      onClick={() => {
        setFormMode("add");
        openDialog();
      }}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add User
    </Button>
  );
};
