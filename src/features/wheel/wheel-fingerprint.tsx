import { useId, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { verifyWheelHash, type WheelView } from "@/features/wheel/api";
import { copyToClipboard } from "@/lib/clipboard";
import { getErrorMessage } from "@/lib/error-handler";

const HASH_PATTERN = /^[0-9a-f]{64}$/i;

export function WheelFingerprint({ view }: { view: WheelView }) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  const prefix = useId();
  const [hash, setHash] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  if (!view.seal) {
    return (
      <p className="text-muted-foreground text-xs">{copy.hashCompleteFirst}</p>
    );
  }
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const candidate = hash.trim();
        if (!HASH_PATTERN.test(candidate) || pending) {
          return;
        }
        setPending(true);
        setResult(null);
        setError("");
        try {
          setResult(await verifyWheelHash(view.config.id, candidate));
        } catch (cause) {
          setError(getErrorMessage(cause));
        } finally {
          setPending(false);
        }
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${prefix}-saved`}>{copy.hashTitle}</FieldLabel>
          <Textarea
            className="resize-none"
            id={`${prefix}-saved`}
            readOnly
            rows={2}
            size="xs"
            value={view.evidence.head.hash}
            variant="mono-muted"
          />
          <div className="flex pt-1">
            <Button
              disabled={!view.verified}
              onClick={async () => {
                if (await copyToClipboard(view.evidence.head.hash)) {
                  toast.success(copy.hashCopied);
                } else {
                  toast.error(copy.hashCopyFailed);
                }
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              {copy.copyHash}
            </Button>
          </div>
          <FieldDescription>{copy.hashHint}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefix}-compare`}>
            {copy.hashInput}
          </FieldLabel>
          <Input
            autoCapitalize="none"
            autoComplete="off"
            disabled={pending}
            id={`${prefix}-compare`}
            maxLength={128}
            onChange={(event) => {
              setHash(event.target.value);
              setResult(null);
              setError("");
            }}
            placeholder={copy.hashPlaceholder}
            required
            spellCheck={false}
            value={hash}
          />
        </Field>
        <Button
          disabled={pending || !HASH_PATTERN.test(hash.trim())}
          size="sm"
          type="submit"
          variant="outline"
        >
          {pending && <Spinner />}
          {copy.checkHash}
        </Button>
        {result !== null && (
          <Alert variant={result ? "default" : "destructive"}>
            <AlertDescription>
              {result ? copy.hashMatch : copy.hashMismatch}
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </FieldGroup>
    </form>
  );
}
