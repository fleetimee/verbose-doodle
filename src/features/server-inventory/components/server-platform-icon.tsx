import { FaLinux, FaWindows } from "react-icons/fa";

export function ServerPlatformIcon({
  windows,
  className = "size-5",
}: {
  windows: boolean;
  className?: string;
}) {
  const Icon = windows ? FaWindows : FaLinux;
  return (
    <span
      aria-label={windows ? "Windows" : "Linux"}
      className="shrink-0"
      role="img"
    >
      <Icon aria-hidden="true" className={className} />
    </span>
  );
}
