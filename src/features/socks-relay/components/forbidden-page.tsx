import { ShieldAlert } from "@/components/hugeicons";
import { Card, CardContent } from "@/components/ui/card";
import { messages } from "@/lib/i18n";

export function ForbiddenPage() {
  return (
    <div className="grid min-h-[calc(100vh-9rem)] place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardContent size="centered">
          <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <h1 className="font-semibold text-2xl">
              {messages.socksRelay.permissionDeniedTitle}
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              {messages.socksRelay.permissionDeniedDescription}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
