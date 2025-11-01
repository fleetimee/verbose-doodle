import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="flex h-screen items-center border-x">
        <div>
          <div className="absolute inset-x-0 h-px bg-border" />
          <Empty>
            <EmptyHeader>
              <div className="mb-4 flex justify-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
              </div>
              <EmptyTitle className="font-black text-4xl">
                Something went wrong
              </EmptyTitle>
              <EmptyDescription className="text-nowrap">
                An unexpected error occurred. <br />
                We apologize for the inconvenience.
              </EmptyDescription>
              {import.meta.env.DEV && error.message && (
                <div className="mt-4 max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-left">
                  <p className="font-mono text-destructive text-xs">
                    {error.message}
                  </p>
                </div>
              )}
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button onClick={resetError}>
                  <RotateCcw /> Try Again
                </Button>

                <Button asChild variant="outline">
                  <Link to="/">
                    <Home /> Go Home
                  </Link>
                </Button>
              </div>
            </EmptyContent>
          </Empty>
          <div className="absolute inset-x-0 h-px bg-border" />
        </div>
      </div>
    </div>
  );
}
