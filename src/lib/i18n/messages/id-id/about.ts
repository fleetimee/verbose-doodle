export const aboutMessages = {
  contentAriaLabel: "Konten halaman tentang",
  developerToolsDescription:
    "Utilitas terintegrasi untuk konversi JSON/YAML, validasi JSON Schema, inspeksi JWT, parsing cron, dan konversi basis angka",
  developerToolsTitle: "Developer Tools Suite:",
  documentDescription:
    "Pelajari lebih lanjut tentang Fleetime Labs - alat canggih untuk pembuatan prototipe skenario billing",
  documentTitle: "Tentang",
  endpointManagementDescription:
    "Konfigurasikan dan pantau endpoint API billing dengan pelacakan status real-time",
  endpointManagementTitle: "Manajemen Endpoint:",
  headerDescription:
    "Fleetime Labs membantu tim membuat prototipe alur billing menggunakan skenario JSON yang dapat dikonfigurasi, developer tools, bridge protokol, dan komponen antarmuka yang dapat digunakan kembali.",
  headerTitle: "Tentang Proyek Ini",
  interactiveDemoDescription:
    "Jelajahi bagaimana Fleetime Labs menangani simulasi endpoint, bridge protokol, dan utilitas pengembang secara real-time.",
  interactiveDemoTitle: "Pratinjau Simulator Interaktif",
  jsonDrivenDescription:
    "Konfigurasi fleksibel menggunakan skenario JSON untuk pembuatan prototipe cepat",
  jsonDrivenTitle: "Berbasis JSON:",
  keyFeaturesTitle: "Fitur Utama",
  logoAlt: "Fleetime Labs",
  modernStackDescription:
    "Dibangun dengan React 19, TypeScript, dan Vite untuk performa optimal",
  modernStackTitle: "Modern Stack:",
  ourTeamTitle: "Tim Kami",
  returnHome: "Kembali ke Beranda",
  socketTestingDescription:
    "Simulasi mesin status protokol TCP/UDP tingkat rendah dan bridge event WebSocket real-time",
  socketTestingTitle: "Socket & Protocol Tester:",
  socksRelayDescription:
    "Pemantauan lalu lintas relay proxy jaringan langsung dan ring-buffer log event",
  socksRelayTitle: "Inspeksi SOCKS Relay:",
  systemArchitectureDescription:
    "Ringkasan interaktif tentang bagaimana frontend React berkomunikasi dengan backend Spring Boot, catch-all controller dinamis, lapisan keamanan JWT, dan penyimpanan data PostgreSQL.",
  systemArchitectureTitle: "Arsitektur Sistem",
  technologyDescription:
    "Aplikasi ini memanfaatkan teknologi mutakhir termasuk React 19 dengan kompiler baru, TypeScript untuk type safety, TanStack Query untuk pengambilan data, dan Tailwind CSS untuk styling. Library komponen dibangun di atas shadcn/ui dengan primitif Base UI.",
  technologyTitle: "Teknologi",
  userAdministrationDescription:
    "Kontrol akses berbasis peran (RBAC) dengan manajemen pengguna khusus untuk administrator",
  userAdministrationTitle: "Administrasi Pengguna:",
  versionFooterTitle: "Informasi Sistem & Rilis",
  versionFooterReleases: "Rilis",
  versionTagLabel: "Tag Versi",
  gitReleaseShaLabel: "Git Release SHA",
  viewCommitOnGitea: "Lihat commit {sha} di Gitea",
  buildTimestampLabel: "Build Timestamp",
  whatIsThisDescription:
    "Fleetime Labs adalah platform andal yang dirancang untuk membantu tim membuat prototipe, menguji, dan memvisualisasikan skenario billing melalui antarmuka yang intuitif. Dibangun dengan teknologi web modern, platform ini menyediakan rangkaian terpadu untuk mengelola endpoint API billing, state machine socket bridge, network relay, dan utilitas konversi pengembang.",
  whatIsThisTitle: "Apa ini?",
  techStack: {
    filterAria: "Filter kategori teknologi",
    categories: {
      all: "Semua",
      core: "Core",
      uiStyling: "UI & Styling",
      toolingState: "Tooling & State",
    },
    docsHint: "Klik badge untuk membuka dokumentasi resmi ↗",
    descriptions: {
      react:
        "Library UI dengan compiler baru untuk memoization otomatis dan concurrent rendering.",
      typescript:
        "Superset JavaScript bertipe yang dikompilasi menjadi JS biasa; menemukan bug saat compile time.",
      vite: "Build tool cepat berbasis native ES modules dengan HMR instan.",
      bun: "JavaScript runtime & toolkit lengkap: package manager, bundler, dan test runner yang cepat.",
      tailwind:
        "Framework CSS utility-first dengan konfigurasi native CSS dan tanpa overhead runtime.",
      baseUi:
        "UI primitive accessible tanpa style dari MUI untuk membangun design system React modern.",
      motion:
        "Animation library production-ready untuk React dengan animasi deklaratif berbasis physics.",
      tanstackQuery:
        "State management async dengan caching otomatis, background refetching, dan stale-while-revalidate.",
      reactHookForm:
        "Form management fleksibel dan performant dengan re-render minimal serta validasi bawaan.",
      reactRouter:
        "Routing client-side deklaratif untuk React dengan nested route dan loader pattern.",
    },
  },
  architecture: {
    ariaLabel: "Diagram arsitektur sistem interaktif",
    legendAriaLabel: "Legenda node",
    layers: {
      client: "Client Layer",
      application: "Application Layer",
      service: "Service Layer",
      data: "Data Layer",
    },
    idleDescription:
      "Arahkan atau fokuskan node untuk melihat hubungan layer sistem — dari React client ke Spring Boot controller hingga PostgreSQL data store.",
    nodes: {
      frontend: {
        label: "React Frontend",
        sublabel: "Vite + TanStack Query",
        description:
          "Single-page application yang dibangun dengan React 19, TypeScript, dan TanStack Query. Berkomunikasi dengan backend melalui REST API dan WebSocket bridge untuk simulasi protocol real-time.",
      },
      apiGateway: {
        label: "Spring Boot",
        sublabel: "Embedded Tomcat + REST",
        description:
          "Aplikasi Spring Boot dengan embedded Tomcat servlet container. Menyediakan REST endpoint di bawah /api/** dan menangani lifecycle HTTP, routing request, serta serialisasi response.",
      },
      controller: {
        label: "Catch-all Controller",
        sublabel: "@Order(LOWEST_PRECEDENCE)",
        description:
          "Spring MVC controller dinamis yang didaftarkan pada prioritas Spring bean terendah. Menangkap route /api/** yang tidak cocok dan mengarahkannya ke skenario biller berbasis JSON di database.",
      },
      jwt: {
        label: "JWT Security",
        sublabel: "Spring Security Filter Chain",
        description:
          "Autentikasi JWT stateless melalui Spring Security filter chain. Setiap API request membawa signed Bearer token; filter memvalidasi signature dan memasukkan user principal ke security context.",
      },
      database: {
        label: "PostgreSQL",
        sublabel: "JSON Scenario Data Store",
        description:
          "Database relasional PostgreSQL yang menyimpan konfigurasi endpoint biller, JSON scenario payload, user record, dan transaction history. Diakses melalui Spring Data JPA repository.",
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
