import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function HomeHeader() {
  return (
    <header className="flex items-center justify-between">
      <h1 className="font-semibold text-3xl tracking-tight">
        Biller Simulator
      </h1>
      <Button asChild variant="link">
        <Link to="/about">About</Link>
      </Button>
    </header>
  );
}
