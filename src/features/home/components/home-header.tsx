import { Link } from "react-router";
import { useI18n } from "@/components/i18n-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export function HomeHeader() {
  const { messages } = useI18n();

  return (
    <header className="flex items-center justify-between">
      <h1 className="font-semibold text-3xl tracking-tight">
        {messages.common.appName}
      </h1>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Button
          nativeButton={false}
          render={<Link to="/about" />}
          variant="link"
        >
          {messages.common.navAbout}
        </Button>
      </div>
    </header>
  );
}
