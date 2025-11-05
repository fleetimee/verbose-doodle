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
import { useUserFormDialog } from "@/features/users/context";
import { useDeleteUser } from "../hooks/use-delete-user";

export const UserConfirmDialog = () => {
  const { openConfirm, setOpenConfirm, userData, setUserData } =
    useUserFormDialog();
  const { mutate: deleteUser } = useDeleteUser();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData?.id) {
      return;
    }

    setIsDeleting(true);

    deleteUser(
      { user_id: userData.id },
      {
        onSuccess: () => {
          setIsDeleting(false);
          setUserData?.(undefined);
          setOpenConfirm?.(false);
        },
        onError: () => {
          setIsDeleting(false);
        },
      }
    );
  };

  return (
    <AlertDialog onOpenChange={setOpenConfirm} open={openConfirm}>
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
