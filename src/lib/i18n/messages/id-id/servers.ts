export const serversMessages = {
  cleanup: {
    copyCleanupCommand: "Salin perintah pembersihan",
    diskCleanup:
      "Periksa direktori besar terlebih dahulu, lalu pilih file atau pembersihan khusus aplikasi. Tidak ada perintah prune disk umum.",
    journalCleanup:
      "Pembersihan merotasi journal dan menghapus arsip log yang lebih lama dari 14 hari. Memerlukan izin pengelolaan journal; berjalan tanpa konfirmasi.",
    imagesCleanup:
      "Pembersihan menghapus semua image yang tidak digunakan container mana pun, termasuk image bertag. Image mungkin perlu diunduh atau dibangun ulang. Docker meminta konfirmasi.",
    containersCleanup:
      "Pembersihan menghapus semua container yang berhenti beserta data pada lapisan tulisnya. Docker meminta konfirmasi.",
    volumesCleanup:
      "Pembersihan menghapus volume anonim yang tidak digunakan beserta datanya. Volume bernama tetap disimpan pada Docker Engine 23+. Periksa konfirmasi Docker sebelum melanjutkan.",
    buildCacheCleanup:
      "Pembersihan menghapus semua cache build yang tidak digunakan. Build berikutnya mungkin lebih lama. Docker meminta konfirmasi.",

    copyCommand: "Salin perintah pemeriksaan",
    button: "Pembersihan",
    title: "Tinjauan pembersihan",
    description:
      "Periksa penggunaan penyimpanan sebelum menentukan yang akan dihapus.",
    scope:
      "Perintah hanya disalin; tidak ada yang dijalankan otomatis. Perintah pemeriksaan menampilkan penggunaan. Perintah pembersihan menghapus data sesuai penjelasan di atas saat dijalankan di SSH. Ruang yang dapat dibebaskan adalah perkiraan Docker, bukan jaminan.",
    journal: "Journal sistem",
    journalHint: "Penggunaan yang dapat dilihat akun SSH tersimpan.",
    diskUsage: "{used} dari {total} terpakai · sisa {free}",
    pressure:
      "Penggunaan disk di atas 75%; tinjau direktori besar dan retensi.",
    images: "Image",
    containers: "Container",
    volumes: "Volume lokal",
    buildCache: "Cache build",
    used: "{size} terpakai",
    reclaimable: "{size} dapat dibebaskan",
    counts: "{active} aktif dari {total}",
    unavailable:
      "Pemeriksaan penyimpanan tidak tersedia. Periksa akses SSH dan coba lagi.",
    dockerUnavailable:
      "Penyimpanan Docker tidak dapat diperiksa pada host ini.",
    missing: "Tidak tersedia",
    loading: "Memeriksa penyimpanan…",
    ssh: "Buka Host SSH",
    sshHint: "Membuka terminal host di tab baru untuk pemeriksaan manual.",
    refresh: "Perbarui pemeriksaan",
  },
  containers: {
    logsTitle: "Log container",
    logsIdle: "Mulai streaming untuk melihat keluaran container.",
    logsConnecting: "Menghubungkan ke aliran log…",
    logsLive: "Langsung · mengikuti keluaran container",
    logsEnded:
      "Aliran log berakhir. Jeda lalu mulai lagi untuk menghubungkan ulang.",
    logsFailed:
      "Log tidak tersedia. Periksa container dan driver logging Docker.",
    logsFollow: "Ikuti log",
    logsClear: "Bersihkan",
    logsPause: "Jeda streaming",
    logsStart: "Mulai streaming",
    logsEmpty: "Belum ada keluaran log untuk ditampilkan.",
    logsHint:
      "Menampilkan 200 baris log terakhir, lalu mengalirkan keluaran baru dengan waktu. Menyimpan 200.000 karakter terbaru. Menjeda atau menyembunyikan tab memutus aliran; melanjutkan memuat ulang log terbaru.",

    installedSoftware: "Perangkat lunak terpasang",
    softwareDescription:
      "Alat umum yang tersedia pada PATH pengguna container.",
    softwareEmpty: "Tidak ada alat umum yang diperiksa terdeteksi.",
    softwareUnavailable:
      "Deteksi perangkat lunak tidak tersedia. Container harus berjalan dengan shell sh yang berfungsi.",
    hostTerminal: "SSH host",
    liveMetrics: "Penggunaan sumber daya terkini",
    stoppedMetrics:
      "Penggunaan terkini tidak tersedia saat kontainer berhenti.",
    start: "Jalankan kontainer",
    stop: "Hentikan kontainer",
    restart: "Mulai ulang kontainer",
    exec: "Shell kontainer",
    stopTitle: "Hentikan kontainer ini?",
    restartTitle: "Mulai ulang kontainer ini?",
    stopDescription:
      "Hentikan {name} pada {host}? Koneksi aktif akan terputus. Docker memberi waktu 10 detik untuk berhenti sebelum menghentikannya secara paksa.",
    restartDescription:
      "Mulai ulang {name} pada {host}? Koneksi aktif akan terputus. Docker memberi waktu 10 detik untuk berhenti sebelum menjalankannya kembali.",
    actionWorking: "Memproses…",
    actionSuccess: "Tindakan kontainer selesai",
    invalidState:
      "Status kontainer tidak mengizinkan tindakan ini. Muat ulang detail dan coba lagi.",
    actionFailed:
      "Tindakan kontainer gagal atau melewati batas waktu. Muat ulang status sebelum mencoba lagi.",
    managementHint:
      "Jalankan tersedia untuk kontainer yang berhenti. Hentikan, mulai ulang, dan terminal tersedia saat berjalan.",
    execFailed:
      "Shell kontainer tidak dapat dijalankan. Pastikan kontainer berjalan, Docker dapat diakses, dan /bin/sh atau /bin/bash tersedia. Shell host tidak digunakan sebagai pengganti.",
    shell: "Shell kontainer",
    backToContainer: "Kembali ke kontainer",
    terminalEnded:
      "Sesi shell kontainer berakhir. Hubungkan kembali untuk membuka shell lain.",
    terminalHelp:
      "Perintah berjalan di dalam kontainer terpilih sebagai pengguna yang dikonfigurasi. Keluar atau putuskan koneksi mengakhiri sesi shell; kontainer tetap berjalan. Browser file host tidak tersedia.",
    hostDetails: "Detail host",
    hostDetailDescription:
      "Metrik sistem dan kontainer terkini dalam satu tempat.",
    backToHosts: "Kembali ke daftar host",
    backToHost: "Kembali ke host",
    view: "Tampilan server",
    serversTitle: "Server kontainer",
    hostMetrics: "Metrik host",
    stopped: "Berhenti",
    total: "Total",
    coreCount: "{count} inti",
    images: "Image",
    pausedCount: "{count} dijeda",
    openContainer: "Lihat kontainer {name}",
    networkTotal: "Total net",
    ioTotal: "Total I/O",
    detailTitle: "Detail kontainer",
    serverContainers: "Kontainer · {name}",
    backToContainers: "Kembali ke kontainer",
    otherStates: "Kontainer lainnya",
    autoRefresh: "Diperbarui setiap 5 detik",
    containerName: "Nama",
    containerId: "ID kontainer",
    path: "Path executable",
    image: "Image",
    created: "Dibuat",
    networks: "Jaringan / alamat IP",
    mounts: "Volume bind / mount",
    noAddress: "Belum ada alamat IP",
    notPublished: "Tidak dipublikasikan",
    readWrite: "Baca / tulis",
    readOnly: "Hanya baca",
    basicInfo: "Informasi dasar",
    noNetworks: "Tidak ada jaringan terhubung.",
    noPorts: "Tidak ada port yang diekspos atau dipublikasikan.",
    noMounts: "Tidak ada volume bind atau mount.",
    refreshDetails: "Muat ulang detail",
    readOnlyDetails: "Detail kontainer terkini, hanya-baca.",
    notFound:
      "Kontainer ini tidak lagi tersedia. Kembali ke daftar kontainer dan muat ulang.",
    openDetails: "Lihat detail server {name}",
    overview: "Ringkasan server",
    title: "Kontainer Docker",
    description: "Kontainer aktif pada server ini.",
    count: "{running} berjalan · {total} total",
    refresh: "Muat ulang kontainer",
    loading: "Memuat kontainer…",
    search: "Cari kontainer…",
    includeStopped: "Sertakan yang berhenti",
    name: "Nama / image",
    state: "Status",
    ports: "Port",
    credentialsRequired:
      "Simpan nama pengguna dan kata sandi SSH untuk melihat kontainer.",
    notInstalled:
      "Docker CLI belum terinstal atau tidak tersedia untuk akun SSH ini.",
    dockerUnavailable:
      "Tidak dapat mengakses Docker pada server ini. Pastikan Docker berjalan dan akun SSH dapat mengakses /var/run/docker.sock, lalu muat ulang.",
    collectionFailed:
      "Tidak dapat memuat kontainer. Periksa akses Docker melalui terminal, lalu muat ulang.",
    limitExceeded:
      "Output kontainer melebihi batas kolektor (500 kontainer atau 1 MiB). Gunakan terminal atau Portainer untuk memeriksa host ini.",
    statsUnavailable:
      "Penggunaan sumber daya kontainer tidak tersedia. Daftar kontainer tetap ditampilkan; muat ulang untuk mencoba lagi.",
    empty: "Tidak ada kontainer yang cocok",
    emptyDescription:
      "Coba pencarian lain atau sertakan kontainer yang berhenti. Server ini mungkin belum memiliki kontainer.",
    scope:
      "Pemantauan hanya-baca melalui SSH, diperbarui setiap 5 detik saat halaman ini aktif. Mencakup kontainer yang dikelola Portainer pada soket Docker standar host ini; lingkungan Portainer lainnya tidak disertakan. CPU dapat melebihi 100% jika memakai beberapa inti. Angka jaringan dan I/O adalah total kumulatif, bukan laju transfer. Riwayat tidak disimpan.",
    states: {
      created: "Dibuat",
      restarting: "Memulai ulang",
      running: "Berjalan",
      removing: "Menghapus",
      paused: "Dijeda",
      exited: "Berhenti",
      dead: "Mati",
    },
  },
  metrics: {
    totalCapacity: "/{total}",
    terminalFor: "Buka terminal untuk {name}",
    title: "Metrik Server",
    documentTitle: "Metrik server | Fleetime Labs",
    details: "Detail pengukuran",
    inventory: "Inventaris",
    description:
      "Metrik sistem dan Docker terkini, dikelompokkan menurut host.",
    scope:
      "Satu akun SSH per host. Memori tidak menghitung cache yang dapat diklaim kembali; penggunaan disk untuk /. Total jaringan mengecualikan loopback dan dapat mencakup antarmuka virtual. I/O menjumlahkan perangkat blok utuh, tanpa perangkat loop, RAM, device-mapper, dan RAID. Riwayat tidak disimpan.",
    search: "Cari server SSH…",
    pause: "Jeda pembaruan",
    resume: "Lanjutkan pembaruan",
    paused: "Dijeda",
    live: "Langsung",
    unavailable: "Tidak tersedia",
    collecting: "Memuat metrik…",
    cpu: "CPU",
    memory: "Memori",
    disk: "Disk (/)",
    network: "Jaringan",
    io: "I/O disk",
    receive: "Terima",
    transmit: "Kirim",
    read: "Baca",
    write: "Tulis",
    cores: "{count} inti",
    uptime: "Aktif {days} hari {hours} jam",
    uptimeUnavailable: "Waktu aktif tidak tersedia",
    uptimeLabel: "Waktu aktif",
    specSystem: "Sistem",
    specProcessor: "Prosesor",
    specResources: "Sumber daya",
    specTitle: "Spesifikasi server",
    specDescription: "Detail sistem yang dilaporkan melalui SSH.",
    specOs: "Sistem operasi",
    specKernel: "Kernel",
    specArch: "Arsitektur",
    specHostname: "Nama host",
    specCpu: "CPU",
    specAes: "AES-NI",
    specVirt: "Virtualisasi",
    specVm: "Mesin virtual",
    specBare: "Bare metal",
    specSwap: "Swap",
    specLoad: "Rata-rata beban",
    specYes: "Aktif",
    specNo: "Nonaktif",
    specNone: "Tidak ada",
    updated: "Diambil {time}",
    hostKeyRequired:
      "Buka terminal dan tinjau kunci host SSH server ini sebelum mengambil metrik. Jika sudah dipercaya, periksa konfigurasi known_hosts backend.",
    collectionFailed:
      "Metrik server tidak dapat dibaca. Periksa akses ke /proc, /sys, dan df, lalu lanjutkan pembaruan.",
    unsupported: "Metrik saat ini hanya mendukung Linux melalui SSH.",
    busy: "Pengumpul metrik sedang sibuk. Pengambilan akan dicoba pada pembaruan berikutnya.",
    empty: "Tidak ada server SSH yang cocok",
    emptyDescription:
      "Tambahkan entri SSH Linux dengan nama pengguna dan kata sandi tersimpan, atau ubah pencarian.",
    previous: "Sebelumnya",
    next: "Berikutnya",
  },
  sessionExitTitle: "Putuskan koneksi ke {server}?",
  sessionExitDescription:
    "Koneksi akan berakhir dan transfer file yang sedang berjalan akan terputus. Server menentukan apakah desktop atau proses Anda tetap berjalan.",
  sessionKeepConnected: "Tetap terhubung",
  sessionDisconnectAndLeave: "Putuskan dan keluar",

  rdpTakeoverNotificationTitle: "Sesi RDP diambil alih: {name}",
  rdpDisconnectDialogTitle: "Desktop jarak jauh terputus",
  rdpSessionTakenOver:
    "Koneksi lain mengakhiri sesi RDP Anda. Anda dapat menghubungkan ulang, tetapi tindakan ini dapat memutus koneksi tersebut.",
  rdpSessionForcedClosed:
    "Server mengakhiri sesi RDP Anda secara paksa. Hubungkan ulang untuk mencoba lagi.",
  rdpDisconnectUnexpected:
    "Koneksi RDP Anda berakhir tanpa diminta. Penyebabnya dapat berupa koneksi lain, jaringan, atau server. Hubungkan ulang untuk mencoba lagi.",

  sftpBrowserTitle: "Browser file SFTP",
  sftpOpenBrowser: "Buka browser file",
  sftpBackToTerminal: "Kembali ke terminal",
  sftpLocal: "Lokal",
  sftpSelectedFiles: "File pilihan",
  sftpChooseFiles: "Pilih file",
  sftpChooseFolder: "Pilih folder",
  sftpLocalHint:
    "File lokal tetap di komputer Anda sampai diunggah. Pilih file atau folder untuk menjelajahinya. Unduhan mengikuti lokasi penyimpanan browser.",
  sftpLocalEmpty:
    "Pilih file lokal atau folder untuk memulai. Pemilihan folder menampilkan file beserta foldernya; folder kosong tidak disertakan.",
  sftpEmptyDirectory: "Direktori ini kosong.",
  sftpNoMatches: "Tidak ada file yang cocok dengan filter.",
  sftpLoading: "Memuat direktori...",
  sftpListFailed:
    "Direktori tidak dapat dimuat. Periksa path, izin akun, dan dukungan SFTP, lalu muat ulang.",
  sftpNotDirectory:
    "Path ini bukan direktori. Masukkan path folder atau unduh file tersebut.",
  sftpModified: "Tanggal diubah",
  sftpSize: "Ukuran",
  sftpKind: "Jenis",
  sftpFolder: "Folder",
  sftpFile: "File",
  sftpSymlink: "Tautan",
  sftpOther: "Lainnya",
  sftpBack: "Kembali",
  sftpForward: "Maju",
  sftpUp: "Direktori induk",
  sftpRefresh: "Muat ulang direktori",
  sftpPath: "Path",
  sftpFilter: "Filter file",
  sftpHidden: "File tersembunyi",
  sftpOpenFolder: "Buka folder",
  sftpItems: "item",
  sftpTruncated: "Menampilkan 1.000 entri pertama.",
  sftpInteractionHint:
    "Pilih file, lalu Unggah atau Unduh. Klik dua kali folder untuk membukanya.",
  sftpLimitHint:
    "Satu transfer sekaligus. 100 MiB per file. File yang sudah ada tidak akan ditimpa.",

  sshFilesMenu: "File",
  sshUploadAction: "Unggah file",
  sshDownloadAction: "Unduh file",
  sshCancelTransfer: "Batalkan transfer",
  sshCancellingTransfer: "Membatalkan transfer...",
  sshUploadDirectory: "Direktori tujuan di server",
  sshDownloadPath: "Path file di server",
  sshUploadFile: "File lokal",
  sshTransferDescription:
    "Transfer satu file sekaligus, maksimal 100 MiB. Kompres folder menjadi ZIP terlebih dahulu.",
  sshUploadHint:
    "Gunakan direktori yang sudah ada. Path relatif dimulai dari direktori home SFTP, terpisah dari shell. File yang sudah ada tidak akan ditimpa.",
  sshDownloadHint:
    "Masukkan path file biasa. Path relatif dimulai dari direktori home SFTP. Unduhan mengikuti lokasi penyimpanan browser.",
  sshTransferFailed:
    "Transfer gagal. Periksa path, izin akun, dan dukungan SFTP di server.",
  sshTransferExists:
    "File tujuan sudah ada. Ubah nama file lokal atau pilih direktori lain.",
  sshTransferLimit:
    "Batas transfer tercapai. Maksimal 100 MiB per file dan total unggahan 300 MiB per sesi SSH.",
  sshTransferNotFile:
    "Path ini bukan file biasa. Kompres folder menjadi ZIP terlebih dahulu.",
  sshTransferChanged:
    "File di server berubah saat diunduh. Coba lagi setelah perubahan selesai.",
  sshTransferTimeout: "Waktu transfer habis. Periksa koneksi dan coba lagi.",
  sshTransferBusy:
    "Transfer lain sedang berjalan. Tunggu hingga selesai lalu coba lagi.",
  sshTransferCancelled:
    "Transfer dibatalkan. Unggahan terputus dapat menyisakan file parsial; periksa direktori tujuan.",
  sshTransferInterrupted:
    "Transfer terputus karena koneksi berakhir. Periksa file parsial sebelum mengunggah ulang.",
  sshUploadReady: "File berhasil diunggah",
  sshDownloadReady: "File siap disimpan",
  sshUploading: "Mengunggah",
  sshDownloading: "Mengunduh",

  sshMenuLabel: "Kontrol terminal SSH",
  sshSessionMenu: "Sesi",
  sshTerminalMenu: "Terminal",
  sshCredentialsMenu: "Kredensial",
  sshPasteServerPassword: "Kirim sandi tersimpan",
  sshPasteOtherServerPassword: "Dari server lain",
  sshPasswordSent: "Sandi dikirim ke terminal",
  sshPastePasswordFailed: "Gagal mengambil sandi tersimpan",
  sshNoSavedPassword: "Tidak ada sandi yang tersimpan",
  sshSudoPromptDetected: "Kredensial tersimpan",
  sshDismissPopup: "Tutup",
  sshViewMenu: "Tampilan",
  sshCopySelection: "Salin pilihan",
  sshSelectAll: "Pilih semua",
  sshClearDisplay: "Bersihkan tampilan dan riwayat",
  sshLargerText: "Perbesar teks",
  sshSmallerText: "Perkecil teks",
  sshResetTextSize: "Atur ulang ukuran teks",
  sshFullscreen: "Terminal layar penuh",
  sshExitFullscreen: "Keluar layar penuh",
  sshFullscreenFailed: "Mode layar penuh tidak dapat diubah. Coba lagi.",
  sshSelectionCopied: "Pilihan disalin",
  sshSelectionCopyFailed: "Pilihan tidak dapat disalin",
  sshTerminalHelp:
    "Menutup jendela ini memutus SSH. Hubungkan ulang untuk memulai shell baru.",

  rdpMenuLabel: "Kontrol desktop jarak jauh",
  rdpSessionMenu: "Sesi",
  rdpDesktopMenu: "Desktop",
  rdpViewMenu: "Tampilan",
  rdpPreviousDesktop: "Desktop sebelumnya",
  rdpNextDesktop: "Desktop berikutnya",
  rdpTaskView: "Tampilan tugas",
  rdpShowDesktop: "Tampilkan desktop",
  rdpTaskManager: "Pengelola tugas",

  rdpSessionWarningTitle: "Akun RDP ini sedang digunakan",
  rdpSessionWarningDescription:
    "Koneksi browser lain melalui backend ini sedang menggunakan server dan akun Windows ini. Melanjutkan dapat memutus koneksi tersebut, tergantung pengaturan Windows. Lanjutkan?",
  rdpSessionChanged:
    "Koneksi lain dimulai saat Anda sedang menghubungkan. Hubungkan ulang untuk meninjau peringatan sesi.",

  rdpCertificateTitle: "Percayai sertifikat server ini?",
  rdpCertificateWarning:
    "Sertifikat ini belum dipercaya untuk server ini. Koneksi Anda mungkin tidak aman. Lanjutkan hanya jika Anda mengenali server dan sertifikatnya.",
  rdpCertificateChanged:
    "Sertifikat server telah berubah. Periksa sidik jarinya sebelum melanjutkan.",
  rdpCertificateSubject: "Subjek",
  rdpCertificateIssuer: "Penerbit",
  rdpCertificateValidity: "Berlaku mulai / hingga",
  rdpCertificatePrevious: "Sidik jari yang sebelumnya dipercaya",
  rdpCertificateManaged:
    "Kepercayaan sertifikat dikelola oleh operator. Hubungi administrator untuk memperbarui sidik jari konfigurasi.",
  rdpCertificateTrustFailed:
    "Sertifikat tidak dapat dipercaya. Hubungkan ulang untuk memeriksa perubahan sertifikat, lalu coba lagi.",
  rdpCertificateCancel: "Batal",
  rdpCertificateContinue: "Lanjutkan",
  rdpCertificateSaving: "Mempercayai sertifikat…",
  rdpShowCertificate: "Tampilkan sertifikat",

  exportExcel: "Excel (.xlsx)",
  exportDescription:
    "Ekspor detail koneksi dan catatan. Pilih entri yang akan disertakan.",
  exportScope: "Cakupan ekspor",
  exportPage: "Halaman saat ini",
  exportFiltered: "Semua entri sesuai filter",
  exportAll: "Seluruh inventaris (abaikan filter)",
  exportPasswords: "Sertakan kata sandi",
  exporting: "Mengekspor…",
  exportDownload: "Unduh Excel",
  exportFailed: "Gagal mengekspor inventaris server",
  title: "Inventaris server",
  description: "Temukan alamat server, akun akses, dan detail koneksi.",
  documentTitle: "Inventaris server",
  documentDescription: "Kelola entri akses server di Fleetime Labs.",
  navigationDescription: "Alamat server, akun, dan detail akses.",
  add: "Tambah entri",
  addTitle: "Tambah entri server",
  editTitle: "Edit entri server",
  formDescription:
    "Pisahkan setiap akun akses, meskipun beberapa entri memakai host yang sama.",
  name: "Nama",
  accessType: "Jenis akses",
  hostPort: "Host / port",
  expandHost: "Buka host {host}",
  collapseHost: "Tutup host {host}",
  hostGroup: "Host {host}",
  copyHostGroup: "Salin host {host}",
  lastDefinitionUpdate: "Pembaruan definisi terakhir",
  groupedEntryCount: "{count} entri pada {hosts} host",
  hostsPerPage: "Host per halaman",
  hostsCount: "{count} host",
  host: "Host",
  port: "Port",
  username: "Nama pengguna",
  password: "Kata sandi",
  link: "Tautan",
  openWebUrl: "Buka situs untuk {name} di tab baru",
  previewWebUrl: "Pratinjau situs untuk {name}",
  openInNewTab: "Buka di tab baru",
  webPreviewHint:
    "Jika pratinjau kosong atau diblokir, buka situs di tab baru.",
  url: "URL web",
  databaseEngine: "Mesin database",
  databaseName: "Nama database",
  viewDetails: "Lihat detail",
  viewDetailsFor: "Lihat detail untuk {name}",
  notes: "Keterangan",
  transferTitle: "Hubungkan dengan {type}",
  transferWindowsIntro:
    "Buka WinSCP dan pilih New Site. Masukkan pengaturan koneksi berikut.",
  transferLinuxIntro:
    "Buka FileZilla Client, pilih File > Site Manager, lalu New site. Masukkan pengaturan berikut.",
  transferMacIntro:
    "Buka FileZilla Client di macOS, pilih File > Site Manager, lalu New site. Masukkan pengaturan berikut.",
  transferSftp:
    "Pilih SFTP sebagai protokol. SFTP mentransfer file melalui SSH dan berbeda dari FTPS.",
  transferFtp: "Pilih FTP sebagai protokol.",
  transferFtps:
    "Aktifkan FTP melalui TLS. Konfirmasikan kepada administrator apakah server memakai TLS eksplisit atau implisit dan port yang digunakan.",
  transferPlainFtp:
    "Entri ini memakai FTP biasa yang tidak mengenkripsi kredensial atau file. Gunakan hanya pada jaringan tepercaya yang ditentukan.",
  transferAuthenticate:
    "Masukkan kata sandi akun server saat diminta, lalu hubungkan. Admin dapat menampilkan dan menyalin kata sandi tersimpan di atas.",
  transferSftpVerify:
    "Verifikasi sidik jari kunci host server dengan administrator sebelum menerimanya. Jika memakai autentikasi kunci, pilih kunci privat di klien.",
  transferFtpsHint:
    "FTPS eksplisit biasanya memakai port 21; FTPS implisit biasanya memakai 990. Port tersimpan diutamakan. Verifikasi peringatan sertifikat dengan administrator.",
  smbTitle: "Hubungkan ke folder bersama",
  smbShare: "Nama share atau path folder (opsional)",
  smbSharePlaceholder: "contoh: shared/documents",
  smbShareHint:
    "Kosongkan untuk melihat share yang tersedia. Input ini hanya membentuk path koneksi dan tidak disimpan.",
  smbCopyPath: "Salin path SMB",
  smbWindowsIntro:
    "Buka File Explorer. Tempel path ini ke bilah alamat lalu tekan Enter.",
  smbWindowsConnect:
    "Buka folder bersama. Untuk menyimpannya sebagai drive, gunakan This PC > Map network drive dan masukkan path share lengkap.",
  smbLinuxIntro:
    "Buka Files di GNOME atau Dolphin di KDE. Tempel alamat ini ke bilah lokasi.",
  smbLinuxConnect:
    "Di Files, Anda juga dapat memakai Other Locations > Connect to Server. Hubungkan, lalu pilih folder bersama jika belum ditentukan.",
  smbMacIntro:
    "Di Finder, pilih Go > Connect to Server, atau tekan Command+K. Tempel alamat server ini.",
  smbMacConnect:
    "Pilih Connect, lalu Registered User. Pilih folder bersama jika belum ditentukan.",
  smbAuthenticate:
    "Masuk dengan akun dan kata sandi server yang ditampilkan di atas. Gunakan akun beserta domain jika diwajibkan administrator. Admin dapat menampilkan dan menyalin kata sandi tersimpan.",
  smbPortHint:
    "Entri ini memakai port SMB nonstandar. Path desktop ini memakai layanan SMB standar pada port 445; tanyakan klien atau konfigurasi jaringan yang diperlukan kepada administrator.",
  rdpTitle: "Hubungkan dengan RDP",
  rdpPlatform: "Sistem operasi Anda",
  rdpWindowsIntro:
    "Buka PowerShell dan jalankan perintah ini untuk membuka Remote Desktop Connection.",
  rdpWindowsConnect:
    "Pilih Connect. Jika diminta alamat komputer, gunakan host dan port yang ditampilkan di atas.",
  rdpLinuxIntro:
    "Instal dan buka Remmina dengan plugin RDP. Gunakan alamat server ini.",
  rdpLinuxProfile:
    "Buat profil koneksi dan pilih RDP sebagai protokol. Tempel alamat ke kolom Server.",
  rdpLinuxConnect:
    "Masukkan nama pengguna yang ditampilkan di atas, lalu pilih Connect. Jika belum disimpan, tanyakan akun Anda kepada administrator server.",
  rdpMacIntro:
    "Instal Windows App dari Mac App Store, lalu buka aplikasinya. Gunakan alamat PC ini.",
  rdpMacProfile:
    "Pilih Add PC dan tempel alamat ke PC name. Biarkan kredensial diminta saat diperlukan, atau pilih akun tersimpan.",
  rdpMacConnect: "Tambahkan PC, lalu klik dua kali pada tile untuk terhubung.",
  rdpNetwork:
    "Hubungkan ke jaringan server atau VPN jika diperlukan. Remote Desktop harus diaktifkan di server.",
  rdpAuthenticate:
    "Masuk dengan akun dan kata sandi server. Verifikasi peringatan sertifikat dengan administrator server sebelum melanjutkan.",
  rdpCopyAddress: "Salin alamat RDP",
  rdpCopyCommand: "Salin perintah RDP",
  rdpReference: "Referensi pengaturan koneksi",
  databaseClient: "Klien database",
  databaseCommandTab: "Perintah",
  databaseDataGripStart:
    "Di DataGrip, buka Data Sources and Drivers, pilih + lalu Data Source, dan pilih {engine}. Isi pengaturan koneksi berikut.",
  databaseDataGripFinish:
    "Unduh file driver yang belum tersedia jika diminta, pilih Test Connection, lalu terapkan pengaturan.",
  databaseDBeaverStart:
    "Di DBeaver, pilih Database > New Database Connection, pilih {engine}, lalu isi pengaturan koneksi berikut.",
  databaseDBeaverFinish:
    "Pilih Test Connection, unduh driver jika diminta, lalu pilih Finish.",
  databaseGuiCredentials:
    "Masukkan kata sandi akun di klien. Admin dapat menampilkan dan menyalin kata sandi tersimpan di atas.",
  databaseGuiEngineHint:
    "Kolom yang tersedia bergantung pada driver. Untuk Oracle, pastikan nama database adalah service name atau SID. Autentikasi MongoDB mungkin memerlukan database autentikasi terpisah. Beberapa mesin memerlukan edisi klien atau driver tambahan.",
  databaseCopyField: "Salin {field}",
  databaseTitle: "Hubungkan ke {engine}",
  databaseTitleGeneric: "Hubungkan ke database",
  databaseCommandIntro:
    "Jalankan perintah ini dari komputer yang sudah memiliki klien database.",
  databaseAddressIntro: "Gunakan alamat ini di klien database pilihan Anda.",
  databaseNetwork: "Hubungkan ke jaringan server atau VPN jika diperlukan.",
  databaseAuthenticate:
    "Masukkan kata sandi akun saat diminta. Kata sandi tidak disertakan dalam perintah.",
  databaseCopyCommand: "Salin perintah database",
  databaseCopyAddress: "Salin alamat database",
  sshWindowsIntro:
    "Buka PowerShell atau Windows Terminal dan jalankan perintah ini. Jika ssh tidak tersedia, instal OpenSSH Client dari Optional features Windows.",
  sshLinuxIntro:
    "Buka terminal dan jalankan perintah ini. Instal klien OpenSSH dari pengelola paket distribusi Anda jika diperlukan.",
  sshMacIntro:
    "Buka Terminal dan jalankan perintah ini menggunakan klien SSH bawaan.",
  sshTitle: "Hubungkan dengan SSH",
  sshTerminal:
    "Buka Terminal di macOS atau Linux, atau Git Bash / WSL di Windows, lalu jalankan perintah ini.",
  sshCopyCommand: "Salin perintah SSH",
  sshMissingUsername:
    "Nama pengguna belum disimpan. Perintah ini memakai nama pengguna lokal Anda. Tambahkan -l diikuti nama akun server jika berbeda.",
  sshNetwork: "Hubungkan ke jaringan server atau VPN jika diperlukan.",
  sshFingerprint:
    "Pada koneksi pertama, verifikasi sidik jari host yang ditampilkan dengan administrator server sebelum menerimanya.",
  sshAuthenticate:
    "Masukkan kata sandi saat diminta, atau gunakan kunci SSH yang telah dikonfigurasi. Karakter kata sandi tidak ditampilkan saat diketik.",
  sshReference: "Referensi perintah OpenSSH",
  detailsTitle: "Detail koneksi",
  createdAt: "Dibuat pada",
  updatedAt: "Diperbarui pada",
  updated: "Diperbarui",
  actions: "Tindakan",
  edit: "Edit entri",
  delete: "Hapus entri",
  save: "Simpan entri",
  refresh: "Muat ulang",
  search: "Cari nama, host, akun, atau keterangan...",
  searchCompact: "Cari server...",
  allTypesCompact: "Semua jenis",
  allEnginesCompact: "Semua mesin",
  clearFiltersCompact: "Hapus",
  revealAllCompact: "Lihat sandi",
  filterEngine: "Filter berdasarkan mesin database",
  allEngines: "Semua mesin database",
  filterType: "Filter berdasarkan jenis akses",
  allTypes: "Semua jenis akses",
  fullscreen: "Tabel layar penuh",
  exitFullscreen: "Keluar layar penuh",
  clearFilters: "Hapus filter",
  chooseType: "Pilih jenis akses",
  typeSearch: "Cari atau buat jenis akses...",
  createType: 'Buat "{type}"',
  typeDescription: "Pilih jenis yang tersedia atau buat jenis baru.",
  namePlaceholder: "contoh: WINDOWS-DEV56",
  optionalFields: "Detail opsional",
  hostDescription:
    "Pilih host yang tersedia atau masukkan alamat IP atau nama host baru.",
  hostSearch: "Cari atau masukkan host...",
  useHost: 'Gunakan "{host}"',
  hostPlaceholder: "Alamat IP atau nama host",
  portPlaceholder: "Port koneksi opsional",
  usernamePlaceholder: "Akun akses opsional",
  urlPlaceholder: "https://contoh.internal",
  chooseEngine: "Pilih mesin database",
  engineSearch: "Cari atau buat mesin database...",
  createEngine: 'Buat "{type}"',
  enginePlaceholder: "contoh: POSTGRESQL atau SQLSERVER",
  databasePlaceholder: "Nama database opsional",
  notesPlaceholder: "Tujuan, petunjuk koneksi, atau detail lainnya",
  passwordPlaceholder: "Kata sandi akses opsional",
  keepPasswordPlaceholder: "Kosongkan untuk mempertahankan kata sandi",
  keepPasswordDescription:
    "Kosongkan untuk mempertahankan kata sandi tersimpan. Isi untuk menggantinya.",
  passwordDescription: "Masukkan kata sandi untuk akun akses ini.",
  removePassword: "Hapus kata sandi tersimpan",
  showPassword: "Tampilkan kata sandi yang diketik",
  hidePasswordFor: "Sembunyikan kata sandi untuk {name}",
  passwordRevealed: "Kata sandi ditampilkan untuk {name}",
  passwordHidden: "Kata sandi disembunyikan",
  hidePassword: "Sembunyikan kata sandi",
  passwordTitle: "Kata sandi untuk {name}",
  revealDescription:
    "Disembunyikan setelah 30 detik, saat dialog ditutup, atau saat meninggalkan tab ini.",
  revealFor: "Tampilkan kata sandi untuk {name}",
  revealAll: "Tampilkan semua kata sandi",
  revealingPasswords: "Menampilkan kata sandi",
  revealAllError:
    "Beberapa kata sandi tidak dapat ditampilkan. Matikan lalu nyalakan sakelar untuk mencoba lagi.",
  copyPasswordFor: "Salin kata sandi untuk {name}",
  passwordStored: "Kata sandi tersimpan",
  copyPassword: "Salin kata sandi",
  copyHost: "Salin host untuk {name}",
  copyUsername: "Salin nama pengguna untuk {name}",
  copied: "Disalin ke clipboard",
  copyFailed: "Tidak dapat menyalin. Pilih nilainya lalu salin secara manual.",
  notSet: "Belum diisi",
  retry: "Coba lagi",
  emptyTitle: "Belum ada entri server",
  emptyDescription: "Tambahkan entri akses server atau layanan pertama Anda.",
  noMatches: "Tidak ada entri yang cocok",
  noMatchesDescription: "Coba pencarian lain atau hapus filter jenis akses.",
  entryCount: "{count} entri",
  pageCount: "Halaman {page} dari {pages}",
  rowsPerPage: "Baris per halaman",
  rowsCount: "{count} baris",
  sortBy: "Urutkan berdasarkan {column}",
  actionsFor: "Tindakan untuk {name}",
  required: "Kolom ini wajib diisi.",
  tooLong: "Gunakan maksimal {max} karakter.",
  invalidHost: "Masukkan alamat IP atau nama host tanpa port, URL, atau path.",
  invalidPort: "Masukkan bilangan bulat dari 1 hingga 65535.",
  invalidUrl: "Masukkan URL HTTP atau HTTPS tanpa kredensial di dalamnya.",
  createSuccess: "Entri server ditambahkan",
  updateSuccess: "Entri server diperbarui",
  deleteSuccess: "Entri server dihapus",
  loadError: "Tidak dapat memuat inventaris server",
  deleteTitle: "Hapus entri server ini?",
  deleteDescription:
    "Hapus {name} di {host}? Kredensial tersimpan juga akan dihapus. Tindakan ini tidak dapat dibatalkan.",
  sshCapacityExceeded:
    "Batas terminal backend telah tercapai. Putuskan terminal lain atau coba lagi nanti.",
  sshOpenTerminal: "Buka terminal",
  sshPopupBlocked:
    "Izinkan pop-up untuk situs ini, lalu buka terminal kembali.",
  sshBrowserIntro:
    "Buka terminal SSH interaktif di jendela baru. Backend terhubung menggunakan kredensial yang tersimpan.",
  sshCredentialsRequired:
    "Simpan nama pengguna dan kata sandi pada entri SSH ini untuk menggunakan terminal browser.",
  sshConnecting: "Menghubungkan…",
  sshConnected: "Terhubung",
  sshDisconnected: "Terputus",
  sshDisconnect: "Putuskan koneksi",
  sshReconnect: "Hubungkan kembali",
  sshBackToInventory: "Inventaris server",
  sshLoading: "Memuat server…",
  sshLoadFailed:
    "Server tidak dapat dimuat. Kembali ke inventaris dan coba lagi.",
  sshConnectionFailed:
    "Tidak dapat terhubung. Periksa alamat server, port, dan akses jaringan backend, lalu hubungkan kembali.",
  sshAuthFailed:
    "Autentikasi SSH gagal. Periksa nama pengguna dan kata sandi yang tersimpan, lalu hubungkan kembali.",
  sshHostKeyTitle: "Percayai server SSH ini?",
  sshHostKeyDescription:
    "Server ini belum dipercaya. Cocokkan sidik jari SHA-256 dengan administrator server sebelum menyetujui. Persetujuan menyimpan kunci di backend dan melanjutkan koneksi. Permintaan ini kedaluwarsa setelah 90 detik.",
  sshHostKeyAlgorithm: "Algoritma kunci",
  sshHostKeyFingerprint: "Sidik jari SHA-256",
  sshHostKeyTrust: "Percayai kunci dan hubungkan",
  sshHostKeySaving: "Menyimpan kunci dan menghubungkan…",
  sshHostKeyCancel: "Batalkan koneksi",
  sshKnownHostsWriteFailed:
    "Kunci host tidak dapat disimpan. Minta administrator mengizinkan penulisan ke direktori SSH backend, lalu hubungkan kembali.",
  sshHostKeyApprovalExpired:
    "Persetujuan kunci host kedaluwarsa. Hubungkan kembali untuk memeriksa sidik jari.",
  sshKnownHostsMissing:
    "File known_hosts backend tidak ditemukan. Minta administrator mengonfigurasinya, lalu hubungkan kembali.",
  sshHostKeyRejected:
    "Kunci host server ditolak atau telah berubah. Minta administrator memverifikasinya dan memperbarui file known_hosts backend.",
  sshSessionEnded:
    "Sesi SSH berakhir. Hubungkan kembali untuk memulai shell baru.",
  sshOutputOverflow:
    "Output terminal melebihi batas buffer. Hubungkan kembali untuk memulai shell baru.",
  rdpOpenDesktop: "Buka desktop",
  rdpBrowserIntro:
    "Buka desktop jarak jauh interaktif di jendela baru menggunakan kredensial yang tersimpan.",
  rdpCredentialsRequired:
    "Simpan nama pengguna dan kata sandi pada entri RDP ini untuk menggunakan desktop browser.",
  rdpDesktopTitle: "Desktop jarak jauh",
  rdpConnecting: "Menghubungkan ke desktop…",
  rdpConnected: "Terhubung",
  rdpDisconnected: "Terputus",
  rdpConnectionFailed:
    "Tidak dapat terhubung ke desktop. Periksa apakah gateway RDP berjalan, dapat menjangkau server, dan mempercayai sertifikatnya.",
  rdpAuthFailed:
    "Autentikasi gagal. Periksa sesi aplikasi serta nama pengguna dan kata sandi RDP yang tersimpan, lalu hubungkan kembali.",
  rdpInvalidEntry:
    "Pengaturan koneksi RDP tidak valid. Periksa entri inventaris ini dan hubungkan kembali.",
  rdpCapacityExceeded:
    "Batas desktop backend telah tercapai. Putuskan desktop lain atau coba lagi nanti.",
  rdpSessionExpired:
    "Sesi desktop kedaluwarsa. Hubungkan kembali untuk memulai koneksi lain.",
  rdpSessionEnded:
    "Koneksi desktop berakhir. Hubungkan kembali untuk membukanya lagi.",
  rdpUnstable: "Koneksi desktop merespons dengan lambat.",
  rdpCopyClipboard: "Salin clipboard remote",
  rdpDesktopHelp:
    "Klik desktop untuk mengontrolnya. Tekan Shift+Escape untuk kembali ke kontrol. Gunakan File > Unggah file untuk mengirim file ke Windows. Untuk mengunduh file, salin ke This PC > Fleetime Downloads > Download di Windows. Menutup jendela ini memutuskan RDP.",
  rdpFilesMenu: "File",
  rdpUploadAction: "Unggah file…",
  rdpUploadCancel: "Batalkan unggahan",
  rdpUploadSending: "Mengunggah file…",
  rdpUploadReady:
    "File diunggah ke Fleetime Downloads. Salin ke folder Windows sebelum memutuskan koneksi.",
  rdpUploadCancelled:
    "Unggahan dibatalkan. File parsial mungkin masih ada di Fleetime Downloads; hapus sebelum mencoba lagi.",
  rdpUploadInterrupted:
    "Unggahan terputus. Hubungkan kembali dan pilih lagi file tersebut.",
  rdpUploadFailed:
    "File tidak dapat diunggah. Periksa ruang drive dan nama file, lalu coba lagi.",
  rdpUploadLimit:
    "Batas unggahan tercapai. Gunakan file hingga 100 MiB, pilih maksimal 10 file, dan unggah hingga 300 MiB per sesi.",
  rdpDownloadReceiving: "Menerima file…",
  rdpDownloadReady: "File siap. Periksa unduhan browser Anda.",
  rdpDownloadSave: "Simpan file",
  rdpDownloadFailed:
    "File tidak dapat diunduh. Salin kembali ke folder Download.",
  rdpDownloadInterrupted:
    "Transfer file terputus. Hubungkan kembali dan salin lagi file ke folder Download.",
  rdpDownloadLimit:
    "Batas unduhan tercapai. Gunakan file hingga 100 MiB dan transfer maksimal tiga file sekaligus.",
  rdpCtrlAltDelete: "Kirim Ctrl+Alt+Delete",
  rdpFullscreen: "Desktop layar penuh",
  rdpExitFullscreen: "Keluar dari layar penuh",
  rdpFullscreenFailed:
    "Layar penuh tidak dapat dibuka. Coba lagi menggunakan tombol layar penuh.",
  rdpKeyboardLabel: "Input keyboard desktop jarak jauh",
  rdpDesktopLoading: "Menunggu desktop jarak jauh…",
} as const;
