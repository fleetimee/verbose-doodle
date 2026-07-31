export const cronParserMessages = {
  allowedRange: "Allowed {range}",
  clear: "Clear",
  description:
    "Read a Unix schedule before you ship it. Parsing stays in this browser.",
  expressionHelp:
    "Minute, hour, day of month, month, weekday. Add seconds as the first field when needed.",
  expressionLabel: "Cron expression",
  expressionPlaceholder: "*/15 * * * *",
  eyebrow: "Developer tools / 03",
  fieldBreakdown: "Field breakdown",
  fieldBreakdownDescription:
    "The parser reads these fields from left to right.",
  formatsLabel: "Syntax",
  formatsValue: "Unix / 5 or 6 fields",
  invalidExpression: "Could not parse expression",
  navigationGroup: "Developer Tools",
  outputLabel: "Preview",
  outputValue: "Next 5 runs",
  pageDescription:
    "Explain Unix cron expressions and preview their next executions by timezone.",
  pageKeywords: ["cron", "parser", "scheduler", "developer tools"],
  pageTitle: "Cron Parser | BPDDIY DevTools",
  parse: "Parse",
  resetExample: "Reset example",
  runNumber: "Run {number}",
  shortcutLabel: "Ctrl / Cmd + Enter",
  storageLabel: "Storage",
  storageValue: "Timezone only",
  timezoneEmpty: "No timezone found.",
  timezoneLabel: "Timezone",
  timezoneSearch: "Search timezones...",
  timezoneUse: "Use {timezone}",
  title: "Cron Parser",
  tour: {
    controlsDescription:
      "Enter a five-field Unix expression, or add seconds at the front. Choose the timezone before parsing.",
    controlsTitle: "Set the schedule context",
    fieldsDescription:
      "The breakdown keeps the original tokens beside their names and valid ranges.",
    fieldsTitle: "Check how each field was read",
    runsDescription:
      "Use the next five executions to catch timezone and calendar mistakes before deployment.",
    runsTitle: "Verify the actual dates",
    startButton: "Start tour",
  },
  upcomingRuns: "Upcoming executions",
  upcomingRunsDescription: "The next five runs after the time you parsed it.",
  validExpression: "Valid expression",
} as const;
