export const socketTesterMessages = {
  activeMetric: "Aktif",
  appendAfterPayloadLabel: "Tambahkan setelah payload",
  asciiFormatLabel: "ASCII",
  autoScrollLabel: "Gulir otomatis",
  base64FormatLabel: "Base64",
  bridgeConnectFirstError: "Hubungkan WebSocket bridge terlebih dahulu",
  bridgeConnectionFailed: "Koneksi socket bridge gagal",
  bridgeStatusLabel: "Socket bridge",
  bridgeHelpAriaLabel: "Apa itu socket bridge?",
  bridgeTitle: "Socket bridge",
  bridgeDescription:
    "Memungkinkan browser tool menggunakan TCP dan UDP melalui backend.",
  bridgeUsage:
    "Digunakan oleh TCP Client, TCP Server, UDP, dan ISO 8583 “Send to TCP.”",
  bridgeConnectedLead: "Connected",
  bridgeConnectedDescription:
    "berarti bridge tersedia. Ini tidak berarti Anda telah terhubung ke target TCP server.",
  bridgeConnectedLog: "Bridge terhubung",
  bridgeDisconnectedLog: "Bridge terputus",
  bridgeCommandRejected: "Command ditolak: bridge sedang offline",
  bytesLabel: "Byte",
  clearButton: "Bersihkan",
  connectButton: "Hubungkan",
  connectedStatus: "Terhubung",
  copyHexLabel: "Salin hex",
  copyMetadataLabel: "Salin metadata",
  copyPayloadLabel: "Salin payload",
  copyRenderedDataLabel: "Salin data yang dirender",
  copyRenderedJsonLabel: "Salin JSON yang dirender",
  dataTitle: "Data",
  disconnectButton: "Putuskan",
  disconnectedStatus: "Terputus",
  documentDescription:
    "Rangkaian pengujian socket TCP dan UDP yang didukung oleh WebSocket bridge backend.",
  documentTitle: "Socket Tester",
  encodeAsLabel: "Encode sebagai",
  errorsMetric: "Error",
  formatLabel: "Format",
  frameContextDescription:
    "Inspeksi tingkat byte dan metadata bridge untuk frame yang dipilih.",
  frameContextTitle: "Konteks frame",
  frameInspectorDescription:
    "Periksa frame socket yang dipilih sebagai teks, byte, dan metadata bridge.",
  frameInspectorTitle: "Inspektor frame",
  framesMetric: "Frame",
  hexDumpCopied: "Hex dump disalin",
  hexDumpDescription: "Offset, byte heksadesimal, dan pratinjau ASCII.",
  hexDumpTitle: "Hex dump",
  hexFormatLabel: "Hex",
  hostLabel: "Host",
  hostRequiredDescription: "Masukkan nama host atau alamat IP.",
  inboundMetric: "Masuk (Inbound)",
  latestMetric: "Terbaru",
  lineEndingDescription:
    "Menambahkan CRLF, LF, atau tanpa pemisah setelah payload. CRLF umum digunakan untuk protokol teks; Tidak ada mengirimkan payload apa adanya.",
  lineEndingHelpAriaLabel: "Fungsi pemisah baris (line ending)",
  lineEndingLabel: "Akhir baris (Line ending)",
  listenPortLabel: "Port listen",
  metadataCopied: "Metadata disalin",
  metadataDescription: "Konteks bridge yang dilampirkan pada baris log ini.",
  metadataEmpty: "Tidak ada metadata yang terekam untuk frame ini.",
  metadataTitle: "Metadata",
  noActiveConnection: "Tidak ada koneksi aktif",
  noFramesCapturedDescription:
    "Hubungkan bridge, mulai socket, lalu kirim lalu lintas data.",
  noFramesCapturedTitle: "Tidak ada frame yang terekam",
  waitingForFrames: "Menunggu frame...",
  noneDelimiterLabel: "Tidak ada",
  outboundMetric: "Keluar (Outbound)",
  payloadCopied: "Payload disalin",
  payloadFormatLabel: "Format payload",
  payloadPlaceholder: "Ketik payload...",
  portLabel: "Port",
  portRangeDescription: "Masukkan port tujuan dari 1–65535.",
  protocolLabel: "Protokol",
  rawPayloadDescription:
    "Payload teks persis yang ditangkap dari frame terpilih.",
  rawPayloadTitle: "Payload mentah",
  renderedDataCopied: "Data yang dirender disalin",
  renderedDataDescription:
    "Payload bukan JSON valid, sehingga tampilan ini menampilkan balasan persis seperti yang diterima.",
  renderedDataTitle: "Data yang dirender",
  renderedJsonCopied: "JSON yang dirender disalin",
  renderedJsonDescription: "Tampilan JSON yang diurai dari payload frame.",
  renderedReplyDescription:
    "Balasan yang dirender terlebih dahulu, payload mentah di bawahnya untuk perbandingan byte-demi-byte.",
  saveButton: "Simpan",
  scopeLabel: "Cakupan",
  sendButton: "Kirim",
  sendPanelDescription: "Susun payload sebagai ASCII, hex, atau base64.",
  sendPanelTitle: "Panel kirim",
  startUdpListenerSrLabel: "Mulai listener UDP",
  stopUdpListenerSrLabel: "Hentikan listener UDP",
  targetHostLabel: "Host target",
  targetPortLabel: "Port target",
  udpStatelessDescription:
    "UDP send bersifat stateless. Mulai listener hanya jika Anda juga membutuhkan datagram inbound terekam di console.",
  crlfDelimiterLabel: "CRLF",
  lfDelimiterLabel: "LF",
  tcpClientDocumentDescription:
    "Pengujian socket klien TCP yang didukung oleh WebSocket bridge backend.",
  tcpClientDocumentTitle: "TCP Client | Socket Tester",
  tcpClientPageDescription:
    "Hubungkan ke endpoint TCP melalui backend bridge, kirim payload, dan periksa byte response.",
  tcpClientPageTitle: "TCP Client",
  tcpClientPortDescription:
    "Port tujuan: 1–65535. Port lokal ditetapkan oleh sistem operasi.",
  tcpClientStatusLabel: "Status TCP client",
  tcpClientConnectingLog: "Menghubungkan TCP client",
  tcpClientConnectedLog: "TCP client terhubung",
  tcpClientDisconnectedLog: "TCP client terputus",
  tcpConnected: "TCP terhubung",
  tcpConnectedDescription: "Terhubung ke {host}:{port}",
  tcpConnectionFailed: "Koneksi TCP gagal",
  tcpConnectionRefusedDescription: "{host}:{port} menolak koneksi. {message}",
  tcpConnectionUnableDescription: "Tidak dapat terhubung ke {host}:{port}",
  tcpServerDocumentDescription:
    "Pengujian socket server TCP yang didukung oleh WebSocket bridge backend.",
  tcpServerDocumentTitle: "TCP Server | Socket Tester",
  tcpServerPageDescription:
    "Mulai TCP listener lokal melalui backend bridge, pantau client yang terhubung, dan kirim response server.",
  tcpServerPageTitle: "TCP Server",
  tcpServerPortDescription:
    "Rentang port listener default: 18110–18120. Pilih port yang bebas dalam rentang ini.",
  tcpServerStartingLog: "Memulai TCP server",
  tcpServerListeningLog: "TCP server listening",
  tcpServerStoppedLog: "TCP server berhenti",
  tcpServerClientConnectedLog: "Client terhubung",
  tcpServerClientDisconnectedLog: "Client terputus",
  startServerButton: "Start server",
  stopServerButton: "Stop server",
  tcpServerListeningStatus: "LISTENING :{port}",
  tcpServerStoppedStatus: "SERVER STOPPED",
  activeClients: "Active clients",
  noTcpClients: "Tidak ada TCP client yang terhubung.",
  timestampLabel: "Stempel waktu",
  udpDocumentDescription:
    "Pengujian socket UDP yang didukung oleh WebSocket bridge backend.",
  udpDocumentTitle: "UDP | Socket Tester",
  udpListenerStartingLog: "Memulai UDP listener",
  udpListenerStartedLog: "UDP listener dimulai",
  udpListenerStoppedLog: "UDP listener dihentikan",
  udpPageDescription:
    "Kirim datagram UDP dan opsional listen untuk packet inbound dengan log packet serta inspeksi byte bersama.",
  udpPageTitle: "UDP",
  tour: {
    shared: {
      headerDescription:
        "Mulai di sini untuk menghubungkan WebSocket bridge, memeriksa status bridge, dan memilih alur kerja socket untuk halaman ini.",
      headerTitle: "Workspace uji socket",
      metricsDescription:
        "Pantau koneksi aktif, paket masuk, paket keluar, dan error bridge saat Anda menguji lalu lintas socket.",
      metricsTitle: "Metrik bridge",
      sendPanelDescription:
        "Tulis payload, pilih ASCII, hex, atau base64, lalu kirim setelah mode bridge dan socket siap.",
      sendPanelTitle: "Susun payload",
      trafficConsoleDescription:
        "Frame yang terekam muncul di sini dengan kontrol simpan, bersihkan, dan gulir otomatis. Klik frame yang terekam untuk memeriksa teks dan byte.",
      trafficConsoleTitle: "Periksa lalu lintas",
    },
    startButton: "Mulai panduan",
    tcpClient: {
      connectionDescription:
        "Masukkan host dan port target, hubungkan melalui bridge, lalu gunakan panel kirim untuk mentransmisikan payload.",
      connectionTitle: "Hubungkan ke endpoint TCP",
      statusDescription:
        "Ini menunjukkan apakah klien TCP terhubung serta host dan port mana yang aktif.",
      statusTitle: "Status TCP client",
    },
    tcpServer: {
      clientsDescription:
        "Klien yang terhubung muncul di sini. Pilih klien untuk menargetkan koneksi tertentu, atau biarkan tidak terpilih untuk menyiarkan (broadcast).",
      clientsTitle: "Targetkan klien terhubung",
      listenerDescription:
        "Pilih port listen dan mulai atau hentikan server TCP melalui bridge backend.",
      listenerTitle: "Mulai server TCP",
      statusDescription:
        "Gunakan baris status ini untuk mengonfirmasi apakah listener TCP dihentikan atau menerima koneksi klien.",
      statusTitle: "Status server",
    },
    udp: {
      listenerDescription:
        "Mulai listener jika Anda ingin datagram masuk ditangkap di konsol lalu lintas.",
      listenerTitle: "Listener UDP opsional",
      statusDescription:
        "Baris ini mengonfirmasi apakah listener UDP sedang mati atau mendengarkan di port tertentu.",
      statusTitle: "Status listener UDP",
      targetDescription:
        "Atur host dan port tujuan untuk datagram UDP tanpa status (stateless) sebelum mengirim payload.",
      targetTitle: "Target UDP",
    },
  },
  trafficConsoleDescription:
    "Periksa frame socket, payload, dan metadata bridge.",
  trafficConsoleTitle: "Konsol lalu lintas",
  udpListenerOffStatus: "LISTENER UDP MATI",
  udpListeningStatus: "UDP MENDENGARKAN :{port}",
  unableToCopy: "Tidak dapat menyalin",
  websocketBridgeError: "WebSocket bridge error",
  websocketBridgeAuthorizationFailed: "Otorisasi WebSocket bridge gagal",
} as const;
