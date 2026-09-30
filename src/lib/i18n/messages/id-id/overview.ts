export const overviewMessages = {
  activeResponsesDescription: "Templat aktif",
  activeResponsesTitle: "Respons Aktif",
  activeUsersTitle: "Pengguna Aktif",
  accountActivityDescription:
    "Status akses dan pengguna saat ini di seluruh workspace.",
  accountActivityTitle: "Aktivitas akun",
  adminUsersTitle: "Pengguna Admin",
  chat: {
    activatedLabel: "Diaktifkan",
    assistantName: "Panduan simulator",
    attentionLabel: "Perhatian",
    billerCoverageLabel: "Cakupan biller",
    billersLabel: "Biller",
    clearChat: "Reset obrolan",
    composerHint:
      "Ketik / untuk perintah slash · Enter untuk mengirim · Shift + Enter untuk baris baru",
    composerLabel: "Tanyakan operator biller",
    emptyDescription:
      "Jelajahi biller, endpoint, templat respons, dan sinyal integrasi dalam bahasa sehari-hari.",
    emptyTitle: "Apa yang ingin Anda cari?",
    endpointWithoutResponse: "{count} endpoint tidak memiliki templat respons",
    endpointsLabel: "Endpoint",
    endpointsWithoutResponses:
      "{count} endpoint tidak memiliki templat respons",
    errorTitle: "Tidak dapat membaca ringkasan",
    healthyCoverage: "Setiap endpoint memiliki templat respons",
    inputHint: "Mencari ringkasan simulator saat ini. Ketik / untuk perintah.",
    inputPlaceholder: "Tanyakan tentang biller, endpoint, atau respons…",
    operatorMascotAlt: "Maskot operator biller sedang membaca tablet",
    liveSnapshotDescription:
      "Tampilan ringkas konfigurasi dan cakupan respons saat ini.",
    liveSnapshotTitle: "Snapshot simulator langsung",
    loadingReply: "Memeriksa snapshot saat ini…",
    loadingSnapshot: "Membaca cakupan simulator…",
    noRecentEndpoints: "Belum ada endpoint yang dikonfigurasi.",
    openEndpoints: "Buka katalog endpoint",
    readOnlyLabel: "Ringkasan hanya-baca",
    recentEndpointsLabel: "Endpoint terbaru",
    responseTemplatesLabel: "Templat respons",
    send: "Kirim",
    collapseComposer: "Ciutkan komposer",
    expandComposer: "Perluas komposer",
    collapse: "Ciutkan",
    expand: "Perluas",
    suggestions: {
      snapshot: "Tampilkan snapshot simulator",
      missing: "Endpoint mana yang membutuhkan respons?",
      recent: "Tampilkan endpoint terbaru",
    },
    commands: {
      snapshotDescription: "Baca kesehatan, cakupan, dan jumlah simulator",
      snapshotLabel: "Tampilkan snapshot simulator",
      refreshDescription: "Ambil data langsung terbaru dari API simulator",
      refreshLabel: "Segarkan ringkasan",
      endpointsDescription: "Tinjau endpoint, method HTTP, dan path",
      endpointsLabel: "Katalog endpoint",
      billersDescription: "Periksa biller dan distribusi cakupan endpoint",
      billersLabel: "Rincian biller",
      missingDescription: "Cari endpoint tanpa templat respons aktif",
      missingLabel: "Respons yang hilang",
      toolsDescription: "Buka kotak alat developer integrasi",
      toolsLabel: "Alat developer",
      jwtDescription: "Dekode, periksa, dan verifikasi JSON Web Token",
      jwtLabel: "Inspektor JWT",
      iso8583Description: "Buat dan periksa pesan finansial ISO 8583",
      iso8583Label: "Generator ISO 8583",
      yamlDescription: "Konversi format JSON dan YAML dua arah",
      yamlLabel: "JSON ↔ YAML",
      schemaDescription: "Validasi payload terhadap spesifikasi JSON Schema",
      schemaLabel: "Validator schema",
      cronDescription: "Urai ekspresi cron dan pratinjau eksekusi berikutnya",
      cronLabel: "Parser cron",
      baseDescription: "Konversi biner, oktal, desimal, hex, dan base64",
      baseLabel: "Konverter basis angka",
      dateDescription: "Konversi timestamp Unix, ISO 8601, dan zona waktu",
      dateLabel: "Tanggal & zona waktu",
      socketsDescription: "Uji alur client/server TCP dan datagram UDP",
      socketsLabel: "Socket tester",
      socksRelayDescription:
        "Periksa relay proxy SOCKS5 untuk REST dan ISO 8583",
      socksRelayLabel: "Relay SOCKS",
      usersDescription: "Lihat jumlah pengguna dan aktivitas administrator",
      usersLabel: "Akun pengguna",
      helpDescription:
        "Jelajahi pertanyaan, perintah, dan pintasan yang tersedia",
      helpLabel: "Bantuan & lembar contekan",
      clearDescription: "Mulai percakapan baru dan reset sesi",
      clearLabel: "Bersihkan obrolan",
    },
    count: {
      endpoint: "endpoint",
      endpoints: "endpoint",
      configuredEndpoint: "configured endpoint",
      configuredEndpoints: "configured endpoint",
      response: "response",
      responses: "response",
      biller: "biller",
      billers: "biller",
      activeAccount: "active account",
      activeAccounts: "active account",
      registeredUser: "registered user",
      registeredUsers: "registered user",
      responseTemplate: "response template",
      responseTemplates: "response template",
      activeResponseTemplate: "active response template",
      activeResponseTemplates: "active response template",
    },
    replies: {
      help: "Berikut slash command dan query yang tersedia:\n\n• /snapshot — Lihat cakupan dan metrik simulator\n• /endpoints — Tinjau endpoint dan method HTTP\n• /billers — Rincian endpoint berdasarkan biller\n• /missing — Cari endpoint tanpa response template aktif\n• /tools — Buka 8 integration tool developer\n• /jwt, /iso8583, /schema, /json-yaml, /cron, /base, /date — Buka developer tool tertentu\n• /sockets & /socks-relay — Buka workspace pengujian socket dan proxy\n• /users — Aktivitas account (Admin)\n• /refresh — Ambil overview terbaru\n• /clear — Reset chat",
      jwt: "JWT Inspector memungkinkan Anda mendecode JSON Web Token, memeriksa Header dan Payload claims, serta memverifikasi signature kriptografi HS256/RS256 secara instan.",
      iso8583:
        "ISO 8583 Generator membantu membuat dan mensimulasikan financial transaction message, mengatur primary dan secondary bitmap, menguji MTI (0100, 0200, 0800), serta memeriksa packed byte stream.",
      yaml: "JSON ↔ YAML Converter menyediakan konversi dua arah dengan diagnostic error real-time, pengaturan indentasi, dan kemampuan menukar format.",
      schema:
        "JSON Schema Validator memeriksa dokumen JSON terhadap spesifikasi Draft-07 dan Draft 2020-12, serta melaporkan diagnostic line/path yang tepat saat validasi gagal.",
      cron: "Cron Parser menguraikan cron expression 5-field dan 6-field (dengan seconds) ke bahasa sederhana serta menghitung 5 execution timestamp berikutnya.",
      base: "Number Base Converter menangani konversi real-time antara binary, octal, decimal, hexadecimal, dan base64 dengan dukungan signed 2's complement dan unsigned integer.",
      date: "Date & Timestamp Converter mengonversi Unix epoch seconds/milliseconds, string ISO 8601, dan custom timezone offset.",
      sockets:
        "Socket & Relay Workspace memungkinkan pengujian interaktif TCP client/server endpoint, UDP datagram flow, dan konfigurasi SOCKS5 proxy relay tunnel.",
      tools:
        "Developer toolbox mencakup 8 integration utility khusus untuk konversi, validasi, parsing, dan inspeksi payload secara real-time.",
      missingWithGaps:
        "{count} endpoint masih membutuhkan response template. Sinyal perhatian dan katalog endpoint di bawah dapat membantu menutup gap ini.",
      missingWithoutGaps:
        "Setiap endpoint yang dikonfigurasi saat ini memiliki response template. Snapshot di bawah menampilkan cakupan simulator lainnya.",
      endpointSummary:
        "Simulator saat ini memiliki {count}. Saya menyertakan daftar endpoint terbaru dan response coverage di bawah.",
      billerSummary:
        "{count} tercatat di simulator. Snapshot mengelompokkan endpoint berdasarkan biller agar setup yang tidak seimbang mudah terlihat.",
      responseSummary:
        "{total} terkonfigurasi, dan {active} aktif ({percentage}). Snapshot di bawah memisahkan activation dan endpoint coverage.",
      adminUnavailable:
        "Aktivitas account hanya tersedia untuk administrator. Saya tetap dapat menampilkan biller, endpoint, dan response coverage dari overview ini.",
      userSummary:
        "{users}, dengan {accounts}. Sinyal account khusus administrator disertakan dalam snapshot di bawah.",
      snapshotSummary:
        "Berikut pembacaan simulator saat ini: biller, endpoint, response template, activation, dan endpoint terbaru dalam satu tempat.",
      fallback:
        "Saya dapat membaca snapshot simulator saat ini atau membawa Anda ke Endpoints, Developer Tools, dan Socket Tester. Ketik /help untuk melihat semua command.",
      unavailable:
        "Saya belum dapat membaca snapshot simulator. Coba /refresh setelah Overview API tersedia.",
      refreshSuccess:
        "Overview sudah di-refresh. Berikut simulator snapshot terbaru.",
      refreshFailed: "Saya tidak dapat me-refresh simulator snapshot. {error}",
      refreshFailedTryAgain:
        "Saya tidak dapat me-refresh simulator snapshot. Coba lagi sebentar.",
    },
    slashCommands: "Perintah slash",
    tryAQuestion: "Coba pertanyaan",
    updatedSource: "Dibaca dari API Overview",
    apiSnapshotUnavailable:
      "Overview API tidak mengembalikan simulator snapshot.",
    yourMessage: "Pesan Anda",
    assistantResponse: "Respons assistant",
    conversationLabel: "Percakapan overview simulator",
    scrollLatest: "Gulir ke respons terbaru",
    workspaceShortcuts: "Pintasan workspace",
    snapshot: {
      configuredCatalog: "KATALOG TERKONFIGURASI",
      configuredCatalogDescription:
        "Endpoint yang dikonfigurasi di simulator dengan routing method HTTP dan cakupan respons.",
      httpMethodBreakdown: "RINCIAN METHOD HTTP",
      responseCoverage: "CAKUPAN RESPONS",
      responseCoverageAria: "Cakupan response aktif",
      activeTemplateSummary:
        "{active} dari {total} templat aktif ({percentage})",
      allConfiguredActiveResponses:
        "Semua endpoint yang dikonfigurasi memiliki skenario response aktif.",
      missingTemplateSummary:
        "{count} endpoint masih membutuhkan templat respons.",
      configuredEndpointsAvailable:
        "Endpoint yang dikonfigurasi tersedia untuk pembuatan skenario.",
      recentConfigurations: "KONFIGURASI TERBARU",
      providerDirectory: "DIREKTORI PENYEDIA",
      providerDistribution:
        "Distribusi endpoint dan templat respons simulasi di seluruh biller.",
      allBillerProviders: "SEMUA PENYEDIA BILLER",
      billerCoverageAria: "Cakupan {name}",
      filterInCatalog: "Filter di katalog",
      noBillersRegistered: "Belum ada biller yang terdaftar.",
      groupedByProvider:
        "Endpoint dikelompokkan berdasarkan penyedia untuk menemukan cakupan yang tidak seimbang.",
      gapAnalysis: "ANALISIS KESENJANGAN",
      missingDescription:
        "Endpoint yang tidak memiliki skenario respons aktif atau memerlukan konfigurasi skenario.",
      needAttention: "{count} perlu perhatian",
      coverageReady: "Cakupan siap",
      missingResponses: "RESPONS HILANG",
      configuredTemplates: "TEMPLAT TERKONFIGURASI",
      activationRate: "TINGKAT AKTIVASI",
      requireScenarioTemplates: "{count} endpoint memerlukan templat skenario",
      requireScenarioDescription:
        "Tanpa templat respons, panggilan simulator ke endpoint ini akan menerima respons default atau 404. Buka katalog endpoint untuk membuat skenario mock.",
      allEndpointsTemplate:
        "Setiap endpoint yang dikonfigurasi saat ini memiliki templat respons aktif",
      allEndpointsDescription:
        "Semua endpoint simulator dilengkapi respons mock aktif dan siap menerima traffic pengujian.",
      endpointsInCatalog: "ENDPOINT DI KATALOG",
      requiresActiveTemplate:
        "Setiap endpoint memerlukan setidaknya satu templat respons aktif untuk simulasi penuh.",
      integrationUtility: "UTILITAS INTEGRASI",
      utility: "UTILITAS",
      runtime: "RUNTIME",
      maxPayload: "PAYLOAD MAKSIMUM",
      environment: "LINGKUNGAN",
      clientSide: "Sisi-klien",
      launchTool: "BUKA ALAT",
      openTool: "Buka {name}",
      localUtilityFooter:
        "Berjalan lokal di browser tanpa latensi jaringan atau kebocoran data.",
      integrationToolbox: "KOTAK ALAT INTEGRASI",
      toolboxDescription:
        "8 utilitas sisi-klien untuk konversi, validasi, penguraian, dan inspeksi payload.",
      utilityCount: "{count} utilitas",
      developerUtilitiesFooter:
        "Utilitas developer berjalan lokal di browser untuk manipulasi payload instan.",
      networkTransport: "TRANSPORT JARINGAN",
      networkTransportDescription:
        "Utilitas pengujian socket tingkat rendah dan workspace relay proxy SOCKS5 yang aman.",
      networkProtocols: "TCP / UDP / SOCKS5",
      tcpClient: "TCP Client",
      tcpClientDescription:
        "Client TCP interaktif untuk mengirim payload khusus dan streaming respons.",
      tcpServer: "TCP Server",
      tcpServerDescription:
        "Tangkap koneksi TCP client masuk dan balas dengan echo atau mock.",
      udpDatagram: "UDP Datagram",
      udpDatagramDescription:
        "Kirim paket UDP tanpa koneksi dan amati respons penerima.",
      socksRelayProxy: "Proxy Relay SOCKS",
      socksRelayProxyDescription:
        "Periksa routing proxy SOCKS5 untuk traffic REST API dan ISO 8583.",
      networkTransportFooter:
        "Utilitas socket dan proxy memungkinkan pengujian transportasi multi-protokol.",
      accessControl: "KONTROL AKSES",
      administratorOnlyDescription:
        "Tampilan khusus administrator untuk akun pengguna terdaftar dan izin sistem.",
      administratorSignal: "Sinyal administrator",
      totalAccounts: "TOTAL AKUN",
      administrators: "ADMINISTRATOR",
      accountActiveSummary: "{active} dari {total} akun terdaftar aktif",
      administratorSummary:
        "Simulator memiliki {administrators} peran administrator dengan hak konfigurasi dan pengelolaan pengguna penuh, serta {regular} pengguna standar.",
      administratorRestricted: "Metrik akun dibatasi untuk administrator.",
      currentRead: "Pembacaan saat ini",
      noBillerCoverage: "Belum ada cakupan biller.",
      responseTemplatesActive: "{active} dari {total} templat respons aktif.",
      accountSignal: "{active} akun aktif · {registered} pengguna terdaftar",
      updatedSource: "Dibaca dari API Overview",
    },
  },
  chartLabels: {
    active: "Aktif",
    activeUsers: "Pengguna Aktif",
    avgResponseTime: "Waktu Respons Rata-rata",
    deprecated: "Kedaluwarsa",
    inactive: "Nonaktif",
    inactiveUsers: "Pengguna Nonaktif",
    p95ResponseTime: "Waktu Respons P95",
    successful: "Berhasil",
    totalRequests: "Total Permintaan",
    users: "Pengguna",
  },
  configurationSignalDescription:
    "Lihat distribusi endpoint dan respons secara sekilas.",
  configurationSignalTitle: "Sinyal konfigurasi",
  coverageDescription:
    "Biller, endpoint, dan templat respons terkonfigurasi dalam satu tampilan.",
  coverageTitle: "Cakupan simulator",
  currentActiveAccountsDescription: "Akun pengguna aktif saat ini",
  documentDescription:
    "Lihat statistik Fleetime Labs, konfigurasi endpoint, dan distribusi respons Anda",
  documentTitle: "Ringkasan",
  endpointUsageTrendDescription:
    "Total permintaan dan respons berhasil selama 6 bulan terakhir",
  endpointUsageTrendTitle: "Tren Penggunaan Endpoint",
  endpointsMetricLabel: "Endpoint",
  responseStatusChartDescription:
    "Response yang dikonfigurasi berdasarkan HTTP status code",
  responseStatusChartTitle: "Distribusi HTTP Status Code Response",
  responsesMetricLabel: "Response",
  eyebrow: "Billing Simulator",
  httpMethodDistributionDescription: "Jumlah endpoint berdasarkan metode HTTP",
  httpMethodDistributionTitle: "Distribusi Metode HTTP",
  inactiveUsers: "{count} nonaktif",
  loadError: "Gagal memuat data ringkasan. Silakan coba segarkan halaman.",
  pageDescription:
    "Periksa cakupan endpoint, templat respons, dan aktivitas akun tanpa meninggalkan workspace simulator.",
  pageTitle: "Ringkasan",
  readOnlyAnalytics: "Analitik hanya-baca",
  retry: "Coba lagi",
  registeredAccounts: "Akun terdaftar",
  regularUsers: "{count} reguler",
  responseTimeTrendsDescription:
    "Waktu respons rata-rata dan P95 (md) selama 10 minggu terakhir",
  responseTimeTrendsTitle: "Tren Waktu Respons",
  totalBillersDescription: "Sistem biller",
  totalBillersTitle: "Total Biller",
  totalEndpointsDescription: "Rute endpoint yang dikonfigurasi di semua biller",
  totalEndpointsTitle: "Total Endpoint",
  totalResponsesDescription: "Templat respons",
  totalResponsesTitle: "Total Respons",
  totalUsersTitle: "Total Pengguna",
  userPercentageDescription: "{percentage}% dari pengguna",
  userRoleAdmin: "Admin",
  userRoleRegular: "Reguler",
  userRolesDescription: "Pembagian akun admin dan reguler",
  userRolesTitle: "Peran Pengguna",
  recentEndpointsTitle: "Endpoint Terbaru",
  recentEndpointsDescription: "Endpoint yang baru dikonfigurasi dalam sistem",
  recentEndpointsEmptyTitle: "Belum ada endpoint",
  recentEndpointsEmptyDescription:
    "Endpoint yang baru dikonfigurasi akan muncul di sini setelah tersedia.",
  endpointsByBillerTitle: "Endpoint berdasarkan Biller",
  endpointsByBillerDescription: "Distribusi endpoint di seluruh biller",
} as const;
