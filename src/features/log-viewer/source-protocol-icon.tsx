import { Linux } from "developer-icons";
import type { LogSource } from "@/features/log-viewer/types";

export function SourceProtocolIcon({
  protocol,
}: {
  protocol: LogSource["protocol"];
}) {
  if (protocol === "SFTP") {
    return <Linux aria-hidden="true" size={20} />;
  }
  return (
    <img
      alt=""
      aria-hidden="true"
      height={16}
      src="/brand/windows-logo.svg"
      width={16}
    />
  );
}
