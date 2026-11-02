import { PackageIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Apache,
  Bash,
  Docker,
  Git,
  Go,
  Java,
  MySQL,
  NodeJs,
  PHP,
  PostgreSQL,
  Python,
  Redis,
  Ruby,
} from "developer-icons";

export const notableSoftware = [
  { pattern: /^(apache2?|httpd)(-|$)/, Icon: Apache, label: "Apache" },
  { pattern: /^bash(-|$)/, Icon: Bash, label: "Bash" },
  { pattern: /^docker(-|$)/, Icon: Docker, label: "Docker" },
  { pattern: /^git(-|$)/, Icon: Git, label: "Git" },
  { pattern: /^(go|golang)(-|$)/, Icon: Go, label: "Go" },
  {
    pattern: /^(java|javac|openjdk|temurin)([0-9-]|$)/,
    Icon: Java,
    label: "Java",
  },
  { pattern: /^(mysql|mariadb)(-|$)/, Icon: MySQL, label: "MySQL / MariaDB" },
  { pattern: /^(node|nodejs|npm|npx)(-|$)/, Icon: NodeJs, label: "Node.js" },
  { pattern: /^php([0-9.-]|$)/, Icon: PHP, label: "PHP" },
  { pattern: /^(psql|postgresql)(-|$)/, Icon: PostgreSQL, label: "PostgreSQL" },
  { pattern: /^python([0-9.-]|$)/, Icon: Python, label: "Python" },
  { pattern: /^redis(-|$)/, Icon: Redis, label: "Redis" },
  { pattern: /^(ruby|gem|bundler)([0-9.-]|$)/, Icon: Ruby, label: "Ruby" },
] as const;

export function ServerSoftwareIcon({ name }: { name: string }) {
  const Icon = notableSoftware.find(({ pattern }) => pattern.test(name))?.Icon;
  if (Icon) {
    return <Icon aria-hidden="true" className="size-4 shrink-0" />;
  }
  return (
    <HugeiconsIcon
      aria-hidden="true"
      className="size-4 shrink-0 text-muted-foreground"
      icon={PackageIcon}
      strokeWidth={2}
    />
  );
}
