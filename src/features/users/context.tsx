import { createContext, type ReactNode, useContext, useState } from "react";
import type { User } from "@/features/users/types";

type UserDialogContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openDialog: () => void;
  closeDialog: () => void;
  formMode: string;
  setFormMode: (mode: string) => void;
  userData?: User;
  setUserData: React.Dispatch<React.SetStateAction<User | undefined>>;
  openConfirm?: boolean;
  setOpenConfirm?: (open: boolean) => void;
};

const UserDialogContext = createContext<UserDialogContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [userData, setUserData] = useState<User | undefined>(undefined);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  return (
    <UserDialogContext.Provider
      value={{
        open,
        setOpen,
        openDialog,
        closeDialog,
        formMode,
        setFormMode,
        userData,
        setUserData,
        openConfirm,
        setOpenConfirm,
      }}
    >
      {children}
    </UserDialogContext.Provider>
  );
};

export const useUserFormDialog = () => {
  const context = useContext(UserDialogContext);
  if (!context) {
    throw new Error(
      "useAddUserDialog must be used within AddUserDialogProvider"
    );
  }
  return context;
};
