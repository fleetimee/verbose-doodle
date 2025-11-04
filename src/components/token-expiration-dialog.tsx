import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context";
import { useTokenExpiration } from "@/features/auth/hooks/use-token-expiration";

// Show warning dialog 2 minutes before expiration
const WARNING_THRESHOLD_MS = 120_000;
const EXPIRATION_REASON_KEY = "auth_expiration_reason";

export type ExpirationReason =
  | "expired-while-active"
  | "expired-while-away"
  | "expired-during-request";

export function setExpirationReason(reason: ExpirationReason): void {
  try {
    sessionStorage.setItem(EXPIRATION_REASON_KEY, reason);
  } catch {
    // Silently fail if sessionStorage is unavailable
  }
}

export function getExpirationReason(): ExpirationReason | null {
  try {
    return sessionStorage.getItem(EXPIRATION_REASON_KEY) as ExpirationReason;
  } catch {
    return null;
  }
}

export function clearExpirationReason(): void {
  try {
    sessionStorage.removeItem(EXPIRATION_REASON_KEY);
  } catch {
    // Silently fail
  }
}

export function TokenExpirationDialog() {
  const tokenExpiration = useTokenExpiration();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!tokenExpiration) {
      setShowWarning(false);
      return;
    }

    // Check if token is expired
    if (tokenExpiration.isExpired) {
      setExpirationReason("expired-while-active");
      logout();
      navigate("/login");
      return;
    }

    // Show warning if within threshold
    if (tokenExpiration.remainingMs < WARNING_THRESHOLD_MS) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [tokenExpiration, logout, navigate]);

  const handleStayLoggedIn = () => {
    // TODO: Implement token refresh when backend supports it
    // For now, just dismiss the dialog
    setShowWarning(false);
  };

  const handleLogoutNow = () => {
    setExpirationReason("expired-while-active");
    logout();
    navigate("/login");
  };

  if (!(showWarning && tokenExpiration)) {
    return null;
  }

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Your session is about to expire.</p>
            <p className="font-semibold text-destructive text-lg">
              Time remaining: {tokenExpiration.formattedTime}
            </p>
            <p className="text-muted-foreground text-sm">
              You will be automatically logged out when the timer reaches zero.
              Please save your work.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={handleLogoutNow} variant="outline">
            Log Out Now
          </Button>
          <AlertDialogAction onClick={handleStayLoggedIn}>
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
