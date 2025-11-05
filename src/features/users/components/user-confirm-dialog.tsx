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
        onSuccess: () => {
          setIsDeleting(false);
          onOpenChange(false);
        },
        onError: () => {
          setIsDeleting(false);
        },
      }
    );
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
