import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  UserForm,
  type UserFormHandle,
} from "@/features/users/forms/user-form";
import {
  type CreateUserRequest,
  useCreateUser,
} from "@/features/users/hooks/use-create-user";
import { useUpdateUser } from "@/features/users/hooks/use-update-user";
import type { UserFormData } from "@/features/users/schemas/user-schema";
import type { User } from "@/features/users/types";

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  userData?: User;
};

export const UserFormDialog = ({
  open,
  onOpenChange,
  mode,
  userData,
}: UserFormDialogProps) => {
  const formRef = useRef<UserFormHandle>(null);

  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const isSubmitting = isCreating || isUpdating;

  // Create default values based on mode and userData
  const defaultValues =
    mode === "edit" && userData
      ? {
          username: userData.username,
          role: userData.role,
          active: userData.active,
          password: "",
        }
      : {
          username: "",
          role: "USER" as const,
          active: true,
          password: "",
        };

  const onSubmit = (data: UserFormData) => {
    if (mode === "edit" && userData?.id) {
      updateUser(
        {
          user_id: userData.id,
          username: data.username,
          role: data.role,
          active: data.active,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            formRef.current?.reset();
          },
          onError: () => {
            // Error is handled by the mutation hook with toast notification
          },
        }
      );
    } else {
      createUser(data as CreateUserRequest, {
        onSuccess: () => {
          onOpenChange(false);
          formRef.current?.reset();
        },
        onError: () => {
          // Error is handled by the mutation hook with toast notification
        },
      });
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="font-semibold text-xl">
            {mode === "edit" ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update user information and permissions."
              : "Create a new user account with appropriate permissions."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <UserForm
            defaultValues={defaultValues}
            key={userData?.id ?? "new"}
            onSubmit={onSubmit}
            ref={formRef}
            showPassword={mode === "add"}
          >
            <DialogFooter className="mt-5 gap-2">
              <Button
                className="flex-1 sm:flex-initial"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 sm:flex-initial"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting && <Spinner className="mr-2" />}
                {(() => {
                  if (isSubmitting) {
                    return mode === "edit" ? "Saving..." : "Creating...";
                  }
                  return mode === "edit" ? "Save Changes" : "Add User";
                })()}
              </Button>
            </DialogFooter>
          </UserForm>
        </div>
      </DialogContent>
    </Dialog>
  );
};
