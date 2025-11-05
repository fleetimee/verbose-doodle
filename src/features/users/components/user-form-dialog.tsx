"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserFormDialog } from "@/features/users/context";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;

const userSchema = z.object({
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH, {
      message: "Username must be at least 3 characters long",
    })
    .max(USERNAME_MAX_LENGTH, {
      message: "Username must not exceed 20 characters",
    }),
  role: z.enum(["ADMIN", "USER"], { message: "Invalid role" }),
  active: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserFormDialog = () => {
  const { open, setOpen, formMode, userData, setUserData } =
    useUserFormDialog();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      role: "USER",
      active: true,
    },
  });

  useEffect(() => {
    if (formMode === "edit" && userData) {
      reset({
        username: userData.username,
        role: userData.role,
        active: userData.active,
      });
    } else {
      reset({
        username: "",
        role: "USER",
        active: true,
      });
    }
  }, [formMode, userData, reset]);

  const onSubmit = (data: UserFormData) => {
    if (formMode === "edit") {
      // TODO: call update API here
    } else {
      // TODO: call create API here
    }

    setUserData?.(data);
    setOpen(false);
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setUserData?.(undefined);
        }
      }}
      open={open}
    >
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {formMode === "edit" ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "edit"
                ? "Modify user information below."
                : "Fill out the form below to add a new user."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="username"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-red-500 text-sm">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-3">
                <Label htmlFor="role">Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Role</SelectLabel>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="USER">User</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="is_active">Active User</Label>
                <Controller
                  control={control}
                  name="active"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                      id="is_active"
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">
              {formMode === "edit" ? "Save Changes" : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
