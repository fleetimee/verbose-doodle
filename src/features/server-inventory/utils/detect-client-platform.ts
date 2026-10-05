const WINDOWS = /Windows/i;
const MACOS = /Macintosh|Mac OS X|iPhone|iPad|iPod/i;
const LINUX = /Linux|X11/i;

export function detectClientPlatform(): "windows" | "linux" | "macos" {
  if (typeof navigator === "undefined") {
    return "windows";
  }
  const userAgent = navigator.userAgent;
  if (WINDOWS.test(userAgent)) {
    return "windows";
  }
  if (MACOS.test(userAgent)) {
    return "macos";
  }
  if (LINUX.test(userAgent)) {
    return "linux";
  }
  return "windows";
}
