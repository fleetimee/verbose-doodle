import { toast } from "sonner";
import { CopyIcon } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { engineIcons } from "@/features/server-inventory/components/server-access-icon";
import type { ServerEntry } from "@/features/server-inventory/types";
import { copyToClipboard } from "@/lib/clipboard";

function quoteShellArgument(value: string) {
  return `'${value.replaceAll("'", "'\"'\"'")}'`;
}

interface EngineClient {
  build: (entry: ServerEntry, host: string, port: number) => string[];
  defaultPort: number;
  label: string;
}

const postgres: EngineClient = {
  label: "PostgreSQL",
  defaultPort: 5432,
  build: (entry, host, port) => [
    "psql",
    "-h",
    host,
    "-p",
    String(port),
    ...(entry.username ? ["-U", quoteShellArgument(entry.username)] : []),
    ...(entry.databaseName
      ? ["-d", quoteShellArgument(entry.databaseName)]
      : []),
  ],
};

const mysql = (label: string): EngineClient => ({
  label,
  defaultPort: 3306,
  build: (entry, host, port) => [
    "mysql",
    "-h",
    host,
    "-P",
    String(port),
    ...(entry.username ? ["-u", quoteShellArgument(entry.username)] : []),
    "-p",
    ...(entry.databaseName ? [quoteShellArgument(entry.databaseName)] : []),
  ],
});

const sqlServer: EngineClient = {
  label: "SQL Server",
  defaultPort: 1433,
  build: (entry, _host, port) => [
    "sqlcmd",
    "-S",
    quoteShellArgument(`${entry.host},${port}`),
    ...(entry.username ? ["-U", quoteShellArgument(entry.username)] : []),
    ...(entry.databaseName
      ? ["-d", quoteShellArgument(entry.databaseName)]
      : []),
  ],
};

const mongo: EngineClient = {
  label: "MongoDB",
  defaultPort: 27_017,
  build: (entry, _host, port) => [
    "mongosh",
    "--host",
    quoteShellArgument(entry.host),
    "--port",
    String(port),
    ...(entry.username ? ["-u", quoteShellArgument(entry.username)] : []),
    ...(entry.databaseName ? [quoteShellArgument(entry.databaseName)] : []),
  ],
};

const redis: EngineClient = {
  label: "Redis",
  defaultPort: 6379,
  build: (entry, host, port) => [
    "redis-cli",
    "-h",
    host,
    "-p",
    String(port),
    ...(entry.username ? ["--user", quoteShellArgument(entry.username)] : []),
  ],
};

const oracle: EngineClient = {
  label: "Oracle",
  defaultPort: 1521,
  build: (entry, _host, port) => [
    "sqlplus",
    quoteShellArgument(
      `${entry.username ?? ""}@//${entry.host}:${port}/${entry.databaseName ?? ""}`
    ),
  ],
};

const engineClients = new Map<string, EngineClient>(
  Object.entries({
    POSTGRESQL: postgres,
    POSTGRES: postgres,
    MYSQL: mysql("MySQL"),
    MARIADB: mysql("MariaDB"),
    SQLSERVER: sqlServer,
    MSSQL: sqlServer,
    MONGO: mongo,
    MONGODB: mongo,
    REDIS: redis,
    ORACLE: oracle,
  })
);

export function ServerDatabaseGuide({ entry }: { entry: ServerEntry }) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const engineKey = entry.databaseEngine?.toUpperCase() ?? "";
  const client = engineClients.get(engineKey);
  const EngineIcon = engineIcons.get(engineKey);
  const engineLabel = client?.label ?? entry.databaseEngine ?? "";
  const host =
    entry.host.includes(":") && !entry.host.startsWith("[")
      ? `[${entry.host}]`
      : entry.host;
  const port = entry.port ?? client?.defaultPort;
  const address = port === undefined ? host : `${host}:${port}`;
  const command = client
    ? client
        .build(
          entry,
          quoteShellArgument(entry.host),
          entry.port ?? client.defaultPort
        )
        .join(" ")
    : null;
  const valueToCopy = command ?? address;
  const settings = [
    { label: copy.databaseEngine, value: engineLabel },
    { label: copy.host, value: entry.host },
    { label: copy.port, value: port === undefined ? "" : String(port) },
    { label: copy.databaseName, value: entry.databaseName },
    { label: copy.username, value: entry.username },
  ];
  const clients = [
    {
      value: "datagrip",
      label: "DataGrip",
      start: copy.databaseDataGripStart,
      finish: copy.databaseDataGripFinish,
      reference:
        "https://www.jetbrains.com/help/datagrip/connecting-to-a-database.html",
    },
    {
      value: "dbeaver",
      label: "DBeaver",
      start: copy.databaseDBeaverStart,
      finish: copy.databaseDBeaverFinish,
      reference: "https://dbeaver.com/docs/dbeaver/Create-Connection/",
    },
  ];

  async function copyValue(value: string) {
    try {
      if (await copyToClipboard(value)) {
        toast.success(copy.copied);
      } else {
        toast.error(copy.copyFailed);
      }
    } catch {
      toast.error(copy.copyFailed);
    }
  }

  return (
    <section aria-labelledby="server-detail-database" className="space-y-3">
      <h3
        className="flex items-center gap-2 font-medium"
        id="server-detail-database"
      >
        {EngineIcon && <EngineIcon aria-hidden="true" size={18} />}
        {engineLabel
          ? copy.databaseTitle.replace("{engine}", engineLabel)
          : copy.databaseTitleGeneric}
      </h3>
      <Tabs defaultValue="datagrip">
        <TabsList aria-label={copy.databaseClient} className="w-full">
          {clients.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="command">{copy.databaseCommandTab}</TabsTrigger>
        </TabsList>
        {clients.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            <div className="space-y-3 pt-2">
              <p className="text-muted-foreground leading-relaxed">
                {item.start.replace(
                  "{engine}",
                  engineLabel || copy.databaseEngine
                )}
              </p>
              <dl className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                {settings.map((setting) => (
                  <div
                    className="flex items-start justify-between gap-3 px-4 py-2.5"
                    key={setting.label}
                  >
                    <dt className="pt-1.5 text-muted-foreground">
                      {setting.label}
                    </dt>
                    <dd className="flex min-w-0 items-start gap-1 text-right">
                      <span className="min-w-0 break-all pt-1.5 font-mono">
                        {setting.value || copy.notSet}
                      </span>
                      {setting.value && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              aria-label={copy.databaseCopyField.replace(
                                "{field}",
                                setting.label
                              )}
                              onClick={() => copyValue(setting.value ?? "")}
                              size="icon-sm"
                              variant="ghost"
                            >
                              <CopyIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copy.databaseCopyField.replace(
                              "{field}",
                              setting.label
                            )}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <ol className="list-decimal space-y-2 pl-5 text-muted-foreground leading-relaxed">
                <li>{copy.databaseNetwork}</li>
                <li>{copy.databaseGuiCredentials}</li>
                <li>{item.finish}</li>
              </ol>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {copy.databaseGuiEngineHint}
              </p>
              <a
                className="text-primary text-xs underline underline-offset-4"
                href={item.reference}
                rel="noopener noreferrer"
                target="_blank"
              >
                {copy.rdpReference}
              </a>
            </div>
          </TabsContent>
        ))}
        <TabsContent value="command">
          <div className="space-y-3 pt-2">
            <p className="text-muted-foreground leading-relaxed">
              {command ? copy.databaseCommandIntro : copy.databaseAddressIntro}
            </p>
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
              <code className="min-w-0 flex-1 whitespace-pre-wrap break-all pt-1.5 font-mono text-sm">
                {valueToCopy}
              </code>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label={
                      command
                        ? copy.databaseCopyCommand
                        : copy.databaseCopyAddress
                    }
                    onClick={() => copyValue(valueToCopy)}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <CopyIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {command
                    ? copy.databaseCopyCommand
                    : copy.databaseCopyAddress}
                </TooltipContent>
              </Tooltip>
            </div>
            <ol className="list-decimal space-y-2 pl-5 text-muted-foreground leading-relaxed">
              <li>{copy.databaseNetwork}</li>
              <li>{copy.databaseAuthenticate}</li>
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
