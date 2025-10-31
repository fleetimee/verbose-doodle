import { Plus, Users as UsersIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { sampleUsers } from "@/features/users/data/users-data";
import type { User } from "@/features/users/types";

export function UsersPage() {
  const [users] = useState<User[]>(sampleUsers);

  const handleAddUser = () => {
    // TODO: Implement add user logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage users and their permissions
          </p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
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
            <Button onClick={handleAddUser}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First User
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          filterColumn="email"
          filterPlaceholder="Filter by email..."
        />
      )}
    </div>
  );
}
