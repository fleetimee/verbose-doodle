import { useId, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreateWheel,
  type WheelMode,
  wheelModeSchema,
} from "@/features/wheel/api";
import { WheelPreview } from "@/features/wheel/wheel-preview";
import { getErrorMessage } from "@/lib/error-handler";

export function CreateWheelDrawer({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (request: CreateWheel) => Promise<void>;
}) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  const prefix = useId();
  const [title, setTitle] = useState("");
  const [entries, setEntries] = useState("");
  const [mode, setMode] = useState<WheelMode>("WITHOUT_REPLACEMENT");
  const [limit, setLimit] = useState(10);
  const [duration, setDuration] = useState(5);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const count = entries.split("\n").filter((entry) => entry.trim()).length;
  return (
    <Drawer
      direction="right"
      dismissible={!pending}
      onOpenChange={(open) => {
        if (!(open || pending)) {
          onClose();
        }
      }}
      open
      shouldScaleBackground={false}
    >
      <DrawerContent
        className="overflow-hidden data-[vaul-drawer-direction=right]:w-[calc(100%-1rem)] data-[vaul-drawer-direction=right]:sm:max-w-4xl"
        ref={setContainer}
        showSwipeHandle={false}
      >
        <DrawerHeader size="lg" variant="left">
          <DrawerTitle>{copy.create}</DrawerTitle>
          <DrawerDescription>{copy.lockHint}</DrawerDescription>
        </DrawerHeader>
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          data-vaul-no-drag
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            const names = entries
              .split("\n")
              .map((entry) => entry.trim())
              .filter(Boolean);
            if (
              names.length < 2 ||
              names.length > 100 ||
              new Set(names.map((name) => name.toLowerCase())).size !==
                names.length
            ) {
              setError(copy.entriesInvalid);
              return;
            }
            const drawLimit = mode === "SINGLE" ? 1 : limit;
            if (
              names.some((name) => name.length > 100) ||
              !Number.isInteger(drawLimit) ||
              drawLimit < 1 ||
              drawLimit > 200 ||
              !Number.isInteger(duration) ||
              duration < 2 ||
              duration > 12
            ) {
              setError(copy.settingsInvalid);
              return;
            }
            setPending(true);
            try {
              await onCreate({
                title,
                entries: names,
                mode,
                drawLimit,
                durationSeconds: duration,
              });
            } catch (cause) {
              setError(getErrorMessage(cause));
            } finally {
              setPending(false);
            }
          }}
        >
          <ScrollArea className="min-h-0 flex-1">
            <div className="grid gap-6 p-6 lg:grid-cols-2">
              <FieldGroup size="compact">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Field>
                  <FieldLabel htmlFor={`${prefix}-title`}>
                    {copy.sessionTitle}
                  </FieldLabel>
                  <Input
                    disabled={pending}
                    id={`${prefix}-title`}
                    maxLength={150}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={copy.titlePlaceholder}
                    required
                    value={title}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${prefix}-entries`}>
                    {copy.entries}
                  </FieldLabel>
                  <Textarea
                    disabled={pending}
                    id={`${prefix}-entries`}
                    maxLength={10_100}
                    onChange={(event) => setEntries(event.target.value)}
                    placeholder={copy.entriesPlaceholder}
                    required
                    rows={10}
                    value={entries}
                  />
                  <FieldDescription>
                    {copy.entriesHint} · {count}/100
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${prefix}-mode`}>
                    {copy.rules}
                  </FieldLabel>
                  <Select
                    disabled={pending}
                    onValueChange={(value) =>
                      setMode(wheelModeSchema.parse(value))
                    }
                    value={mode}
                  >
                    <SelectTrigger className="w-full" id={`${prefix}-mode`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent portalContainer={container}>
                      <SelectGroup>
                        {wheelModeSchema.options.map((value) => (
                          <SelectItem key={value} value={value}>
                            {copy.modes[value]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <FieldGroup className="grid grid-cols-2" size="compact">
                  <Field>
                    <FieldLabel htmlFor={`${prefix}-limit`}>
                      {copy.drawLimit}
                    </FieldLabel>
                    <Input
                      disabled={pending || mode === "SINGLE"}
                      id={`${prefix}-limit`}
                      inputMode="numeric"
                      maxLength={3}
                      onChange={(event) => setLimit(Number(event.target.value))}
                      pattern="[0-9]{1,3}"
                      required
                      value={mode === "SINGLE" ? 1 : limit}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${prefix}-duration`}>
                      {copy.duration}
                    </FieldLabel>
                    <Input
                      disabled={pending}
                      id={`${prefix}-duration`}
                      inputMode="numeric"
                      maxLength={2}
                      onChange={(event) =>
                        setDuration(Number(event.target.value))
                      }
                      pattern="[0-9]{1,2}"
                      required
                      value={duration}
                    />
                  </Field>
                </FieldGroup>
                <FieldDescription>{copy.equalOdds}</FieldDescription>
              </FieldGroup>
              <WheelPreview entries={entries} />
            </div>
          </ScrollArea>
          <DrawerFooter size="lg" variant="bordered">
            <div className="flex justify-end gap-2">
              <Button
                disabled={pending}
                onClick={onClose}
                type="button"
                variant="outline"
              >
                {copy.cancel}
              </Button>
              <Button disabled={pending} type="submit">
                {pending && <Spinner />}
                {copy.createAndLock}
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
