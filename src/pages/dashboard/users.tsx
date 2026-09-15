import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { DataTable } from "@/components/ui/data-table";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { createColumns } from "@/features/users/components/columns";
import { UserConfirmDialog } from "@/features/users/components/user-confirm-dialog";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { UserFormDialogTrigger } from "@/features/users/components/user-form-dialog-trigger";
import { useGetUsers } from "@/features/users/hooks/use-get-users";
import type { User } from "@/features/users/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function UsersPage() {
  const { locale, messages } = useI18n();
  useDocumentMeta({
    description: messages.users.documentDescription,
    keywords: ["user management", "permissions", "team", "users"],
    title: messages.users.documentTitle,
  });

  const { data: users = [], isPending: isLoadingUsers } = useGetUsers();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const handleAddUser = () => {
    setFormMode("add");
    setSelectedUser(undefined);
    setFormDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setFormMode("edit");
    setSelectedUser(user);
    setFormDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setConfirmDialogOpen(true);
  };

  const columns = useMemo(
    () =>
      createColumns({
        onDelete: handleDeleteUser,
        onEdit: handleEditUser,
      }),
    [locale]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            {messages.users.pageTitle}
          </h1>
          <p className="text-muted-foreground">
            {messages.users.pageDescription}
          </p>
        </div>
        {!isLoadingUsers && (
          <div className="flex shrink-0 items-center">
            <UserFormDialogTrigger onClick={handleAddUser} />
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoadingUsers && <DataTableSkeleton columns={5} rows={8} />}

      {/* Empty State or Data Table */}
      {!isLoadingUsers && users.length === 0 && (
        <Empty className="min-h-[60vh] border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>{messages.users.emptyTitle}</EmptyTitle>
            <EmptyDescription>
              {messages.users.emptyDescription}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <UserFormDialogTrigger onClick={handleAddUser} />
          </EmptyContent>
        </Empty>
      )}

      {!isLoadingUsers && users.length > 0 && (
        <DataTable
          columns={columns}
          data={users}
          filterColumn="username"
          filterPlaceholder={messages.users.filterPlaceholder}
        />
      )}

      <UserFormDialog
        mode={formMode}
        onOpenChange={setFormDialogOpen}
        open={formDialogOpen}
        userData={selectedUser}
      />
      <UserConfirmDialog
        onOpenChange={setConfirmDialogOpen}
        open={confirmDialogOpen}
        user={selectedUser}
      />
    </div>
  );
}
