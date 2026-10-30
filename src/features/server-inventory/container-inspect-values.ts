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

export function inspectImageId(
  inspect: ContainerInspectObject | null | undefined
): string | undefined {
  const image = inspect?.Image;
  if (isInspectString(image) && image.startsWith("sha256:")) {
    return image;
  }
  return undefined;
}
