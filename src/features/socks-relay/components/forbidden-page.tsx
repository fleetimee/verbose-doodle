import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ForbiddenPage() {
  return (
    <div className="grid min-h-[calc(100vh-9rem)] place-items-center p-6">
      <Card className="w-full max-w-md rounded-lg">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <h1 className="font-semibold text-2xl">403 Permission denied</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Socks Relay controls are available to ADMIN users only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
