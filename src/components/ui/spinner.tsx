import { cn } from "@/lib/utils"
import { messages } from "@/lib/i18n"
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

function Spinner({ className, ...props }: Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">) {
  return (
    <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} role="status" aria-label={messages.common.loading} className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
