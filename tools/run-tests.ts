const dashboardTestFile =
  "src/features/dashboard/components/dashboard-layout.test.tsx";
const testCommands = [
  ["bun", "test", `--path-ignore-patterns=${dashboardTestFile}`],
  ["bun", "test", dashboardTestFile],
] as const;

for (const command of testCommands) {
  const result = Bun.spawnSync(command, {
    stderr: "inherit",
    stdout: "inherit",
  });

  if (result.exitCode !== 0) {
    process.exit(result.exitCode ?? 1);
  }
}
