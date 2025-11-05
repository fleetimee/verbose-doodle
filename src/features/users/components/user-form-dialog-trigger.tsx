import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type UserFormDialogTriggerProps = {
  onClick: () => void;
};

export const UserFormDialogTrigger = ({
  onClick,
}: UserFormDialogTriggerProps) => (
  <Button onClick={onClick} variant="outline">
    <Plus className="mr-2 h-4 w-4" />
    Add User
  </Button>
);
