import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
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
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/context";
import { useTokenExpiration } from "@/features/auth/hooks/use-token-expiration";

// Show warning dialog 2 minutes before expiration
const WARNING_THRESHOLD_MS = 120_000;

export function TokenExpirationDialog() {
  const tokenExpiration = useTokenExpiration();
  const { logout, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!tokenExpiration) {
      setShowWarning(false);
      return;
    }

    // Check if token is expired
    if (tokenExpiration.isExpired) {
      logout();
      navigate("/login?reason=expired-while-active");
      return;
    }

    // Show warning if within threshold
    if (tokenExpiration.remainingMs < WARNING_THRESHOLD_MS) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [tokenExpiration, logout, navigate]);

  const handleStayLoggedIn = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshAuth();
      if (success) {
        toast.success("Session Refreshed", {
          description: "Your session has been extended successfully.",
        });
        setShowWarning(false);
      } else {
        toast.error("Refresh Failed", {
          description: "Unable to refresh session. Please log in again.",
        });
      }
    } catch {
      toast.error("Refresh Failed", {
        description: "Unable to refresh session. Please log in again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogoutNow = () => {
    logout();
    navigate("/login?reason=expired-while-active");
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
          <Button
            disabled={isRefreshing}
            onClick={handleLogoutNow}
            variant="outline"
          >
            Log Out Now
          </Button>
          <AlertDialogAction
            disabled={isRefreshing}
            onClick={handleStayLoggedIn}
          >
            {isRefreshing && <Spinner className="mr-2" />}
            {isRefreshing ? "Refreshing..." : "Stay Logged In"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
