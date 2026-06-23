import { useState } from "react";
import { useNavigate } from "react-router";
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
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/context";
import { markManualLogout } from "@/features/auth/utils";
import { messages } from "@/lib/i18n";

/**
 * Simulated logout delay for demonstration purposes
 */
const LOGOUT_DELAY_MS = 2500;

type LogoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Logout confirmation dialog component
 * Shows a confirmation dialog before logging out the user
 */
export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    await new Promise((resolve) => setTimeout(resolve, LOGOUT_DELAY_MS));

    markManualLogout();
    logout();

    onOpenChange(false);

    setIsLoggingOut(false);

    navigate("/logged-out");
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {messages.auth.logoutConfirmTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {messages.auth.logoutConfirmDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoggingOut}>
            {messages.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction disabled={isLoggingOut} onClick={handleLogout}>
            {isLoggingOut && <Spinner className="mr-2" />}
            {isLoggingOut ? messages.auth.loggingOut : messages.auth.logOut}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
