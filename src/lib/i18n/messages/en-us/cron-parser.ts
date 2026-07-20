export const cronParserMessages = {
  navigationGroup: "Developer Tools",
  title: "Cron Parser",
  pageTitle: "Cron Parser | BPDDIY DevTools",
  pageDescription:
    "Explain Unix cron expressions and preview their next executions by timezone.",
  pageKeywords: ["cron", "parser", "scheduler", "developer tools"],
  eyebrow: "Developer tools / 03",
  description:
    "Read a Unix schedule before you ship it. Parsing stays in this browser.",
  formatsLabel: "Syntax",
  formatsValue: "Unix / 5 or 6 fields",
  outputLabel: "Preview",
  outputValue: "Next 5 runs",
  storageLabel: "Storage",
  storageValue: "Timezone only",
  resetExample: "Reset example",
  clear: "Clear",
  expressionLabel: "Cron expression",
  expressionPlaceholder: "*/15 * * * *",
  expressionHelp:
    "Minute, hour, day of month, month, weekday. Add seconds as the first field when needed.",
  timezoneLabel: "Timezone",
  timezoneSearch: "Search timezones...",
  timezoneEmpty: "No timezone found.",
  timezoneUse: "Use {timezone}",
  shortcutLabel: "Ctrl / Cmd + Enter",
  parse: "Parse",
  validExpression: "Valid expression",
  invalidExpression: "Could not parse expression",
  fieldBreakdown: "Field breakdown",
  fieldBreakdownDescription:
    "The parser reads these fields from left to right.",
  allowedRange: "Allowed {range}",
  upcomingRuns: "Upcoming executions",
  upcomingRunsDescription: "The next five runs after the time you parsed it.",
  runNumber: "Run {number}",
  tour: {
    startButton: "Start tour",
    controlsTitle: "Set the schedule context",
    controlsDescription:
      "Enter a five-field Unix expression, or add seconds at the front. Choose the timezone before parsing.",
    fieldsTitle: "Check how each field was read",
    fieldsDescription:
      "The breakdown keeps the original tokens beside their names and valid ranges.",
    runsTitle: "Verify the actual dates",
    runsDescription:
      "Use the next five executions to catch timezone and calendar mistakes before deployment.",
  },
} as const;
