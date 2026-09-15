import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export function HomeContent() {
  const { messages } = useI18n();

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border bg-background/80 px-6 py-12 text-center shadow-sm">
      <p className="text-pretty text-lg text-muted-foreground">
        {messages.common.homeDescription}
      </p>
      <Button type="button">{messages.common.clickMe}</Button>
    </section>
  );
}
