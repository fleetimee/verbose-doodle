import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AboutContent } from "@/features/about/components/about-content";
import { AboutHeader } from "@/features/about/components/about-header";

export function AboutPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <AboutHeader />
      <AboutContent />
      <Button asChild variant="link">
        <Link to="/">Return home</Link>
      </Button>
    </main>
  );
}
