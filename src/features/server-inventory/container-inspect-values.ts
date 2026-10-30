import type {
  ContainerInspectObject,
  ContainerInspectValue,
} from "@/features/server-inventory/types";

export function isInspectObject(
  value: ContainerInspectValue | undefined
): value is ContainerInspectObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isInspectString(
  value: ContainerInspectValue | undefined
): value is string {
  return typeof value === "string";
}
