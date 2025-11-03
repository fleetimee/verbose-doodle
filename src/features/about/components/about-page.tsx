import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AboutContent } from "@/features/about/components/about-content";
import { AboutHeader } from "@/features/about/components/about-header";

export function AboutPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-12 px-4 py-12 md:py-16">
      <AboutHeader />
      <AboutContent />
      <div className="flex justify-center">
        <Button asChild variant="link">
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </main>
  );
}
