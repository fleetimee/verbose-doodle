import { CloudUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { CheckCircle, Trash2 } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  decodeQrImage,
  QrImageError,
  type QrImageErrorCode,
} from "@/features/developer-tools/tools/qris-parser/decode-qr-image";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SelectedImage = { readonly name: string; readonly preview: string };

export function QrImageInput({
  onDecode,
  onRemove,
  onProcessing,
}: {
  readonly onDecode: (payload: string) => void;
  readonly onRemove: () => void;
  readonly onProcessing: (processing: boolean) => void;
}) {
  const copy = messages.developerTools.qris;
  const request = useRef(0);
  const previewUrl = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<QrImageErrorCode | "imageSingle" | null>(
    null
  );
  const [selected, setSelected] = useState<SelectedImage | null>(null);
  useEffect(
    () => () => {
      request.current += 1;
      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current);
      }
    },
    []
  );

  function clearPreview() {
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
    }
    previewUrl.current = null;
    setSelected(null);
  }

  async function readImage(file: File) {
    const id = ++request.current;
    clearPreview();
    previewUrl.current = URL.createObjectURL(file);
    setSelected({ name: file.name, preview: previewUrl.current });
    setBusy(true);
    onProcessing(true);
    setError(null);
    try {
      const payload = await decodeQrImage(file);
      if (request.current === id) {
        onDecode(payload);
      }
    } catch (cause) {
      if (request.current === id) {
        setError(
          cause instanceof QrImageError ? cause.code : "imageUnreadable"
        );
      }
    } finally {
      if (request.current === id) {
        setBusy(false);
        onProcessing(false);
      }
    }
  }

  function rejectImage(rejections: FileRejection[]) {
    request.current += 1;
    clearPreview();
    setBusy(false);
    onProcessing(false);
    const code = rejections[0]?.errors[0]?.code;
    if (code === "too-many-files") {
      setError("imageSingle");
    } else {
      setError(code === "file-too-large" ? "imageSize" : "imageType");
    }
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDropAccepted: (files) => {
      const file = files[0];
      if (file) {
        readImage(file);
      }
    },
    onDropRejected: rejectImage,
  });

  return (
    <Field data-invalid={Boolean(error)} size="sm">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor="qris-image">{copy.upload}</FieldLabel>
        {selected ? (
          <Button
            aria-label={copy.removeImage}
            onClick={onRemove}
            size="icon-xs"
            variant="tool-destructive-ghost"
          >
            <Trash2 data-icon="inline-start" />
          </Button>
        ) : null}
      </div>
      <input
        {...getInputProps({
          id: "qris-image",
          "aria-label": copy.upload,
          "aria-describedby": "qris-image-status",
          "aria-invalid": Boolean(error),
        })}
      />
      <Button
        {...getRootProps({ role: "button", tabIndex: 0 })}
        aria-describedby="qris-image-hint qris-image-status"
        aria-label={selected ? copy.replaceImage : copy.chooseImage}
        className={cn(
          "h-auto min-h-24 w-full justify-start gap-3 whitespace-normal px-4 py-3 text-left",
          isDragActive && "ring-2 ring-ring"
        )}
        onClick={open}
        type="button"
        variant="dashed"
      >
        {selected ? (
          <img
            alt={copy.previewAlt}
            className="size-16 shrink-0 rounded-md object-contain"
            height={64}
            src={selected.preview}
            width={64}
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background">
            <HugeiconsIcon
              className="size-5 text-muted-foreground"
              icon={CloudUploadIcon}
            />
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate">
            {selected ? selected.name : copy.dropImage}
          </span>
          <span className="text-muted-foreground text-xs">
            {selected ? copy.replaceHint : copy.browseHint}
          </span>
          {selected && !busy && !error ? (
            <span className="flex items-center gap-1.5 text-primary text-xs">
              <CheckCircle className="size-3.5" />
              {copy.imageDecoded}
            </span>
          ) : null}
        </span>
        {busy ? <Spinner size="sm" /> : null}
      </Button>
      <FieldDescription id="qris-image-hint">{copy.imageHint}</FieldDescription>
      <div aria-live="polite" id="qris-image-status">
        {error ? <FieldError>{copy[error]}</FieldError> : null}
        {busy ? (
          <FieldDescription>{copy.imageDecoding}</FieldDescription>
        ) : null}
      </div>
    </Field>
  );
}
