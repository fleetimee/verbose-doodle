"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { Iso8583Field, Iso8583FieldKind } from "../pack-iso8583";
import {
  SITUATIONAL_CATALOG,
  type SituationalCatalogItem,
} from "../situational-catalog";

export interface AddFieldDialogProps {
  readonly currentFields?: readonly Iso8583Field[];
  readonly existingFieldNumbers?: readonly number[];
  readonly onAddField: (field: Iso8583Field) => void;
  readonly onRemoveField?: (fieldNumber: number) => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

function SituationalItemCard({
  item,
  isAdded,
  isRemovable = true,
  onAdd,
  onRemove,
}: {
  readonly item: SituationalCatalogItem;
  readonly isAdded: boolean;
  readonly isRemovable?: boolean;
  readonly onAdd: () => void;
  readonly onRemove?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border p-3.5 transition-colors",
        isAdded
          ? "border-primary/20 bg-primary/5 dark:bg-primary/10"
          : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className="font-mono text-xs"
            variant={isAdded ? "default" : "secondary"}
          >
            Bit {item.bit}
          </Badge>
          {isAdded ? (
            <Badge
              className="border-emerald-500/30 bg-emerald-500/10 font-medium text-[10px] text-emerald-600 dark:text-emerald-400"
              variant="outline"
            >
              Added
            </Badge>
          ) : null}
          <span className="font-medium text-foreground text-xs leading-none">
            {item.name}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {item.kind.toUpperCase()}({item.length})
          </span>
        </div>
        <p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
          {item.description}
        </p>
        {item.defaultValue ? (
          <p className="mt-1 font-mono text-[11px] text-muted-foreground/80">
            Default:{" "}
            <span className="text-foreground">{item.defaultValue}</span>
          </p>
        ) : null}
      </div>
      {isAdded ? (
        isRemovable && onRemove ? (
          <Button
            aria-label={`Remove bit ${item.bit} from message`}
            className="mt-0.5 size-8 shrink-0 rounded-lg border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
            onClick={onRemove}
            size="icon"
            type="button"
            variant="outline"
          >
            <Trash2 className="size-4" />
          </Button>
        ) : (
          <Button
            aria-label={`Bit ${item.bit} is a standard preset field`}
            className="mt-0.5 size-8 shrink-0 cursor-default border-transparent bg-primary/10 text-primary hover:bg-primary/10"
            disabled
            size="icon"
            type="button"
            variant="ghost"
          >
            <Check className="size-4 text-emerald-500" />
          </Button>
        )
      ) : (
        <Button
          aria-label={`Add bit ${item.bit} to message`}
          className="mt-0.5 size-8 shrink-0 rounded-lg transition-all hover:bg-primary hover:text-primary-foreground"
          onClick={onAdd}
          size="icon"
          type="button"
          variant="outline"
        >
          <Plus className="size-4" />
        </Button>
      )}
    </div>
  );
}

function SituationalFieldsList({
  currentFields,
  existingFieldNumbers,
  onAddCatalogItem,
  onRemoveCatalogItem,
}: {
  readonly currentFields?: readonly Iso8583Field[];
  readonly existingFieldNumbers: readonly number[];
  readonly onAddCatalogItem: (item: SituationalCatalogItem) => void;
  readonly onRemoveCatalogItem?: (bit: number) => void;
}) {
  const [search, setSearch] = useState("");

  const addedBits = useMemo(
    () => new Set(existingFieldNumbers),
    [existingFieldNumbers]
  );

  const customFields = useMemo(() => {
    if (!currentFields) return [];
    return currentFields.filter(
      (f) => f.isCustom && !SITUATIONAL_CATALOG.some((c) => c.bit === f.number)
    );
  }, [currentFields]);

  const filteredCustomFields = useMemo(() => {
    if (!customFields.length) return [];
    const q = search.trim().toLowerCase();
    if (!q) return customFields;
    return customFields.filter(
      (f) =>
        f.number.toString().includes(q) ||
        f.label.toLowerCase().includes(q) ||
        f.value?.toLowerCase().includes(q)
    );
  }, [customFields, search]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return SITUATIONAL_CATALOG;
    }
    return SITUATIONAL_CATALOG.filter(
      (item) =>
        item.bit.toString().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [search]);

  const currentFieldMap = useMemo(() => {
    if (!currentFields) return new Map<number, Iso8583Field>();
    return new Map(currentFields.map((f) => [f.number, f]));
  }, [currentFields]);

  const totalMatching = filteredItems.length + filteredCustomFields.length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="shrink-0 px-4 pt-1">
        <Input
          className="h-9 text-xs"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bits by name, number, or description..."
          value={search}
        />
      </div>

      <ScrollArea className="min-h-0 flex-1 px-4">
        <div className="flex flex-col gap-2 pb-4">
          {filteredCustomFields.length > 0 ? (
            <div className="mb-2 flex flex-col gap-2">
              <div className="px-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                Custom elements ({filteredCustomFields.length})
              </div>
              {filteredCustomFields.map((field) => (
                <div
                  className="flex items-start justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 transition-colors dark:bg-primary/10"
                  key={field.number}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="font-mono text-xs" variant="default">
                        Bit {field.number}
                      </Badge>
                      <Badge
                        className="border-primary/30 bg-primary/10 font-medium text-[10px] text-primary"
                        variant="outline"
                      >
                        Custom
                      </Badge>
                      <span className="font-medium text-foreground text-xs leading-none">
                        {field.label}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {field.kind.toUpperCase()}({field.length})
                      </span>
                    </div>
                    {field.value ? (
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground/80">
                        Value: <span className="text-foreground">{field.value}</span>
                      </p>
                    ) : null}
                  </div>
                  {onRemoveCatalogItem ? (
                    <Button
                      aria-label={`Remove bit ${field.number} from message`}
                      className="mt-0.5 size-8 shrink-0 rounded-lg border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                      onClick={() => onRemoveCatalogItem(field.number)}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
              <div className="my-1.5 h-px bg-border/60" />
            </div>
          ) : null}

          {totalMatching === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs">
              No matching fields found in catalog.
            </div>
          ) : (
            filteredItems.map((item) => {
              const field = currentFieldMap.get(item.bit);
              const isAdded = addedBits.has(item.bit);
              const isRemovable = field ? Boolean(field.isCustom) : true;

              return (
                <SituationalItemCard
                  isAdded={isAdded}
                  isRemovable={isRemovable}
                  item={item}
                  key={item.bit}
                  onAdd={() => onAddCatalogItem(item)}
                  onRemove={
                    onRemoveCatalogItem
                      ? () => onRemoveCatalogItem(item.bit)
                      : undefined
                  }
                />
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function CustomFieldForm({
  existingFieldNumbers,
  onAddCustomField,
  onCancel,
}: {
  readonly existingFieldNumbers: readonly number[];
  readonly onAddCustomField: (field: Iso8583Field) => void;
  readonly onCancel?: () => void;
}) {
  const [bitNumber, setBitNumber] = useState<number>(48);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Iso8583FieldKind>("lllvar");
  const [length, setLength] = useState<number>(999);
  const [initialValue, setInitialValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const existingBits = useMemo(
    () => new Set(existingFieldNumbers),
    [existingFieldNumbers]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bitNumber < 2 || bitNumber > 128) {
      setError("Bit number must be between 2 and 128");
      return;
    }
    if (existingBits.has(bitNumber)) {
      setError(`Bit ${bitNumber} is already in the message`);
      return;
    }
    if (!name.trim()) {
      setError("Field name is required");
      return;
    }
    if (length <= 0) {
      setError("Field length must be greater than 0");
      return;
    }

    const newField: Iso8583Field = {
      enabled: true,
      isCustom: true,
      kind,
      label: name.trim(),
      length,
      number: bitNumber,
      value: initialValue,
    };

    onAddCustomField(newField);
    setError(null);
  };

  return (
    <form className="flex h-full min-h-0 flex-col" onSubmit={handleSubmit}>
      <ScrollArea className="min-h-0 flex-1 px-4">
        <div className="flex flex-col gap-4 py-2">
          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="custom-bit-number">
                Bit Number (2–128)
              </Label>
              <Input
                className="h-9 font-mono text-xs"
                id="custom-bit-number"
                max={128}
                min={2}
                onChange={(e) => {
                  setBitNumber(Number(e.target.value));
                  setError(null);
                }}
                required
                type="number"
                value={bitNumber}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="custom-bit-kind">
                Format / Type
              </Label>
              <Select
                onValueChange={(val) => {
                  const newKind = val as Iso8583FieldKind;
                  setKind(newKind);
                  if (newKind === "llvar" && length > 99) {
                    setLength(99);
                  }
                  if (newKind === "lllvar" && length < 100) {
                    setLength(999);
                  }
                }}
                value={kind}
              >
                <SelectTrigger className="h-9 text-xs" id="custom-bit-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="n">n (Numeric fixed)</SelectItem>
                  <SelectItem value="ans">ans (Alphanumeric fixed)</SelectItem>
                  <SelectItem value="llvar">llvar (Variable max 99)</SelectItem>
                  <SelectItem value="lllvar">
                    lllvar (Variable max 999)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="custom-bit-name">
              Field Name / Description
            </Label>
            <Input
              className="h-9 text-xs"
              id="custom-bit-name"
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Additional Data - Private"
              required
              value={name}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="custom-bit-length">
              Maximum Length / Capacity
            </Label>
            <Input
              className="h-9 font-mono text-xs"
              id="custom-bit-length"
              min={1}
              onChange={(e) => setLength(Number(e.target.value))}
              required
              type="number"
              value={length}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="custom-bit-val">
              Initial Value (optional)
            </Label>
            <Input
              className="h-9 font-mono text-xs"
              id="custom-bit-val"
              onChange={(e) => setInitialValue(e.target.value)}
              placeholder="Enter initial field content..."
              value={initialValue}
            />
          </div>
        </div>
      </ScrollArea>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t px-4 pt-3 pb-1">
        {onCancel ? (
          <Button
            className="h-8 text-xs"
            onClick={onCancel}
            type="button"
            variant="ghost"
          >
            Back to Situational Fields
          </Button>
        ) : null}
        <Button className="h-8 text-xs" type="submit">
          Add Bit {bitNumber} to Message
        </Button>
      </div>
    </form>
  );
}

export function AddFieldDialog({
  currentFields,
  existingFieldNumbers,
  onAddField,
  onRemoveField,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: AddFieldDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);
  const isMobile = useIsMobile();
  const drawerDirection = isMobile ? "bottom" : "right";

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) {
      setControlledOpen?.(val);
    } else {
      setUncontrolledOpen(val);
    }
  };

  const existingNumbers = useMemo(() => {
    if (existingFieldNumbers) {
      return existingFieldNumbers;
    }
    if (currentFields) {
      return currentFields.map((f) => f.number);
    }
    return [];
  }, [existingFieldNumbers, currentFields]);

  const handleAddCatalogItem = (item: SituationalCatalogItem) => {
    const field: Iso8583Field = {
      enabled: true,
      isCustom: true,
      kind: item.kind,
      label: item.name,
      length: item.length,
      number: item.bit,
      value: item.defaultValue ?? "",
    };
    onAddField(field);
  };

  const handleAddCustom = (field: Iso8583Field) => {
    onAddField(field);
    setNestedOpen(false);
    setOpen(false);
  };

  return (
    <Drawer
      direction={drawerDirection}
      onOpenChange={setOpen}
      open={open}
      shouldScaleBackground={false}
    >
      <DrawerTrigger asChild>
        <Button
          aria-label="Add field"
          className="gap-1.5"
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="size-4" />
          Add field
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          "flex flex-col border shadow-2xl",
          isMobile
            ? "inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl"
            : "top-2 right-2 bottom-2 h-[calc(100vh-1rem)] w-full rounded-2xl sm:max-w-lg"
        )}
        showSwipeHandle={isMobile}
      >
        <DrawerHeader className="shrink-0 px-4 pt-4 pb-2 text-left">
          <DrawerTitle className="font-semibold text-base tracking-tight">
            Add ISO 8583 Data Element
          </DrawerTitle>
          <DrawerDescription className="text-muted-foreground text-xs">
            Add standard situational fields (Bits 2–128) or configure custom
            bits.
          </DrawerDescription>

          <div className="mt-3">
            <Drawer
              direction={drawerDirection}
              nested
              onOpenChange={setNestedOpen}
              open={nestedOpen}
            >
              <DrawerTrigger asChild>
                <Button
                  className="h-auto w-full justify-between rounded-xl border border-dashed bg-muted/20 px-3.5 py-2.5 font-medium text-xs transition-colors hover:border-primary/50 hover:bg-muted/50"
                  type="button"
                  variant="outline"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="size-3.5 text-primary" />
                    <span>Configure Custom Bit (Bits 2–128)</span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Open Drawer →
                  </span>
                </Button>
              </DrawerTrigger>

              <DrawerContent
                className={cn(
                  "flex flex-col border shadow-2xl",
                  isMobile
                    ? "inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl"
                    : "top-2 right-2 bottom-2 h-[calc(100vh-1rem)] w-full rounded-2xl sm:max-w-md"
                )}
                showSwipeHandle={isMobile}
              >
                <DrawerHeader className="shrink-0 px-4 pt-4 pb-2 text-left">
                  <DrawerTitle className="font-semibold text-base tracking-tight">
                    Custom ISO 8583 Field
                  </DrawerTitle>
                  <DrawerDescription className="text-muted-foreground text-xs">
                    Specify custom bit definition, type format, and max length.
                  </DrawerDescription>
                </DrawerHeader>

                <div className="flex min-h-0 flex-1 flex-col">
                  <CustomFieldForm
                    existingFieldNumbers={existingNumbers}
                    onAddCustomField={handleAddCustom}
                    onCancel={() => setNestedOpen(false)}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SituationalFieldsList
            currentFields={currentFields}
            existingFieldNumbers={existingNumbers}
            onAddCatalogItem={handleAddCatalogItem}
            onRemoveCatalogItem={onRemoveField}
          />
        </div>

        <DrawerFooter className="shrink-0 border-t p-3">
          <DrawerClose asChild>
            <Button className="h-8 w-full rounded-lg text-xs" variant="outline">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
