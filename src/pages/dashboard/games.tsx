import { useState } from "react";
import { Link } from "react-router";
import { useI18n } from "@/components/i18n-provider";
import { Input } from "@/components/ui/input";
import { GamePreviewCard } from "@/features/games/components/game-preview-card";

const games = [
  {
    slug: "ponpoko-kart",
    screenshots: ["01.jpg", "02.jpg", "03.jpg", "04.jpg"],
    title: "ponpokoKartTitle",
    description: "ponpokoKartDescription",
  },
  {
    slug: "hearthvale",
    screenshots: ["01.jpg", "02.jpg", "03.jpg", "04.jpg"],
    title: "hearthvaleTitle",
    description: "hearthvaleDescription",
  },
  {
    slug: "nova-lancer",
    screenshots: ["01.jpg", "02.jpg", "03.jpg", "04.jpg"],
    title: "novaLancerTitle",
    description: "novaLancerDescription",
  },
  {
    slug: "fall-line",
    video: "preview.webm",
    screenshots: ["01.jpg", "02.jpg", "03.jpg", "04.jpg"],
    title: "fallLineTitle",
    description: "fallLineDescription",
  },
  {
    slug: "terrabrowser",
    screenshots: ["01.jpg", "02.jpg", "03.jpg", "04.jpg"],
    title: "terrabrowserTitle",
    description: "terrabrowserDescription",
  },
  {
    slug: "emberwake",
    screenshots: ["01.jpg", "02.jpg", "03.jpg", "04.jpg"],
    title: "emberwakeTitle",
    description: "emberwakeDescription",
  },
  {
    slug: "build-your-town",
    screenshots: ["01.jpg", "02.jpg", "03.jpg", "04.jpg"],
    title: "buildYourTownTitle",
    description: "buildYourTownDescription",
  },
  {
    slug: "chess-3d",
    screenshots: ["01.jpg", "02.jpg", "03.jpg", "04.jpg"],
    title: "chess3dTitle",
    description: "chess3dDescription",
  },
  {
    slug: "sunbreak",
    video: "preview.webm",
    screenshots: ["01.jpg", "02.jpg", "03.jpg", "04.jpg"],
    title: "sunbreakTitle",
    description: "sunbreakDescription",
  },
  {
    slug: "arkanoid-neon",
    screenshots: ["01.jpg", "02.jpg", "03.jpg", "04.jpg"],
    title: "arkanoidNeonTitle",
    description: "arkanoidNeonDescription",
  },
  {
    slug: "gravewake",
    screenshots: [],
    title: "gravewakeTitle",
    description: "gravewakeDescription",
  },
] as const;

export function GamesPage() {
  const { messages } = useI18n();
  const copy = messages.common;
  const [search, setSearch] = useState("");
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const query = search.trim().toLocaleLowerCase();
  const visibleGames = games.filter((game) =>
    `${copy[game.title]} ${copy[game.description]}`
      .toLocaleLowerCase()
      .includes(query)
  );
  const featured = games[0];
  const cover = (slug: string) =>
    `${import.meta.env.BASE_URL}games/covers/${slug === "gravewake" ? "placeholder.svg" : `${slug}.jpg`}`;

  const previewMedia = (game: (typeof games)[number]) => ({
    video:
      "video" in game
        ? `${import.meta.env.BASE_URL}games/previews/${game.slug}/${game.video}`
        : undefined,
    screenshots: game.screenshots.map(
      (filename) =>
        `${import.meta.env.BASE_URL}games/previews/${game.slug}/${filename}`
    ),
  });
  const changePreview = (id: string, active: boolean) =>
    setActivePreview((current) => {
      if (active) {
        return id;
      }
      return current === id ? null : current;
    });

  return (
    <section className="mx-auto w-full min-w-0 max-w-[1400px] space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-semibold text-3xl tracking-tight">
            {copy.navFunGames}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            {copy.gamesDescription}
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          {copy.gamesCount.replace("{count}", String(games.length))}
        </p>
      </header>

      <GamePreviewCard
        active={activePreview === "featured"}
        cover={cover(featured.slug)}
        description={copy[featured.description]}
        media={previewMedia(featured)}
        onActiveChange={(active) => changePreview("featured", active)}
        title={copy[featured.title]}
      >
        <Link
          className="group grid overflow-hidden rounded-lg bg-card outline-none focus-visible:ring-3 focus-visible:ring-ring lg:grid-cols-[2fr_1fr]"
          to={`/dashboard/games/${featured.slug}`}
        >
          <div className="overflow-hidden bg-muted">
            <img
              alt=""
              className="aspect-video h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
              fetchPriority="high"
              height={720}
              src={cover(featured.slug)}
              width={1280}
            />
          </div>
          <div className="flex flex-col justify-center p-6 lg:p-8">
            <p className="text-muted-foreground text-sm">
              {copy.gamesFeatured}
            </p>
            <h2 className="mt-3 font-semibold text-3xl tracking-tight">
              {copy[featured.title]}
            </h2>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              {copy[featured.description]}
            </p>
            <span className="mt-6 inline-flex w-fit items-center rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground text-sm">
              {copy.gamesPlay}
            </span>
          </div>
        </Link>
      </GamePreviewCard>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-semibold text-xl tracking-tight">
            {copy.gamesAll}
          </h2>
          <Input
            aria-label={copy.gamesSearch}
            className="max-w-sm"
            onChange={(event) => {
              setActivePreview(null);
              setSearch(event.target.value);
            }}
            placeholder={copy.gamesSearch}
            type="search"
            value={search}
          />
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleGames.map((game) => (
            <GamePreviewCard
              active={activePreview === game.slug}
              cover={cover(game.slug)}
              description={copy[game.description]}
              key={game.slug}
              media={previewMedia(game)}
              onActiveChange={(active) => changePreview(game.slug, active)}
              title={copy[game.title]}
            >
              <Link
                className="group min-w-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring"
                to={`/dashboard/games/${game.slug}`}
              >
                <div className="overflow-hidden rounded-lg bg-muted">
                  <img
                    alt=""
                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                    height={720}
                    loading="lazy"
                    src={cover(game.slug)}
                    width={1280}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-base group-hover:text-primary">
                    {copy[game.title]}
                  </h3>
                  <span className="shrink-0 text-primary text-xs">
                    {copy.gamesPlay}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                  {copy[game.description]}
                </p>
              </Link>
            </GamePreviewCard>
          ))}
        </div>
        {visibleGames.length === 0 && (
          <div className="py-16 text-center" role="status">
            <p className="text-muted-foreground text-sm">{copy.gamesEmpty}</p>
            <button
              className="mt-3 rounded-md px-3 py-2 text-primary text-sm underline underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring"
              onClick={() => setSearch("")}
              type="button"
            >
              {copy.gamesClear}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
