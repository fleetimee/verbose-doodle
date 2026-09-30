export const overviewMessages = {
  activeResponsesDescription: "Active templates",
  activeResponsesTitle: "Active Responses",
  activeUsersTitle: "Active Users",
  accountActivityDescription:
    "Current access and user status across the workspace.",
  accountActivityTitle: "Account activity",
  adminUsersTitle: "Admin Users",
  chat: {
    activatedLabel: "Activated",
    assistantName: "Simulator guide",
    attentionLabel: "Attention",
    billerCoverageLabel: "Biller coverage",
    billersLabel: "Billers",
    clearChat: "Reset chat",
    composerHint:
      "Type / for slash commands · Enter to send · Shift + Enter for a new line",
    composerLabel: "Ask the biller operator",
    emptyDescription:
      "Explore billers, endpoints, response templates, and integration signals in plain language.",
    emptyTitle: "What should we look up?",
    endpointWithoutResponse: "{count} endpoint has no response template",
    endpointsLabel: "Endpoints",
    endpointsWithoutResponses: "{count} endpoints have no response template",
    errorTitle: "Unable to read overview",
    healthyCoverage: "Every endpoint has a response template",
    inputHint: "Searches the current simulator overview. Type / for commands.",
    inputPlaceholder: "Ask about billers, endpoints, or responses…",
    operatorMascotAlt: "Biller operator mascot reading a tablet",
    liveSnapshotDescription:
      "A compact read of the current configuration and response coverage.",
    liveSnapshotTitle: "Live simulator snapshot",
    loadingReply: "Checking the current snapshot…",
    loadingSnapshot: "Reading simulator coverage…",
    noRecentEndpoints: "No endpoints have been configured yet.",
    openEndpoints: "Open endpoint catalog",
    readOnlyLabel: "Read-only overview",
    recentEndpointsLabel: "Recent endpoints",
    responseTemplatesLabel: "Response templates",
    send: "Send",
    collapseComposer: "Collapse composer",
    expandComposer: "Expand composer",
    collapse: "Collapse",
    expand: "Expand",
    suggestions: {
      snapshot: "Show me a simulator snapshot",
      missing: "Which endpoints need responses?",
      recent: "Show recent endpoints",
    },
    commands: {
      snapshotDescription: "Read overall simulator health, coverage & counts",
      snapshotLabel: "Show simulator snapshot",
      refreshDescription: "Fetch the latest live data from simulator API",
      refreshLabel: "Refresh overview",
      endpointsDescription: "Review configured endpoints, HTTP methods & paths",
      endpointsLabel: "Endpoint catalog",
      billersDescription: "Inspect billers and endpoint coverage distribution",
      billersLabel: "Biller breakdown",
      missingDescription: "Find endpoints without active response templates",
      missingLabel: "Missing responses",
      toolsDescription: "Open the integration developer toolbox",
      toolsLabel: "Developer tools",
      jwtDescription: "Decode, inspect and verify JSON Web Tokens",
      jwtLabel: "JWT inspector",
      iso8583Description: "Build and inspect ISO 8583 financial messages",
      iso8583Label: "ISO 8583 generator",
      yamlDescription: "Bidirectional JSON and YAML format conversion",
      yamlLabel: "JSON ↔ YAML",
      schemaDescription: "Validate payloads against JSON Schema specifications",
      schemaLabel: "Schema validator",
      cronDescription: "Parse cron expressions and preview upcoming runs",
      cronLabel: "Cron parser",
      baseDescription:
        "Convert between binary, octal, decimal, hex, and base64",
      baseLabel: "Number base converter",
      dateDescription: "Convert Unix timestamps, ISO 8601, and timezones",
      dateLabel: "Date & timezone",
      socketsDescription: "Test TCP client/server and UDP datagram flows",
      socketsLabel: "Socket tester",
      socksRelayDescription: "Inspect SOCKS5 proxy relay for REST and ISO 8583",
      socksRelayLabel: "SOCKS relay",
      usersDescription: "View user count and administrator activity stats",
      usersLabel: "User accounts",
      helpDescription: "Browse available questions, commands, and shortcuts",
      helpLabel: "Help & cheat sheet",
      clearDescription: "Start a fresh conversation and reset session",
      clearLabel: "Clear chat",
    },
    count: {
      endpoint: "endpoint",
      endpoints: "endpoints",
      configuredEndpoint: "configured endpoint",
      configuredEndpoints: "configured endpoints",
      response: "response",
      responses: "responses",
      biller: "biller",
      billers: "billers",
      activeAccount: "active account",
      activeAccounts: "active accounts",
      registeredUser: "registered user",
      registeredUsers: "registered users",
      responseTemplate: "response template",
      responseTemplates: "response templates",
      activeResponseTemplate: "active response template",
      activeResponseTemplates: "active response templates",
    },
    replies: {
      help: "Here are the available slash commands and queries you can run:\n\n• /snapshot — View complete simulator coverage and metrics\n• /endpoints — Review configured endpoints and HTTP methods\n• /billers — Breakdown of endpoints grouped by biller\n• /missing — Find endpoints without active response templates\n• /tools — Open the 8 developer integration tools\n• /jwt, /iso8583, /schema, /json-yaml, /cron, /base, /date — Jump to specific developer tools\n• /sockets & /socks-relay — Socket and proxy test workspaces\n• /users — Account activity (Admin)\n• /refresh — Fetch latest overview snapshot\n• /clear — Reset chat conversation",
      jwt: "The JWT Inspector allows you to decode JSON Web Tokens, inspect Header and Payload claims, and verify HS256/RS256 cryptographic signatures with instant validation.",
      iso8583:
        "The ISO 8583 Generator helps you construct and simulate financial transaction messages, configure primary and secondary bitmaps, test MTIs (0100, 0200, 0800), and inspect packed byte streams.",
      yaml: "The JSON ↔ YAML Converter provides bidirectional conversion with real-time error diagnostics, indentation settings, and format swap capabilities.",
      schema:
        "The JSON Schema Validator checks JSON documents against Draft-07 and Draft 2020-12 specifications, reporting exact line/path diagnostics on validation errors.",
      cron: "The Cron Parser breaks down 5-field and 6-field (with seconds) cron expressions into plain language and calculates the next 5 scheduled execution timestamps.",
      base: "The Number Base Converter handles real-time conversions across binary, octal, decimal, hexadecimal, and base64 formats with signed 2's complement and unsigned integer support.",
      date: "The Date & Timestamp Converter translates between Unix epoch seconds/milliseconds, ISO 8601 strings, and custom timezone offsets.",
      sockets:
        "The Socket & Relay Workspace allows you to interactively test TCP client/server endpoints, UDP datagram flows, and configure SOCKS5 proxy relay tunnels.",
      tools:
        "The developer toolbox includes 8 specialized integration utilities for real-time conversion, validation, parsing, and payload inspection.",
      missingWithGaps:
        "{count} endpoint(s) still need a response template. The attention signal and endpoint catalog below can help you close the gap.",
      missingWithoutGaps:
        "Every configured endpoint currently has a response template. The snapshot below shows the rest of the simulator coverage.",
      endpointSummary:
        "The simulator currently has {count}. I’ve included the latest endpoint list and response coverage below.",
      billerSummary:
        "{count} are represented in the simulator. The snapshot groups endpoint coverage by biller so you can spot uneven setup quickly.",
      responseSummary:
        "{total} configured, and {active} active ({percentage}). The snapshot below separates activation from endpoint coverage.",
      adminUnavailable:
        "Account activity is only available to administrators. I can still show billers, endpoints, and response coverage from this overview.",
      userSummary:
        "{users}, with {accounts}. The administrator-only account signal is included in the snapshot below.",
      snapshotSummary:
        "Here’s the current simulator read: billers, endpoints, response templates, activation, and the latest configured endpoints in one place.",
      fallback:
        "I can read the current simulator snapshot or take you to Endpoints, Developer Tools, and Socket Tester. Try typing /help to browse all commands.",
      unavailable:
        "I can’t read the simulator snapshot yet. Try /refresh once the Overview API is available.",
      refreshSuccess:
        "The overview is refreshed. Here’s the latest simulator read.",
      refreshFailed: "I couldn’t refresh the simulator snapshot. {error}",
      refreshFailedTryAgain:
        "I couldn’t refresh the simulator snapshot. Try again shortly.",
    },
    slashCommands: "Slash commands",
    tryAQuestion: "Try a question",
    updatedSource: "Read from the Overview API",
    apiSnapshotUnavailable:
      "The Overview API did not return a simulator snapshot.",
    yourMessage: "Your message",
    assistantResponse: "Assistant response",
    conversationLabel: "Simulator overview conversation",
    scrollLatest: "Scroll to latest response",
    workspaceShortcuts: "Workspace shortcuts",
    snapshot: {
      configuredCatalog: "CONFIGURED CATALOG",
      configuredCatalogDescription:
        "Endpoints configured in the simulator with HTTP method routing and response coverage.",
      httpMethodBreakdown: "HTTP METHOD BREAKDOWN",
      responseCoverage: "RESPONSE COVERAGE",
      responseCoverageAria: "Active response coverage",
      activeTemplateSummary:
        "{active} of {total} templates active ({percentage})",
      allConfiguredActiveResponses:
        "All configured endpoints have active response scenarios.",
      missingTemplateSummary:
        "{count} endpoint(s) still need response templates.",
      configuredEndpointsAvailable:
        "Configured endpoints are available for scenario generation.",
      recentConfigurations: "RECENT CONFIGURATIONS",
      providerDirectory: "PROVIDER DIRECTORY",
      providerDistribution:
        "Distribution of endpoints and mock response templates across simulated billers.",
      allBillerProviders: "ALL BILLER PROVIDERS",
      billerCoverageAria: "{name} coverage",
      filterInCatalog: "Filter in catalog",
      noBillersRegistered: "No billers registered yet.",
      groupedByProvider:
        "Endpoints are grouped by provider to identify unbalanced coverage.",
      gapAnalysis: "GAP ANALYSIS",
      missingDescription:
        "Endpoints lacking active response scenarios or requiring scenario configuration.",
      needAttention: "{count} need attention",
      coverageReady: "Coverage ready",
      missingResponses: "MISSING RESPONSES",
      configuredTemplates: "CONFIGURED TEMPLATES",
      activationRate: "ACTIVATION RATE",
      requireScenarioTemplates:
        "{count} endpoint(s) require scenario templates",
      requireScenarioDescription:
        "Without a response template, incoming simulator calls to these endpoints will receive default or 404 responses. Open the endpoint catalog to create mock scenarios.",
      allEndpointsTemplate:
        "Every configured endpoint currently has an active response template",
      allEndpointsDescription:
        "All simulator endpoints are equipped with active mock responses and ready for test traffic.",
      endpointsInCatalog: "ENDPOINTS IN CATALOG",
      requiresActiveTemplate:
        "Every endpoint requires at least one active response template for full simulation.",
      integrationUtility: "INTEGRATION UTILITY",
      utility: "UTILITY",
      runtime: "RUNTIME",
      maxPayload: "MAX PAYLOAD",
      environment: "ENVIRONMENT",
      clientSide: "Client-side",
      launchTool: "LAUNCH TOOL",
      openTool: "Open {name}",
      localUtilityFooter:
        "Runs locally in browser with zero network latency or data leakage.",
      integrationToolbox: "INTEGRATION TOOLBOX",
      toolboxDescription:
        "8 client-side utilities for payload conversion, validation, parsing, and inspection.",
      utilityCount: "{count} utilities",
      developerUtilitiesFooter:
        "Developer utilities run locally in your browser for instant payload manipulation.",
      networkTransport: "NETWORK TRANSPORT",
      networkTransportDescription:
        "Low-level socket testing utilities and secure SOCKS5 proxy relay workspaces.",
      networkProtocols: "TCP / UDP / SOCKS5",
      tcpClient: "TCP Client",
      tcpClientDescription:
        "Interactive TCP client for sending custom payloads & streaming responses.",
      tcpServer: "TCP Server",
      tcpServerDescription:
        "Capture incoming client TCP connections and echo or mock replies.",
      udpDatagram: "UDP Datagram",
      udpDatagramDescription:
        "Send connectionless UDP packets and observe receiver responses.",
      socksRelayProxy: "SOCKS Relay Proxy",
      socksRelayProxyDescription:
        "Inspect SOCKS5 proxy routing for REST API and ISO 8583 traffic.",
      networkTransportFooter:
        "Socket and proxy utilities enable multi-protocol transport testing.",
      accessControl: "ACCESS CONTROL",
      administratorOnlyDescription:
        "Administrator-only view of registered user accounts and system permissions.",
      administratorSignal: "Administrator signal",
      totalAccounts: "TOTAL ACCOUNTS",
      administrators: "ADMINISTRATORS",
      accountActiveSummary:
        "{active} of {total} registered accounts are active",
      administratorSummary:
        "The simulator maintains {administrators} administrator role(s) with full configuration and user management privileges, and {regular} standard user(s).",
      administratorRestricted:
        "Account metrics are restricted to administrators.",
      currentRead: "Current read",
      noBillerCoverage: "No biller coverage is available yet.",
      responseTemplatesActive:
        "{active} of {total} response templates are active.",
      accountSignal: "{active} active account · {registered} registered user",
      updatedSource: "Read from the Overview API",
    },
  },
  chartLabels: {
    active: "Active",
    activeUsers: "Active Users",
    avgResponseTime: "Avg Response Time",
    deprecated: "Deprecated",
    inactive: "Inactive",
    inactiveUsers: "Inactive Users",
    p95ResponseTime: "P95 Response Time",
    successful: "Successful",
    totalRequests: "Total Requests",
    users: "Users",
  },
  configurationSignalDescription:
    "Read endpoint and response distribution at a glance.",
  configurationSignalTitle: "Configuration signal",
  coverageDescription:
    "Configured billers, endpoints, and response templates in one view.",
  coverageTitle: "Simulator coverage",
  currentActiveAccountsDescription: "Current active user accounts",
  documentDescription:
    "View your Fleetime Labs statistics, configured endpoints, and response distributions",
  documentTitle: "Overview",
  endpointUsageTrendDescription:
    "Total requests and successful responses over the last 6 months",
  endpointUsageTrendTitle: "Endpoint Usage Trend",
  endpointsMetricLabel: "Endpoints",
  responseStatusChartDescription: "Configured responses by HTTP status code",
  responseStatusChartTitle: "Response Status Code Distribution",
  responsesMetricLabel: "Responses",
  eyebrow: "Billing Simulator",
  httpMethodDistributionDescription: "Endpoint count by HTTP method type",
  httpMethodDistributionTitle: "HTTP Method Distribution",
  inactiveUsers: "{count} inactive",
  loadError: "Failed to load overview data. Please try refreshing the page.",
  pageDescription:
    "Inspect endpoint coverage, response templates, and account activity without leaving the simulator workspace.",
  pageTitle: "Overview",
  readOnlyAnalytics: "Read-only analytics",
  retry: "Try again",
  registeredAccounts: "Registered accounts",
  regularUsers: "{count} regular",
  responseTimeTrendsDescription:
    "Average and P95 response times (ms) over the last 10 weeks",
  responseTimeTrendsTitle: "Response Time Trends",
  totalBillersDescription: "Biller systems",
  totalBillersTitle: "Total Billers",
  totalEndpointsDescription: "Configured endpoint routes across all billers",
  totalEndpointsTitle: "Total Endpoints",
  totalResponsesDescription: "Response templates",
  totalResponsesTitle: "Total Responses",
  totalUsersTitle: "Total Users",
  userPercentageDescription: "{percentage}% of users",
  userRoleAdmin: "Admin",
  userRoleRegular: "Regular",
  userRolesDescription: "Admin and regular account split",
  userRolesTitle: "User Roles",
  recentEndpointsTitle: "Recent Endpoints",
  recentEndpointsDescription: "Recently configured endpoints in the system",
  recentEndpointsEmptyTitle: "No endpoints yet",
  recentEndpointsEmptyDescription:
    "Recently configured endpoints will appear here once they are available.",
  endpointsByBillerTitle: "Endpoints by Biller",
  endpointsByBillerDescription: "Distribution of endpoints across billers",
} as const;
