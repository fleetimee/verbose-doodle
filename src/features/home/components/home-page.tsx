import { HomeContent } from "@/features/home/components/home-content";
import { HomeHeader } from "@/features/home/components/home-header";

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-10 px-4 py-10">
      <HomeHeader />
      <HomeContent />
    </main>
  );
}
