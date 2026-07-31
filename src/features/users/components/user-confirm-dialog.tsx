import { useState } from "react";
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
import { useDeleteUser } from "@/features/users/hooks/use-delete-user";
import type { User } from "@/features/users/types";
import { messages } from "@/lib/i18n";

type UserConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
};

export const UserConfirmDialog = ({
  open,
  onOpenChange,
  user,
}: UserConfirmDialogProps) => {
  const { mutate: deleteUser } = useDeleteUser();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      return;
    }

    setIsDeleting(true);

    deleteUser(
      { user_id: user.id },
      {
        onError: () => {
          setIsDeleting(false);
        },
        onSuccess: () => {
          setIsDeleting(false);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {messages.users.deleteConfirmTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {messages.users.deleteConfirmDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {messages.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? messages.common.deleting : messages.common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
