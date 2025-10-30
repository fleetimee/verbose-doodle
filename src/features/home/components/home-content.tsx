import { Button } from "@/components/ui/button";

export function HomeContent() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border bg-background/80 px-6 py-12 text-center shadow-sm">
      <p className="text-pretty text-lg text-muted-foreground">
        Build and preview billing scenarios with the simulator toolkit.
      </p>
      <Button type="button">Click me</Button>
    </section>
  );
}
