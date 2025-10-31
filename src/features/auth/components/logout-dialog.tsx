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

    logout();

    onOpenChange(false);

    setIsLoggingOut(false);

    navigate("/login");
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be redirected to the login page and will need to sign in
            again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isLoggingOut} onClick={handleLogout}>
            {isLoggingOut && <Spinner className="mr-2" />}
            {isLoggingOut ? "Logging out..." : "Log out"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
