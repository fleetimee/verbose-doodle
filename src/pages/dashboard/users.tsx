import { Users as UsersIcon } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { columns } from "@/features/users/components/columns";
import { UserConfirmDialog } from "@/features/users/components/user-confirm-dialog";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { UserFormDialogTrigger } from "@/features/users/components/user-form-dialog-trigger";
import { UserProvider } from "@/features/users/context";
import { useGetUsers } from "@/features/users/hooks/use-get-users";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function UsersPage() {
  useDocumentMeta({
    title: "Users",
    description: "Manage users and their permissions in the billing simulator",
    keywords: ["user management", "permissions", "team", "users"],
  });
  const { data: users = [] } = useGetUsers();

  return (
    <UserProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage users and their permissions
            </p>
          </div>
          <UserFormDialogTrigger />
        </div>

        {/* Empty State or Data Table */}
        {users.length === 0 ? (
          <Empty className="min-h-[60vh] border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersIcon />
              </EmptyMedia>
              <EmptyTitle>No users yet</EmptyTitle>
              <EmptyDescription>
                Start building your team by adding users. Assign roles and
                permissions to manage access to your application.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <UserFormDialogTrigger />
            </EmptyContent>
          </Empty>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            filterColumn="username"
            filterPlaceholder="Filter by username..."
          />
        )}

        <UserFormDialog />
        <UserConfirmDialog />
      </div>
    </UserProvider>
  );
}
