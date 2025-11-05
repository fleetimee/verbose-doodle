import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserFormDialog } from "@/features/users/context";

export const UserFormDialogTrigger = () => {
  const { openDialog, setFormMode } = useUserFormDialog();

  return (
    <Button
      onClick={() => {
        setFormMode("add");
        openDialog();
      }}
      variant="outline"
    >
      <Plus className="mr-2 h-4 w-4" />
      Add User
    </Button>
  );
};
