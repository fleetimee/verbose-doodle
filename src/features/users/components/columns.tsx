import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserFormDialog } from "@/features/users/context";
import type { User } from "@/features/users/types";

const getStatusStyles = (active: string): string => {
  if (active) {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  }
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
};

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table: tableInstance }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          tableInstance.getIsAllPageRowsSelected() ||
          (tableInstance.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) =>
          tableInstance.toggleAllPageRowsSelected(!!value)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "avatar",
    header: "Avatar",
    cell: ({ row }) => {
      const user = row.original;
      const initials = user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      return (
        <Avatar>
          <AvatarImage alt={user.username} src={user.avatar} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Name
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("username")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("active") as string;

      return (
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold text-xs ${getStatusStyles(
            status
          )}`}
        >
          {status ? "Active" : "Inactive"}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      const { openDialog, setFormMode, setUserData, setOpenConfirm } =
        useUserFormDialog();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="flex items-center hover:cursor-pointer"
              onClick={() => {
                setFormMode("edit");
                openDialog();
                setUserData?.(user);
              }}
            >
              <Pencil className="w-2" />
              Edit user
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 hover:cursor-pointer hover:text-red-600!"
              onClick={() => {
                setOpenConfirm?.(true);
                setUserData?.(user);
              }}
            >
              <Trash className="w-2 text-red-600" /> Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
