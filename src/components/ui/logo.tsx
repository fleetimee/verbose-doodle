import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface LogoProps extends Omit<ComponentPropsWithoutRef<"img">, "src"> {
  variant?: "main" | "icon" | "wordmark" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Theme mode - can be manually set or use 'auto' to detect from media query
   * @default "light"
   */
  theme?: "light" | "dark" | "auto";
}

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
 * // With theme detection
 * <Logo variant="main" size="lg" theme="auto" />
 *
 * @example
 * // Icon variant for navbar
 * <Logo variant="icon" size="sm" />
 */
export function Logo({
  variant = "main",
  size = "md",
  theme = "light",
  className,
  alt = "Biller JSON Simulator",
  ...props
}: LogoProps) {
  const getLogoSrc = () => {
    if (variant === "icon") {
      return "/logo-icon.svg";
    }

    if (variant === "wordmark") {
      return "/logo-wordmark.svg";
    }

    if (variant === "dark") {
      return "/logo-dark.svg";
    }

    // For main variant, determine theme
    if (variant === "main") {
      // If theme is auto, use media query detection
      if (theme === "auto" && typeof window !== "undefined") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return isDark ? "/logo-dark.svg" : "/logo.svg";
      }

      // Use explicit theme
      return theme === "dark" ? "/logo-dark.svg" : "/logo.svg";
    }

    return "/logo.svg";
  };

  const sizeClass =
    variant === "wordmark" ? wordmarkSizes[size] : sizeClasses[size];

  return (
    <img
      src={getLogoSrc()}
      alt={alt}
      className={cn(sizeClass, className)}
      width={variant === "wordmark" ? undefined : sizeClasses[size].split("-")[1]}
      height={sizeClasses[size].split("-")[1]}
      {...props}
    />
  );
}
