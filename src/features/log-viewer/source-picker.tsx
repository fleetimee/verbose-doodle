import { useId } from "react";
import { useI18n } from "@/components/i18n-provider";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon, InputGroupText } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SourceProtocolIcon } from "@/features/log-viewer/source-protocol-icon";
import type { LogSource } from "@/features/log-viewer/types";

export function SourcePicker({
  selected,
  sources,
  onSelect,
}: {
  selected: LogSource;
  sources: LogSource[];
  onSelect: (id: string) => void;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  const protocolId = useId();
  const selectedProtocol = selected.protocol || "SMB";
  return (
    <Combobox
      filter={(source, query) =>
        `${source.name} ${source.host} ${source.protocol || "SMB"}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase())
      }
      isItemEqualToValue={(a, b) => a.id === b.id}
      items={sources}
      itemToStringLabel={(source) => source.name}
      onValueChange={(source) => {
        if (source) {
          onSelect(source.id);
        }
      }}
      value={selected}
    >
      <ComboboxInput
        aria-describedby={protocolId}
        autoComplete="off"
        className="w-full"
        id="log-source"
        placeholder={copy.searchSources}
        triggerLabel={copy.source}
      >
        <InputGroupAddon align="inline-start">
          <InputGroupText id={protocolId}>
            <SourceProtocolIcon protocol={selectedProtocol} />
            {selectedProtocol}
          </InputGroupText>
        </InputGroupAddon>
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>{copy.noSourcesFound}</ComboboxEmpty>
        <ScrollArea
          className="h-72 max-h-[calc(var(--available-height)-3rem)] group-data-empty/combobox-content:hidden"
          variant="visible"
        >
          <ComboboxList variant="scrollable">
            {(source: LogSource) => (
              <ComboboxItem key={source.id} value={source}>
                <SourceProtocolIcon protocol={source.protocol || "SMB"} />
                <div className="flex min-w-0 flex-col">
                  <span className="break-words">{source.name}</span>
                  <span className="break-all text-muted-foreground text-xs">
                    {source.protocol || "SMB"} · {source.host}
                  </span>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ScrollArea>
      </ComboboxContent>
    </Combobox>
  );
}
