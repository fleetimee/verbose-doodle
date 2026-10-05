import {
  CodeIcon,
  ComputerArrowDownIcon,
  Database02Icon,
  FileTerminalIcon,
  FolderTransferIcon,
  GlobeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CassandraDB,
  ClickHouse,
  Elastic,
  MariaDB,
  MicrosoftSQLServer,
  MongoDB,
  MySQL,
  Oracle,
  PostgreSQL,
  Redis,
} from "developer-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const accessIcons = new Map(
  Object.entries({
    DATABASE: { icon: Database02Icon, color: "text-primary" },
    TELNET: { icon: FileTerminalIcon, color: "text-primary" },
    WINRM: { icon: FileTerminalIcon, color: "text-primary" },
    VNC: { icon: ComputerArrowDownIcon, color: "text-chart-2" },
    SMB: { icon: FolderTransferIcon, color: "text-chart-4" },
    SSH: { icon: FileTerminalIcon, color: "text-primary" },
    RDP: { icon: ComputerArrowDownIcon, color: "text-chart-2" },
    FTP: { icon: FolderTransferIcon, color: "text-chart-4" },
    SFTP: { icon: FolderTransferIcon, color: "text-chart-1" },
    FTPS: { icon: FolderTransferIcon, color: "text-chart-1" },
    WEB: { icon: GlobeIcon, color: "text-chart-3" },
    HTTP: { icon: GlobeIcon, color: "text-chart-3" },
    HTTPS: { icon: GlobeIcon, color: "text-chart-3" },
  })
);

export const serverAccessTypes = [...accessIcons.keys()].sort();

const engineIcons = new Map(
  Object.entries({
    MARIADB: MariaDB,
    CASSANDRA: CassandraDB,
    CLICKHOUSE: ClickHouse,
    ELASTICSEARCH: Elastic,
    POSTGRESQL: PostgreSQL,
    POSTGRES: PostgreSQL,
    MYSQL: MySQL,
    ORACLE: Oracle,
    MONGO: MongoDB,
    MONGODB: MongoDB,
    REDIS: Redis,
    SQLSERVER: MicrosoftSQLServer,
    MSSQL: MicrosoftSQLServer,
  })
);

export function ServerAccessIcon({
  accessType,
  databaseEngine,
  engineOnly = false,
  decorative = false,
}: {
  accessType: string;
  databaseEngine?: string | null;
  engineOnly?: boolean;
  decorative?: boolean;
}) {
  const type = accessType.toUpperCase();
  const access = accessIcons.get(type) ?? {
    icon: CodeIcon,
    color: "text-primary",
  };
  const engine = type === "DATABASE" ? databaseEngine : null;
  const EngineIcon = engine ? engineIcons.get(engine.toUpperCase()) : undefined;
  const label = engineOnly
    ? (engine ?? type)
    : [accessType, engine].filter(Boolean).join(" · ");

  if (decorative) {
    if (EngineIcon) {
      return <EngineIcon aria-hidden="true" size={20} />;
    }
    return (
      <HugeiconsIcon
        aria-hidden="true"
        className={access.color}
        icon={access.icon}
        size={20}
        strokeWidth={1.8}
      />
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={label}
        className="inline-flex h-8 items-center align-middle"
      >
        <span className="inline-flex items-center gap-2">
          {!engineOnly && (
            <HugeiconsIcon
              aria-hidden="true"
              className={access.color}
              icon={access.icon}
              size={20}
              strokeWidth={1.8}
            />
          )}
          {EngineIcon ? (
            <EngineIcon aria-hidden="true" size={20} />
          ) : (
            engine && (
              <HugeiconsIcon
                aria-hidden="true"
                className="text-primary"
                icon={Database02Icon}
                size={20}
                strokeWidth={1.8}
              />
            )
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
