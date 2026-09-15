export const aboutMessages = {
  contentAriaLabel: "About page content",
  developerToolsDescription:
    "Integrated utilities for JSON/YAML conversion, JSON Schema validation, JWT inspection, cron parsing, and number base conversion",
  developerToolsTitle: "Developer Tools Suite:",
  documentDescription:
    "Learn more about Fleetime Labs - a powerful tool for prototyping billing scenarios",
  documentTitle: "About",
  endpointManagementDescription:
    "Configure and monitor billing API endpoints with real-time status tracking",
  endpointManagementTitle: "Endpoint Management:",
  headerDescription:
    "Fleetime Labs helps teams prototype billing journeys using configurable JSON scenarios, developer tools, protocol bridges, and reusable interface components.",
  headerTitle: "About This Project",
  interactiveDemoDescription:
    "Explore how Fleetime Labs handles endpoint simulation, protocol bridges, and developer utilities in real-time.",
  interactiveDemoTitle: "Interactive Simulator Preview",
  jsonDrivenDescription:
    "Flexible configuration using JSON scenarios for rapid prototyping",
  jsonDrivenTitle: "JSON-Driven:",
  keyFeaturesTitle: "Key Features",
  logoAlt: "Fleetime Labs",
  modernStackDescription:
    "Built with React 19, TypeScript, and Vite for optimal performance",
  modernStackTitle: "Modern Stack:",
  ourTeamTitle: "Our Team",
  returnHome: "Return home",
  socketTestingDescription:
    "Low-level TCP/UDP protocol state machine simulation and real-time WebSocket event bridge",
  socketTestingTitle: "Socket & Protocol Tester:",
  socksRelayDescription:
    "Live network proxy relay traffic monitoring and event log ring-buffers",
  socksRelayTitle: "SOCKS Relay Inspection:",
  systemArchitectureDescription:
    "An interactive overview of how the React frontend communicates with the Spring Boot backend, its dynamic catch-all controller, JWT security layer, and PostgreSQL data store.",
  systemArchitectureTitle: "System Architecture",
  technologyDescription:
    "This application leverages cutting-edge technologies including React 19 with the new compiler, TypeScript for type safety, TanStack Query for data fetching, and Tailwind CSS for styling. The component library is built on shadcn/ui with Base UI primitives.",
  technologyTitle: "Technology",
  userAdministrationDescription:
    "Role-based access control with dedicated user management for administrators",
  userAdministrationTitle: "User Administration:",
  versionFooterTitle: "System & Release Information",
  versionFooterReleases: "Releases",
  versionTagLabel: "Version Tag",
  gitReleaseShaLabel: "Git Release SHA",
  viewCommitOnGitea: "View commit {sha} on Gitea",
  buildTimestampLabel: "Build Timestamp",
  whatIsThisDescription:
    "Fleetime Labs is a powerful platform designed to help teams prototype, test, and visualize billing scenarios through an intuitive interface. Built with modern web technologies, it provides a unified suite for managing billing API endpoints, socket bridge state machines, network relays, and developer conversion utilities.",
  whatIsThisTitle: "What is this?",
  techStack: {
    filterAria: "Filter by technology category",
    categories: {
      all: "All",
      core: "Core",
      uiStyling: "UI & Styling",
      toolingState: "Tooling & State",
    },
    docsHint: "Click any badge to open official documentation ↗",
    descriptions: {
      react:
        "UI library with the new compiler for automatic memoization and concurrent rendering.",
      typescript:
        "Typed superset of JavaScript that compiles to plain JS; catches bugs at compile time.",
      vite: "Lightning-fast build tool powered by native ES modules with instant HMR.",
      bun: "All-in-one JavaScript runtime & toolkit: fast package manager, bundler, and test runner.",
      tailwind:
        "Utility-first CSS framework with CSS-native configuration and zero-runtime overhead.",
      baseUi:
        "Unstyled, accessible UI primitives by MUI for building modern React design systems.",
      motion:
        "Production-ready animation library for React with declarative, physics-based animations.",
      tanstackQuery:
        "Powerful async state management with automatic caching, background refetching, and stale-while-revalidate.",
      reactHookForm:
        "Performant, flexible form management with minimal re-renders and built-in validation.",
      reactRouter:
        "Declarative client-side routing for React with nested routes and loader patterns.",
    },
  },
  architecture: {
    ariaLabel: "Interactive system architecture diagram",
    legendAriaLabel: "Node legend",
    layers: {
      client: "Client Layer",
      application: "Application Layer",
      service: "Service Layer",
      data: "Data Layer",
    },
    idleDescription:
      "Hover or focus a node to explore how the system layers connect — from React client to Spring Boot controller to PostgreSQL data store.",
    nodes: {
      frontend: {
        label: "React Frontend",
        sublabel: "Vite + TanStack Query",
        description:
          "Single-page application built with React 19, TypeScript, and TanStack Query. Communicates with the backend via REST API and WebSocket bridge for real-time protocol simulation.",
      },
      apiGateway: {
        label: "Spring Boot",
        sublabel: "Embedded Tomcat + REST",
        description:
          "Spring Boot application with an embedded Tomcat servlet container. Exposes REST endpoints under /api/** and handles HTTP lifecycle, request routing, and response serialization.",
      },
      controller: {
        label: "Catch-all Controller",
        sublabel: "@Order(LOWEST_PRECEDENCE)",
        description:
          "A dynamic catch-all Spring MVC controller registered at the lowest Spring bean priority. It intercepts any unmatched /api/** route and resolves it to the correct JSON-driven biller scenario stored in the database.",
      },
      jwt: {
        label: "JWT Security",
        sublabel: "Spring Security Filter Chain",
        description:
          "Stateless JWT authentication via Spring Security filter chain. Every API request carries a signed Bearer token; the filter validates the signature and injects the user principal into the security context.",
      },
      database: {
        label: "PostgreSQL",
        sublabel: "JSON Scenario Data Store",
        description:
          "PostgreSQL relational database that stores biller endpoint configurations, JSON scenario payloads, user records, and transaction histories. Accessed via Spring Data JPA repositories.",
      },
    },
  },
  demo: {
    apiEndpoints: "API Endpoints",
    socketBridge: "Socket Bridge",
    devTools: "Dev Tools",
    matchedRules: "Matched via JSON-driven mock rules seam",
    simulating: "Simulating...",
    testEndpoint: "Test Endpoint",
    connected: "CONNECTED",
    handshake: "Protocol handshake initiated via ISO-8583 bridge",
    ack: "ACK frame received (len=128 bytes)",
    event: "Realtime ticket broadcast sent to subscribers",
    ringBuffer: "Capped 600-entry ring-buffer log observer",
    protocols: "TCP / UDP / WS",
    jsonInput: "JSON Input",
    yamlOutput: "YAML Output",
    processorSeam: "Standardized ToolProcessor<TInput, TOutput> seam",
    instantConversion: "Instant Conversion",
  },
} as const;
