import { useI18n } from "@/components/i18n-provider";
import { Field, FieldDescription } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SourceFieldLabel } from "@/features/log-viewer/source-field-label";
import {
  LOG_DATE_FORMATS,
  type LogSourceRequest,
} from "@/features/log-viewer/types";

export function SourceFilePatternOptions({
  request,
  disabled,
  prefix,
  portalContainer,
  onChange,
}: {
  request: LogSourceRequest;
  disabled: boolean;
  prefix: string;
  portalContainer: HTMLDivElement | null;
  onChange: (key: "dateFormat" | "rotationOrder", value: string) => void;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  const rotationLabels = {
    auto: copy.rotationAuto,
    ascending: copy.rotationAscending,
    descending: copy.rotationDescending,
  };
  return (
    <>
      <Field data-disabled={disabled}>
        <SourceFieldLabel
          field="dateFormat"
          htmlFor={`${prefix}-date-format`}
          portalContainer={portalContainer}
        />
        <Select
          disabled={disabled}
          onValueChange={(value) => onChange("dateFormat", value)}
          value={request.dateFormat}
        >
          <SelectTrigger className="w-full" id={`${prefix}-date-format`}>
            <SelectValue>
              {request.dateFormat === "modified"
                ? copy.modifiedDate
                : request.dateFormat}
            </SelectValue>
          </SelectTrigger>
          <SelectContent portalContainer={portalContainer}>
            <SelectGroup>
              {LOG_DATE_FORMATS.map((format) => (
                <SelectItem key={format} value={format}>
                  {format === "modified" ? copy.modifiedDate : format}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription>{copy.dateFormatHint}</FieldDescription>
      </Field>
      <Field data-disabled={disabled}>
        <SourceFieldLabel
          field="rotationOrder"
          htmlFor={`${prefix}-rotation-order`}
          portalContainer={portalContainer}
        />
        <Select
          disabled={disabled}
          onValueChange={(value) => onChange("rotationOrder", value)}
          value={request.rotationOrder}
        >
          <SelectTrigger className="w-full" id={`${prefix}-rotation-order`}>
            <SelectValue>{rotationLabels[request.rotationOrder]}</SelectValue>
          </SelectTrigger>
          <SelectContent portalContainer={portalContainer}>
            <SelectGroup>
              <SelectItem value="auto">{copy.rotationAuto}</SelectItem>
              <SelectItem value="ascending">
                {copy.rotationAscending}
              </SelectItem>
              <SelectItem value="descending">
                {copy.rotationDescending}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </>
  );
}
