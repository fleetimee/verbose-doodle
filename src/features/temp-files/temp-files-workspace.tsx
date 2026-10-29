import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { FileClock, MonitorUp, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/features/auth/context";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import {
  deleteTempFile,
  fetchTempFiles,
  formatFileBytes,
  uploadTempFile,
} from "@/features/temp-files/api";
import { TempFileRow } from "@/features/temp-files/temp-file-row";
import { getErrorMessage } from "@/lib/error-handler";
import { formatMessage, messages } from "@/lib/i18n";

function storageFull(
  data: Awaited<ReturnType<typeof fetchTempFiles>> | undefined
) {
  return data
    ? data.usedBytes >= data.quotaBytes || data.storedFiles >= data.maxFiles
    : false;
}

export function TempFilesWorkspace() {
  const { locale } = useI18n();
  const { snapshot } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["temp-files", snapshot.user?.user_id];
  const listing = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchTempFiles(signal),
    refetchInterval: 30_000,
    staleTime: 0,
  });
  const [retention, setRetention] = useState("24");
  const [current, setCurrent] = useState<{
    name: string;
    percent: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now);
  const controller = useRef<AbortController | null>(null);
  const text = messages.tempFiles;
  const data = listing.data;
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(timer);
      controller.current?.abort();
    };
  }, []);
  const deletion = useMutation({
    mutationFn: deleteTempFile,
    retry: false,
    onSuccess: () => {
      toast.success(messages.tempFiles.deleted);
      return queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const upload = async (selected: File[]) => {
    if (!selected?.length || controller.current || !data) {
      return;
    }
    const abort = new AbortController();
    controller.current = abort;
    setUploadError(null);
    try {
      for (const file of Array.from(selected)) {
        if (abort.signal.aborted) {
          break;
        }
        if (file.size === 0 || file.size > data.maxFileBytes) {
          setUploadError(
            formatMessage(text.invalid, {
              size: formatFileBytes(data.maxFileBytes, locale),
            })
          );
          break;
        }
        setCurrent({ name: file.name, percent: 0 });
        await uploadTempFile(file, Number(retention), abort.signal, (percent) =>
          setCurrent({ name: file.name, percent })
        );
        toast.success(text.uploaded, { description: file.name });
        await queryClient.invalidateQueries({ queryKey });
      }
    } catch (error) {
      if (abort.signal.aborted) {
        toast.info(text.cancelled);
      } else {
        setUploadError(`${text.uploadError} ${getErrorMessage(error)}`);
      }
    } finally {
      controller.current = null;
      setCurrent(null);
      await queryClient.invalidateQueries({ queryKey });
    }
  };
  const full = storageFull(data);
  const showFiles = data && !listing.isError;
  const disabled = !data || Boolean(current) || full || listing.isError;
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    disabled,
    noClick: true,
    noKeyboard: true,
    onDrop: (files) => {
      upload(files);
    },
  });
  return (
    <DeveloperToolLayout
      categoryHref="/dashboard/overview"
      categoryLabel={messages.common.navWorkspace}
      className="min-h-0 flex-1 gap-3 pb-0 [&>header]:shrink-0 [&>header]:border-b-0 [&>header]:pb-2"
      description={text.description}
      extraActions={
        <Button
          disabled={listing.isFetching}
          onClick={() => listing.refetch()}
          size="sm"
          variant="tool-action"
        >
          <RefreshCw data-icon="inline-start" />
          {text.refresh}
        </Button>
      }
      mainClassName="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(340px,0.8fr)_minmax(0,1.2fr)] lg:grid-rows-1"
      title={text.title}
    >
      <section
        aria-labelledby="temp-upload-title"
        className="flex min-h-0 min-w-0 flex-col gap-3 rounded-lg bg-muted/20 p-3 sm:p-4 lg:gap-4 lg:self-start"
      >
        <h2 className="font-medium text-sm" id="temp-upload-title">
          {text.uploadTitle}
        </h2>
        <input
          {...getInputProps({
            "aria-label": text.choose,
            "aria-describedby": "temp-upload-limits",
          })}
        />
        <Button
          {...getRootProps({ role: "button", tabIndex: 0 })}
          aria-describedby="temp-upload-limits"
          className="min-h-24 w-full shrink-0 justify-center whitespace-normal"
          disabled={disabled}
          onClick={open}
          size="upload"
          type="button"
          variant={isDragActive ? "secondary" : "outline"}
        >
          <MonitorUp data-icon="inline-start" />
          <span>{text.selectOrDrop}</span>
        </Button>
        <p className="text-muted-foreground text-xs" id="temp-upload-limits">
          {data
            ? formatMessage(text.limits, {
                size: formatFileBytes(data.maxFileBytes, locale),
                count: data.maxFiles,
              })
            : text.runtime}
        </p>
        <FieldGroup>
          <Field size="sm">
            <FieldLabel id="temp-expiry-label">{text.expiry}</FieldLabel>
            <ToggleGroup
              aria-labelledby="temp-expiry-label"
              className="w-full"
              disabled={Boolean(current)}
              onValueChange={(values) => {
                if (values.length) {
                  setRetention(values[0]);
                }
              }}
              size="lg"
              value={[retention]}
              variant="outline"
            >
              <ToggleGroupItem className="flex-1" value="1">
                {text.hour}
              </ToggleGroupItem>
              <ToggleGroupItem className="flex-1" value="24">
                {text.day}
              </ToggleGroupItem>
              <ToggleGroupItem className="flex-1" value="168">
                {text.week}
              </ToggleGroupItem>
            </ToggleGroup>
            <FieldDescription>{text.privacy}</FieldDescription>
          </Field>
        </FieldGroup>
        {data ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs tabular-nums">
              {formatMessage(text.usage, {
                used: formatFileBytes(data.usedBytes, locale),
                total: formatFileBytes(data.quotaBytes, locale),
              })}
            </p>
            <Progress
              aria-label={text.title}
              className="h-1.5"
              max={data.quotaBytes}
              value={data.usedBytes}
            />
            <p className="text-muted-foreground text-xs leading-relaxed">
              {text.cleanup}
            </p>
          </div>
        ) : null}
        {current ? (
          <div aria-live="polite" className="flex flex-col gap-2" role="status">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-xs">
                {current.percent === 100
                  ? text.processing
                  : formatMessage(text.uploading, { name: current.name })}
              </p>
              <Button
                onClick={() => controller.current?.abort()}
                size="sm"
                variant="outline"
              >
                {text.cancel}
              </Button>
            </div>
            <Progress
              aria-label={formatMessage(text.uploading, { name: current.name })}
              className="h-1.5"
              max={100}
              value={current.percent}
            />
          </div>
        ) : null}
        {uploadError || full ? (
          <Alert variant="destructive">
            <AlertTitle>{full ? text.quota : text.uploadError}</AlertTitle>
            {uploadError ? (
              <AlertDescription>{uploadError}</AlertDescription>
            ) : null}
          </Alert>
        ) : null}
      </section>
      <section
        aria-labelledby="temp-files-title"
        className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border/60"
      >
        <h2
          className="shrink-0 border-border/60 border-b px-4 py-3 font-medium text-sm"
          id="temp-files-title"
        >
          {text.myFiles}
        </h2>
        <ScrollArea className="min-h-0 flex-1" variant="fit">
          <div className="px-4">
            {listing.isPending ? (
              <div aria-busy="true" className="flex flex-col gap-4 py-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : null}
            {listing.isError ? (
              <Alert className="my-4">
                <AlertTitle>{text.loadError}</AlertTitle>
                <AlertDescription>
                  <Button
                    onClick={() => listing.refetch()}
                    size="sm"
                    variant="outline"
                  >
                    {text.retry}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
            {showFiles ? (
              <ul className="min-w-0">
                {data.items.map((file) => (
                  <TempFileRow
                    deleting={deletion.isPending}
                    file={file}
                    key={file.id}
                    locale={locale}
                    now={now}
                    onDelete={async (id) => {
                      try {
                        await deletion.mutateAsync(id);
                        return true;
                      } catch {
                        return false;
                      }
                    }}
                  />
                ))}
              </ul>
            ) : null}
            {showFiles && data.items.length === 0 ? (
              <Empty variant="plain">
                <EmptyHeader>
                  <FileClock
                    aria-hidden="true"
                    className="mb-2 size-6 text-muted-foreground"
                  />
                  <EmptyTitle>{text.emptyTitle}</EmptyTitle>
                  <EmptyDescription>{text.emptyDescription}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : null}
          </div>
        </ScrollArea>
      </section>
    </DeveloperToolLayout>
  );
}
