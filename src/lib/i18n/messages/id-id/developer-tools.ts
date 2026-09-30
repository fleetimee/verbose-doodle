export const developerToolsMessages = {
  accessLabel: "Akses",
  accessValue: "USER + ADMIN",
  allTools: "Semua alat",
  catalogControls: "Kontrol katalog",
  catalogNavigation: "Katalog alat",
  conversionCategory: "Konversi",
  converterDescription:
    "Konversi JSON dan YAML 1.2 dengan penguraian ketat, pemformatan rapi, dan pemeriksaan keamanan round-trip.",
  converterLimit: "1 MiB sumber",
  converterRuntime: "Hanya browser",
  converterTags: ["JSON", "YAML 1.2", "Konversi lokal"],
  cronParserDescription:
    "Buat jadwal Unix cron atau periksa ekspresi, dengan lima eksekusi berikutnya di zona waktu IANA mana pun.",
  cronParserLimit: "5 atau 6 field",
  cronParserRuntime: "Hanya browser",
  cronParserTags: ["Cron", "Zona waktu", "Pratinjau eksekusi"],
  dateConverterDescription:
    "Konversi detik Unix, milidetik, dan tanggal ISO 8601 di seluruh zona waktu UTC dan IANA.",
  dateConverterLimit: "Rentang tanggal ECMAScript",
  dateConverterRuntime: "Hanya browser",
  dateConverterTags: ["Waktu Unix", "ISO 8601", "Zona waktu"],
  description:
    "Ruang kerja terfokus untuk memeriksa data dan menjadwalkan tugas.",
  documentDescription:
    "Jelajahi alat validasi, konversi, dan penjadwalan untuk alur kerja pengembangan.",
  documentTitle: "Developer Tools",
  eyebrow: {
    one: "Indeks utilitas / {count} alat",
    other: "Indeks utilitas / {count} alat",
  },
  filesLabel: "File",
  filesValue: "Tanpa unggahan",
  gridView: "Tampilan kisi",
  inspectionCategory: "Inspeksi",
  iso8583GeneratorDescription:
    "Rakit pesan berbingkai ISO 8583 dengan input sadar-field dan bitmap langsung.",
  iso8583GeneratorLabel: "Generator",
  iso8583GeneratorLimit: "128 elemen data",
  iso8583GeneratorRuntime: "Hanya browser",
  iso8583GeneratorTags: ["ISO 8583", "MTI", "Bitmaps"],
  iso8583ParserDescription:
    "Urai stream ISO 8583 mentah atau hex dump menjadi elemen data terstruktur dengan semantik terdekode.",
  iso8583ParserLabel: "Parser",
  iso8583NavigationDescription:
    "Rakit, kemas, urai, dan periksa pesan ISO 8583.",
  iso8583ParserLimit: "128 elemen data",
  iso8583ParserRuntime: "Hanya browser",
  iso8583ParserTags: ["ISO 8583", "Stream Parser", "Inspeksi", "Bitmaps"],
  jwtInspectorDescription:
    "Dekode, periksa, edit, dan verifikasi JSON Web Tokens (JWT) menggunakan Web Crypto sisi-klien yang aman.",
  jwtInspectorLimit: "Struktur JWT standar",
  jwtInspectorRuntime: "Hanya browser",
  jwtInspectorTags: ["JWT", "Base64URL", "HMAC", "RSA", "ECDSA", "Ed25519"],
  listView: "Tampilan daftar",
  navigationGroup: "Developer Tools",
  nfcBridgeConnectionStates: {
    connected: "Terhubung",
    connecting: "Menghubungkan",
    disconnected: "Terputus",
    error: "Kesalahan koneksi",
    reconnecting: "Menghubungkan ulang",
  },
  nfcBridgeErrors: {
    eventTypeMissing: "Bridge mengirim event tanpa type.",
    localBridgeUnavailable:
      "Local bridge tidak dapat dijangkau. Jalankan bridge lalu coba lagi.",
    malformedJson: "Bridge mengirim malformed JSON.",
    protocolUnsupported: "Versi protocol bridge tidak didukung.",
    unknownEvent: "Bridge mengirim event yang tidak dikenal: {type}.",
  },
  nfcBridgeNotConnected:
    "Hubungkan ke bridge lokal untuk membaca versi dan kemampuannya.",
  nfcBridgeStatusLabel: "Status bridge",
  nfcBridgeVersionLabel: "Bridge protokol",
  nfcClearScan: "Bersihkan scan",
  nfcConnectBridge: "Hubungkan bridge",
  nfcCopied: "Disalin",
  nfcCopy: "Salin",
  nfcCopyDecoded: "Salin teks terdekode",
  nfcCopyFailed: "Gagal menyalin",
  nfcCopyRaw: "Salin NDEF mentah",
  nfcCopyRecord: "Salin record",
  nfcCopyUid: "Salin UID tag",
  nfcDisconnectBridge: "Putuskan",
  nfcDownloadBridge: "Unduh rilis bridge",
  nfcReaderCatalogDescription:
    "Hubungkan ke loopback bridge dan periksa record NDEF terstruktur dari pembaca ACS.",
  nfcReaderDescription:
    "Periksa setiap record NDEF dari pembaca ACS Anda sementara pemindaian tetap berada di bridge lokal.",
  nfcReaderDocumentDescription:
    "Periksa pemindaian NFC lokal, record NDEF, dan kesehatan pembaca ACS PC/SC.",
  nfcReaderDocumentKeywords: [
    "pembaca NFC",
    "pembaca ACS",
    "PC/SC",
    "WebSocket bridge",
  ],
  nfcReaderDocumentTitle: "Inspektor Pembaca NFC",
  nfcReaderEyebrow: "Inspeksi perangkat keras / bridge lokal",
  nfcReaderLimit: "Loopback WebSocket",
  nfcReaderName: "Inspektor Pembaca NFC",
  nfcReaderNextStepDescription:
    "Setiap pemindaian mempertahankan pesan NDEF mentah, urutan record, metadata, dan payload terdekode agar Anda dapat membandingkan tag dengan fixture integrasi.",
  nfcReaderNextStepTitle: "Inspeksi terstruktur siap",
  nfcReaderNotDetected:
    "Tidak ada pembaca yang kompatibel melaporkan diri ke bridge.",
  nfcReaderRuntime: "Bridge Bun lokal",
  nfcReaderStates: {
    detected: "Pembaca terdeteksi",
    "tag-detected": "Tag terdeteksi",
    unavailable: "Pembaca tidak tersedia",
    waiting: "Menunggu tag",
  },
  nfcReaderStatusLabel: "Status pembaca",
  nfcReaderTags: ["NFC", "PC/SC", "ACS", "WebSocket"],
  nfcReaderTitle: "Inspektor Pembaca NFC",
  nfcReaderTransport: "LOOPBACK / WS",
  nfcRetryBridge: "Coba lagi koneksi",
  nfcScanConnectionInterrupted:
    "Koneksi bridge lokal terputus. Menghubungkan ulang…",
  nfcScanConnectionUnavailable:
    "Bridge lokal tidak merespons. Periksa bridge dan coba lagi secara manual.",
  nfcScanDecodedLabel: "Teks terdekode",
  nfcScanDecodingStatuses: {
    decoded: "Teks terdekode",
    malformed: "Record rusak (malformed)",
    "no-text": "Bukan record teks",
    unsupported: "Record tidak didukung",
  },
  nfcScanDecodingStatusLabel: "Status dekode",
  nfcScanEmpty: "Tempatkan tag NDEF pada pembaca untuk mengisi area inspeksi.",
  nfcScanNoDecodedText:
    "Tidak ada teks yang dapat dibaca manusia yang didekodekan.",
  nfcScanRawLabel: "NDEF Mentah",
  nfcScanRecordIdHexLabel: "Hex ID record",
  nfcScanRecordIdLabel: "ID Record",
  nfcScanRecordIdUnavailable: "Tidak ada ID record",
  nfcScanRecordLabel: "Record {index}",
  nfcScanRecordPayloadHexLabel: "Hex payload",
  nfcScanRecordPayloadLabel: "Payload terdekode",
  nfcScanRecordPayloadUnavailable: "Tidak ada payload terdekode",
  nfcScanRecordRawLabel: "Record mentah",
  nfcScanRecordsLabel: "Record NDEF",
  nfcScanRecordTnfLabel: "TNF",
  nfcScanRecordTypeHexLabel: "Hex tipe",
  nfcScanRecordTypeLabel: "Tipe",
  nfcScanSessionLabel: "Sesi pemindaian",
  nfcScanSessionStates: {
    scanning: "Memindai",
    stopped: "Berhenti",
  },
  nfcScanTimestampLabel: "Ditangkap pada",
  nfcScanTitle: "Pemindaian terbaru",
  nfcScanUidLabel: "UID Tag",
  nfcScanUidUnavailable: "Pembaca tidak memunculkan UID.",
  nfcScanWarningLabel: "Peringatan dekode",
  nfcStartScan: "Mulai pindai",
  nfcStopScan: "Hentikan pindai",
  nfcTour: {
    bridgeDescription:
      "Mulai di sini. Browser terhubung ke bridge lokal, yang melaporkan pembaca ACS dan menjaga data kartu tetap berada di mesin ini.",
    bridgeTitle: "Hubungkan bridge lokal",
    releaseDescription:
      "Perlu konektor lokal? Buka rilis Gitea v0.1.0 untuk mengunduh bridge untuk platform Anda dan file pembantunya.",
    releaseTitle: "Pasang rilis bridge",
    scanDescription:
      "Payload NDEF terbaru, UID, status dekode, dan record individual muncul di sini dengan aksi salin untuk fixture integrasi.",
    scanTitle: "Periksa pemindaian terbaru",
    sessionDescription:
      "Mulai sesi saat pembaca siap, lalu hentikan saat Anda ingin mempertahankan tangkapan saat ini.",
    sessionTitle: "Kontrol sesi pemindaian",
    startButton: "Mulai tur NFC",
  },
  numberBaseConverterDescription:
    "Konversi nilai tepat 8-, 16-, 32-, dan 64-bit melintasi biner, oktal, desimal, dan heksadesimal.",
  numberBaseConverterLimit: "Tepat 64-bit",
  numberBaseConverterRuntime: "Hanya browser",
  numberBaseConverterTags: ["Biner", "Heksadesimal", "Two's complement"],
  openAction: "Buka alat",
  openTool: "Buka {tool}",
  pageTitle: "Developer Tools",
  pageTitleSuffix: "Developer Tools",
  schedulingCategory: "Penjadwalan",
  schemaValidatorDescription:
    "Validasi dokumen JSON terhadap skema Draft 7, 2019-09, atau 2020-12 dengan diagnostik berbasis jalur.",
  schemaValidatorLimit: "1 MiB per masukan",
  schemaValidatorRuntime: "Layanan validasi",
  schemaValidatorTags: ["JSON Schema", "Diagnostik", "Pemeriksaan format"],
  schemaValidatorSearchDescription: "Validasi JSON terhadap skema.",
  jwtInspectorSearchDescription:
    "Dekode, edit, dan verifikasi JSON Web Tokens.",
  dateConverterSearchDescription:
    "Konversi timestamp dan tanggal melintasi zona waktu.",
  iso8583GeneratorSearchDescription: "Bangun dan kemas pesan ISO 8583.",
  converterSearchDescription: "Konversi antara JSON dan YAML.",
  numberBaseConverterSearchDescription:
    "Konversi nilai biner, oktal, desimal, dan heksadesimal.",
  cronParserSearchDescription:
    "Buat jadwal cron, jelaskan ekspresi, dan lihat eksekusi mendatang.",
  nfcReaderSearchDescription: "Periksa pemindaian NFC dan record NDEF.",
  iso8583ParserSearchDescription:
    "Urai stream ISO 8583 mentah dan periksa field-nya.",
  showingCount: {
    one: "Menampilkan {count} alat",
    other: "Menampilkan {count} alat",
  },
  validationCategory: "Validasi",
} as const;
