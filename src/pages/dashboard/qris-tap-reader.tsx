import {
  Settings01Icon,
  Shield01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const screenshots = [
  { file: "scan", label: "scan" },
  { file: "history", label: "history" },
  { file: "apdu", label: "apdu" },
  { file: "base64", label: "base64" },
  { file: "tlv", label: "tlv" },
  { file: "hex", label: "hex" },
  { file: "logs", label: "logs" },
  { file: "broadcast", label: "broadcastShot" },
] as const;

function AppScreenshot({
  file,
  label,
  enlarged = false,
}: {
  file: string;
  label: string;
  enlarged?: boolean;
}) {
  return (
    <>
      <img
        alt={label}
        className={
          enlarged
            ? "mx-auto hidden max-h-[70svh] w-auto max-w-full object-contain dark:block"
            : "hidden h-full w-auto max-w-full object-contain dark:block"
        }
        height={1699}
        loading="lazy"
        src={`/qris-tap-reader/${file}-dark.png`}
        width={774}
      />
      <img
        alt={label}
        className={
          enlarged
            ? "mx-auto max-h-[70svh] w-auto max-w-full object-contain dark:hidden"
            : "h-full w-auto max-w-full object-contain dark:hidden"
        }
        height={1699}
        loading="lazy"
        src={`/qris-tap-reader/${file}.png`}
        width={774}
      />
    </>
  );
}

export function QrisTapReaderPage() {
  const { locale, messages } = useI18n();
  const m = messages.qrisTapReader;
  const information = [
    [m.provider, m.providerValue],
    [m.size, `16.7 MB · ${m.universalApk}`],
    [m.platform, "Android"],
    [m.languages, m.languageValue],
    [m.version, "1.0.4"],
    [m.category, m.categoryValue],
    [m.compatibility, m.requirements],
    [m.storage, m.storageValue],
  ];

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-8 pb-8">
      <header className="flex items-start gap-5 border-b pb-6">
        <img
          alt="Eimi"
          className="size-24 shrink-0 rounded-3xl sm:size-32"
          height={144}
          src="/qris-tap-reader/icon.webp"
          width={144}
        />
        <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
          <div>
            <h1 className="text-balance font-semibold text-2xl tracking-tight sm:text-3xl">
              Eimi
            </h1>
            <p className="mt-1 font-medium text-sm">{m.menu}</p>
            <p className="mt-1 max-w-xl text-muted-foreground text-sm">
              {m.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              render={
                <a
                  href="http://192.168.4.62/BPD_DIY_DEV_TOOLS/EIMI/releases/tag/v1.0.4"
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
            >
              {m.download}
            </Button>
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-[repeat(5,minmax(8rem,1fr))] overflow-x-auto py-1">
        {[
          [m.ratingsLabel, "4.9", m.sampleShort],
          [m.platform, "Android", "7.0+ · NFC"],
          [m.category, m.categoryValue, "QRIS TAP"],
          [m.version, "1.0.4", "Eimi"],
          [m.size, "16.7", "MB"],
        ].map(([label, value, detail]) => (
          <div
            className="relative grid min-w-28 grid-rows-[1.25rem_2rem_1.25rem] items-center justify-items-center gap-1 px-3 text-center after:absolute after:inset-y-2 after:right-0 after:w-px after:bg-border last:after:hidden"
            key={label}
          >
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              {label}
            </dt>
            <dd className="whitespace-nowrap font-semibold text-base sm:text-xl">
              {value}
            </dd>
            <dd className="whitespace-nowrap text-muted-foreground text-xs">
              {detail}
            </dd>
          </div>
        ))}
      </dl>
      <section aria-label={m.preview}>
        <Carousel
          aria-label={m.preview}
          className="min-w-0"
          opts={{ align: "start" }}
        >
          <div className="mb-3 flex h-8 items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">{m.hint}</p>
            <div className="flex shrink-0 gap-2">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </div>
          <div className="h-[360px] [container-type:size] sm:h-[420px] [&>[data-slot=carousel-content]]:h-full">
            <CarouselContent className="h-full">
              {screenshots.map(({ file, label }) => (
                <CarouselItem
                  className="h-full max-w-full basis-[calc(45.56cqh+0.5rem)]"
                  key={file}
                >
                  <Dialog>
                    <figure className="flex h-full min-h-0 flex-col items-start gap-2">
                      <DialogTrigger
                        aria-label={`${m.openScreenshot}: ${m[label]}`}
                        className="min-h-0 flex-1"
                      >
                        <AppScreenshot file={file} label={m[label]} />
                      </DialogTrigger>
                      <figcaption className="shrink-0 font-medium text-xs">
                        {m[label]}
                      </figcaption>
                    </figure>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{m[label]}</DialogTitle>
                        <DialogDescription>Eimi · {m.menu}</DialogDescription>
                      </DialogHeader>
                      <AppScreenshot enlarged file={file} label={m[label]} />
                    </DialogContent>
                  </Dialog>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>
      </section>
      <div className="border-b pb-8">
        <section aria-labelledby="reader-about" className="flex flex-col gap-4">
          <h2
            className="font-semibold text-xl tracking-tight"
            id="reader-about"
          >
            {m.about}
          </h2>
          <p className="max-w-prose text-sm leading-relaxed">{m.body}</p>
          <p className="max-w-prose text-sm leading-relaxed">{m.broadcast}</p>
          <p className="max-w-prose text-muted-foreground text-sm leading-relaxed">
            {m.notice}
          </p>
        </section>
      </div>
      <section
        aria-labelledby="reader-reviews"
        className="flex flex-col gap-5 border-b pb-8"
      >
        <div>
          <h2 className="font-semibold text-xl" id="reader-reviews">
            {m.ratings}
          </h2>
          <p className="mt-1 text-muted-foreground text-xs">{m.sample}</p>
        </div>
        <div className="grid items-center gap-6 sm:grid-cols-2">
          <div className="flex items-end gap-3">
            <span className="font-semibold text-6xl tracking-tight">4.9</span>
            <div className="pb-1 text-muted-foreground text-sm">
              {m.outOf}
              <p>{m.ratingCount}</p>
            </div>
          </div>
          <div
            aria-label={m.ratingCount}
            className="flex w-full min-w-0 flex-col gap-1.5"
            role="img"
          >
            {["w-7/8", "w-1/8", "w-0", "w-0", "w-0"].map((width, index) => (
              <div className="flex items-center gap-3" key={5 - index}>
                <span className="w-3 text-right text-muted-foreground text-xs">
                  {5 - index}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full bg-muted-foreground",
                      width
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {m.reviews.map((review) => (
            <article
              className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4"
              key={review.name}
            >
              <div aria-label="5 / 5" className="flex gap-1" role="img">
                {[0, 1, 2, 3, 4].map((star) => (
                  <HugeiconsIcon
                    className="size-3.5 text-primary [&_path]:fill-current"
                    icon={StarIcon}
                    key={star}
                  />
                ))}
              </div>
              <h3 className="font-semibold text-sm">{review.title}</h3>
              <p className="text-muted-foreground text-xs">{review.name}</p>
              <p className="text-sm leading-relaxed">{review.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="flex flex-wrap items-start justify-between gap-4 border-b pb-8">
        <div className="flex max-w-3xl flex-col gap-3">
          <h2 className="font-semibold text-xl">{m.whatsNew}</h2>
          <p className="font-medium text-sm">{m.releaseNote}</p>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground text-sm leading-relaxed">
            {m.releaseHighlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-end gap-2 text-sm">
          <a
            className="text-primary underline-offset-4 hover:underline"
            href="http://192.168.4.62/BPD_DIY_DEV_TOOLS/EIMI/releases/tag/v1.0.4"
            rel="noopener noreferrer"
            target="_blank"
          >
            {m.versionHistory}
          </a>
          <time className="text-muted-foreground" dateTime="2026-08-28">
            {new Intl.DateTimeFormat(locale, {
              dateStyle: "medium",
              timeZone: "UTC",
            }).format(new Date("2026-08-28T00:00:00Z"))}
          </time>
          <span className="text-muted-foreground">{m.version} 1.0.4</span>
        </div>
      </section>

      <section
        aria-labelledby="reader-privacy"
        className="flex flex-col gap-4 border-b pb-8"
      >
        <h2 className="font-semibold text-xl" id="reader-privacy">
          {m.privacy}
        </h2>
        <p className="text-muted-foreground text-sm">{m.privacyIntro}</p>
        <div className="flex max-w-xl flex-col items-center gap-4 rounded-2xl bg-muted/50 p-6 text-center">
          <HugeiconsIcon className="size-9 text-primary" icon={Shield01Icon} />
          <h3 className="font-semibold">{m.privacyTitle}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {m.privacyBody}
          </p>
        </div>
        <details className="max-w-xl text-sm">
          <summary className="cursor-pointer text-primary">
            {m.privacyDetails}
          </summary>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {m.privacySharing}
          </p>
        </details>
      </section>
      <section
        aria-labelledby="reader-accessibility"
        className="flex flex-col gap-4 border-b pb-8"
      >
        <h2 className="font-semibold text-xl" id="reader-accessibility">
          {m.accessibility}
        </h2>
        <p className="text-muted-foreground text-sm">{m.accessibilityIntro}</p>
        <div className="flex max-w-xl flex-col items-center gap-4 rounded-2xl bg-muted/50 p-6">
          <HugeiconsIcon
            className="size-9 text-primary"
            icon={Settings01Icon}
          />
          <h3 className="font-semibold">{m.accessibilityTitle}</h3>
          <ul className="grid w-full gap-4 text-sm sm:grid-cols-2">
            {m.accessibilityFeatures.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <p className="max-w-xl text-muted-foreground text-xs">
          {m.accessibilityNote}
        </p>
      </section>
      <section aria-labelledby="reader-information">
        <h2
          className="mb-4 font-semibold text-xl tracking-tight"
          id="reader-information"
        >
          {m.information}
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {information.map(([label, value]) => (
            <div className="flex flex-col gap-1 text-sm" key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
