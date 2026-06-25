import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type EndpointPathTitleProps = {
  readonly path: string;
};

export function EndpointPathTitle({ path }: EndpointPathTitleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block truncate font-mono text-sm leading-snug">
          {path}
        </span>
      </TooltipTrigger>
      <TooltipContent
        className="max-w-[min(520px,calc(100vw-2rem))] break-all font-mono leading-relaxed"
        side="top"
        sideOffset={8}
      >
        {path}
      </TooltipContent>
    </Tooltip>
  );
}
