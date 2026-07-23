import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

type UserFormDialogTriggerProps = {
  onClick: () => void;
};

export const UserFormDialogTrigger = ({
  onClick,
}: UserFormDialogTriggerProps) => (
  <Button onClick={onClick} variant="outline">
    <HugeiconsIcon className="mr-2 h-4 w-4" icon={Add01Icon} strokeWidth={2} />
    Add User
  </Button>
);
