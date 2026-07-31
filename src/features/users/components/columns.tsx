import {
  DeleteIcon,
  EditIcon,
  MoreHorizontalCircle01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "@/components/hugeicons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/features/users/types";
import { messages } from "@/lib/i18n";

type ColumnActions = {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

const getStatusStyles = (active: string): string => {
  if (active) {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  }
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
};

export const createColumns = (actions: ColumnActions): ColumnDef<User>[] => [
  {
    cell: ({ row }) => (
      <Checkbox
        aria-label={messages.users.selectRowAriaLabel}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableHiding: false,
    enableSorting: false,
    header: ({ table: tableInstance }) => (
      <Checkbox
        aria-label={messages.users.selectAllAriaLabel}
        checked={tableInstance.getIsAllPageRowsSelected()}
        indeterminate={
          !tableInstance.getIsAllPageRowsSelected() &&
          tableInstance.getIsSomePageRowsSelected()
        }
        onCheckedChange={(value) =>
          tableInstance.toggleAllPageRowsSelected(!!value)
        }
      />
    ),
    id: "select",
  },
  {
    accessorKey: "avatar",
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
    header: messages.users.avatarColumn,
  },
  {
    accessorKey: "username",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("username")}</div>
    ),
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        {messages.users.nameColumn}
        <ArrowUpDown />
      </Button>
    ),
  },
  {
    accessorKey: "role",
    cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
    header: messages.users.roleColumn,
  },
  {
    accessorKey: "active",
    cell: ({ row }) => {
      const status = row.getValue("active") as string;

      return (
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold text-xs ${getStatusStyles(
            status
          )}`}
        >
          {status ? messages.users.activeStatus : messages.users.inactiveStatus}
        </div>
      );
    },
    header: messages.users.statusColumn,
  },
  {
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <span className="sr-only">{messages.users.openMenu}</span>
              <HugeiconsIcon
                icon={MoreHorizontalCircle01Icon}
                strokeWidth={2}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{messages.users.actions}</DropdownMenuLabel>
              <DropdownMenuItem
                className="flex items-center hover:cursor-pointer"
                onClick={() => actions.onEdit(user)}
              >
                <HugeiconsIcon
                  className="w-2"
                  icon={EditIcon}
                  strokeWidth={2}
                />
                {messages.users.editUser}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 hover:cursor-pointer hover:text-red-600!"
                onClick={() => actions.onDelete(user)}
              >
                <HugeiconsIcon
                  className="w-2 text-red-600"
                  icon={DeleteIcon}
                  strokeWidth={2}
                />{" "}
                {messages.users.deleteUser}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
    id: "actions",
  },
];
