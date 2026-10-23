import { useId, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { revokeWheelShare, shareWheel } from "@/features/wheel/api";
import { copyToClipboard } from "@/lib/clipboard";
import { getErrorMessage } from "@/lib/error-handler";

export function WheelShare({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  const prefix = useId();
  const [link, setLink] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={prefix}>{copy.shareTitle}</FieldLabel>
        <FieldDescription>{copy.shareHint}</FieldDescription>
        {link && <Input id={prefix} readOnly value={link} />}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            disabled={pending || disabled}
            onClick={async () => {
              setPending(true);
              try {
                const token = await shareWheel(id);
                const url = new URL(
                  `/wheel/results/${token}`,
                  window.location.origin
                ).href;
                setLink(url);
                if (await copyToClipboard(url)) {
                  toast.success(copy.shareCopied);
                } else {
                  toast.error(copy.hashCopyFailed);
                }
              } catch (cause) {
                toast.error(getErrorMessage(cause));
              } finally {
                setPending(false);
              }
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            {pending && <Spinner />}
            {copy.copyShare}
          </Button>
          <Button
            disabled={pending || disabled}
            onClick={async () => {
              setPending(true);
              try {
                await revokeWheelShare(id);
                setLink("");
                toast.success(copy.shareRevoked);
              } catch (cause) {
                toast.error(getErrorMessage(cause));
              } finally {
                setPending(false);
              }
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            {copy.revokeShare}
          </Button>
        </div>
      </Field>
    </FieldGroup>
  );
}
