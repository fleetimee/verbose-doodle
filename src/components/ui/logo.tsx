import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface LogoProps extends Omit<ComponentPropsWithoutRef<"img">, "src"> {
  variant?: "main" | "icon" | "wordmark" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
}

export const APP_ICON_SRC = "/brand/biller-app-icon.png";

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
} as const;

const wordmarkSizes = {
  sm: "h-8 w-auto",
  md: "h-12 w-auto",
  lg: "h-16 w-auto",
  xl: "h-24 w-auto",
} as const;

/**
 * Logo component for Biller JSON Simulator
 *
 * @example
 * // Basic usage
 * <Logo variant="main" size="md" />
 *
 * @example
 * @example
 * // Icon variant for navbar
 * <Logo variant="icon" size="sm" />
 */
export function Logo({
  variant = "main",
  size = "md",
  className,
  alt = "Biller JSON Simulator",
  ...props
}: LogoProps) {
  const getLogoSrc = () => {
    if (variant === "wordmark") {
      return "/logo-wordmark.svg";
    }

    return APP_ICON_SRC;
  };

  const sizeClass =
    variant === "wordmark" ? wordmarkSizes[size] : sizeClasses[size];

  return (
    <img
      src={getLogoSrc()}
      alt={alt}
      className={cn(
        sizeClass,
        variant !== "wordmark" && "rounded-full",
        className
      )}
      width={variant === "wordmark" ? undefined : sizeClasses[size].split("-")[1]}
      height={sizeClasses[size].split("-")[1]}
      {...props}
    />
  );
}
