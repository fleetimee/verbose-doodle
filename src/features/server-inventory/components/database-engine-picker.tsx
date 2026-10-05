import { useState } from "react";
import { Check, ChevronDown, Plus } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ServerAccessIcon } from "@/features/server-inventory/components/server-access-icon";
import { formatMessage } from "@/lib/i18n";

function engineLabel(engine: string) {
  return (
    new Map(
      Object.entries({
        POSTGRESQL: "PostgreSQL",
        REDIS: "Redis",
        SQLSERVER: "MSSQL",
        MSSQL: "MSSQL",
        MYSQL: "MySQL",
        MARIADB: "MariaDB",
        ORACLE: "Oracle",
        MONGODB: "MongoDB",
        SQLITE: "SQLite",
        CASSANDRA: "Cassandra",
        CLICKHOUSE: "ClickHouse",
        COCKROACHDB: "CockroachDB",
        COUCHDB: "CouchDB",
        ELASTICSEARCH: "Elasticsearch",
      })
    ).get(engine) ?? engine
  );
}

export function DatabaseEnginePicker({
  id,
  invalid,
  disabled,
  value,
  onChange,
  portalContainer,
}: {
  id: string;
  invalid: boolean;
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
  portalContainer?: HTMLElement | null;
}) {
  const { messages } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const options = [
    ...new Set(
      [
        "POSTGRESQL",
        "REDIS",
        "SQLSERVER",
        "MYSQL",
        "MARIADB",
        "ORACLE",
        "MONGODB",
        "SQLITE",
        "CASSANDRA",
        "CLICKHOUSE",
        "COCKROACHDB",
        "COUCHDB",
        "DB2",
        "ELASTICSEARCH",
        value,
      ].filter(Boolean)
    ),
  ].sort();
  const custom = search.trim().toUpperCase();
  const select = (type: string) => {
    onChange(type);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-invalid={invalid}
          className="w-full justify-between"
          disabled={disabled}
          id={id}
          role="combobox"
          type="button"
          variant="outline"
        >
          <span className="flex min-w-0 items-center gap-2">
            {value && (
              <ServerAccessIcon
                accessType="DATABASE"
                databaseEngine={value}
                decorative
                engineOnly
              />
            )}
            <span className="truncate">
              {engineLabel(value) || messages.servers.chooseEngine}
            </span>
          </span>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--anchor-width)"
        portalContainer={portalContainer}
        size="none"
      >
        <Command>
          <CommandInput
            aria-label={messages.servers.engineSearch}
            maxLength={50}
            onValueChange={setSearch}
            placeholder={messages.servers.engineSearch}
            value={search}
          />
          <CommandList>
            <CommandGroup>
              {options.map((type) => (
                <CommandItem
                  key={type}
                  keywords={[engineLabel(type)]}
                  onSelect={() => select(type)}
                  value={type}
                >
                  <ServerAccessIcon
                    accessType="DATABASE"
                    databaseEngine={type}
                    decorative
                    engineOnly
                  />
                  {engineLabel(type)}
                  {value === type && <Check className="ml-auto" />}
                </CommandItem>
              ))}
              {custom && !options.includes(custom) && (
                <CommandItem onSelect={() => select(custom)} value={custom}>
                  <Plus />
                  {formatMessage(messages.servers.createEngine, {
                    type: custom,
                  })}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
