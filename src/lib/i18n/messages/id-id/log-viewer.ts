export const logViewerMessages = {
  timezoneDefaultHint:
    "Sumber baru menggunakan zona waktu browser. Pilih zona waktu server Windows jika berbeda.",
  checkConnection: "Periksa koneksi",
  checkSuccess:
    "Koneksi terverifikasi. Share dan folder dasar dapat dibaca. Belum ada yang disimpan.",
  errorAuth:
    "Windows menolak login. Periksa nama pengguna, domain, dan kata sandi pada konfigurasi sumber.",
  errorAccess:
    "Akun Windows tidak dapat membaca share atau folder. Periksa izin bacanya.",
  errorShare:
    "Share tidak ditemukan. Cari share lagi atau isi nama share yang benar.",
  errorPath:
    "Folder atau berkas log tidak ditemukan. Jelajahi folder dan periksa jalur tersimpan.",
  errorConnect:
    "Server Windows tidak dapat dijangkau. Periksa host, port SMB, dan koneksi jaringan.",
  errorTimeout:
    "Server terlalu lama merespons. Periksa ketersediaannya lalu coba lagi.",
  errorStorage:
    "Sumber tersimpan sementara tidak tersedia. Periksa koneksi database backend lalu muat ulang sumber.",
  errorBackend:
    "Layanan log tidak dapat menyelesaikan permintaan. Pastikan backend berjalan dan periksa lognya lalu coba lagi.",
  errorCredentials:
    "Kata sandi SMB tersimpan tidak dapat dibaca. Isi ulang kata sandi lalu simpan sumber.",
  errorSourceMissing:
    "Sumber ini sudah tidak tersedia. Muat ulang daftar sumber untuk melanjutkan.",
  errorValidation:
    "Sebagian pengaturan belum diisi atau tidak valid. Periksa host, login, share, dan pengaturan berkas.",
  errorSmb:
    "Server Windows tidak dapat menyelesaikan permintaan. Periksa koneksi dan pengaturan sumber.",
  errorOffline:
    "Backend tidak dapat dihubungi. Pastikan layanan berjalan dan jaringan tersambung.",
  sourcesErrorTitle: "Sumber belum tersedia",
  catalogErrorTitle: "Sumber ini belum dapat dibuka",
  sourcesErrorHint: "Sumber tersimpan akan tampil setelah koneksi pulih.",
  catalogErrorHint: "Periksa pengaturan koneksi atau coba lagi.",
  reloadSources: "Muat ulang sumber",
  retrying: "Menghubungkan ulang…",
  errorDetails: "Yang terjadi",
  cachedLogs: "Log yang sudah dimuat tetap tersedia.",
  sharesDiscover: "Temukan share",
  sharesLoading: "Mencari share…",
  sharesChoose: "Pilih share yang ditemukan atau ketik namanya",
  sharesHint:
    "Share ditemukan otomatis dengan kredensial tersimpan. Untuk kata sandi manual, pilih Temukan share. Satu share yang dapat diakses dipilih otomatis.",
  sharesEmpty:
    "Tidak ada share disk yang dapat diakses. Nama share tetap dapat diisi manual.",
  sharesLimited:
    "Batas pencarian tercapai. Pilih share yang tersedia atau ketik nama lainnya.",
  sharesFailed: "Pencarian share gagal. Nama share dapat diisi manual.",
  inventoryEmpty:
    "Server tidak ditemukan. Isi detail koneksi secara manual di bawah.",
  inventoryServer: "Inventaris Server (opsional)",
  inventoryChoose: "Pilih server tersimpan atau isi detail di bawah",
  inventorySearch: "Cari nama, host, atau pengguna…",
  inventoryManual: "Isi koneksi secara manual",
  inventoryHint:
    "Ketik host atau pilih server tersimpan untuk mengisi login. Entri non-SMB menggunakan port 445.",
  inventoryPassword:
    "Kata sandi inventaris tersimpan akan digunakan. Isi kata sandi di sini untuk menggantinya.",
  inventoryLoading: "Memuat server…",
  inventoryMore: "Muat server lainnya",
  browseShareRequired:
    "Isi nama share di atas (misalnya C$ atau AppLogs) untuk menjelajahi folder.",
  browse: "Jelajahi folder",
  closeBrowser: "Tutup penjelajah",
  browsePrerequisite:
    "Isi host, share, nama pengguna, dan kata sandi terlebih dahulu. Masukkan ulang kata sandi jika detail koneksi berubah.",
  browsePath: "Folder di dalam share",
  browseRoot: "Root share",
  browseParent: "Folder induk",
  browseGo: "Buka folder",
  browseRefresh: "Muat ulang folder",
  browseLoading: "Menjelajahi dan mendeteksi pengaturan log…",
  browseError: "Tidak dapat menjelajahi folder ini",
  browseEmpty: "Folder ini kosong.",
  browseFiles: "Folder & berkas",
  browseDetected: "Pengaturan log terdeteksi",
  browseNoDetection:
    "Tidak ditemukan log bertanggal yang didukung. Buka folder log atau induk tahun/bulannya, atau isi pengaturan secara manual.",
  browseApply: "Gunakan pengaturan ini",
  browseApplied:
    "Pengaturan folder dan nama berkas diterapkan. Periksa zona waktu dan encoding sebelum menyimpan.",
  browseLimited:
    "Sebagian folder atau berkas tidak diperiksa karena batas akses atau pemindaian. Buka folder yang lebih spesifik untuk memeriksa lebih lanjut.",
  browseSamples: "Contoh yang cocok",
  browseMatched: "berkas diperiksa",
  browseNote:
    "Penjelajahan hanya membaca. Tidak ada yang disimpan sebelum Anda menyimpan sumber.",
  browseFolder: "Folder",
  browseDetectionHint:
    "Dideteksi dari nama berkas dan folder tanggal. Encoding dan zona waktu tetap dipertahankan.",

  fieldHelpLabel: "Bantuan untuk {field}",
  fieldHelpExamples: "Contoh & nilai yang diterima",
  fieldHelp: {
    name: {
      placeholder: "Mis. JavaCMSInterface",
      description:
        "Nama tampilan untuk sumber tersimpan ini. Tidak harus sama dengan nama folder atau layanan Windows. Maksimal 150 karakter.",
      examples: "JavaCMSInterface\nLog payment gateway",
    },
    host: {
      placeholder: "Mis. 192.168.4.45",
      description:
        "Alamat IP atau hostname server Windows yang dapat dijangkau backend. Isi host saja, tanpa smb://, nama share, atau path folder.",
      examples: "192.168.4.45\nwindows-logs.example",
    },
    port: {
      placeholder: "445",
      description:
        "Port SMB yang digunakan server. Biasanya 445; menerima bilangan bulat dari 1 sampai 65535.",
      examples: "445",
    },
    shareName: {
      placeholder: "Mis. C$ atau AppLogs",
      description:
        "Nama share SMB, bukan path drive. C$ mengarah ke share administratif drive C: jika akun memiliki akses. Share khusus dapat memakai namanya sendiri.",
      examples: "C$\nAppLogs",
    },
    basePath: {
      placeholder: "Mis. Simulator/EChannelInterface/JavaCMSInterface/log",
      description:
        "Folder log relatif terhadap share. Gunakan pemisah / atau backslash, tanpa huruf drive, awalan host, atau segmen induk (..). Kosongkan jika log berada langsung di root share.",
      examples:
        "Untuk C$:\nSimulator/EChannelInterface/JavaCMSInterface/log\n\nJika share langsung mengarah ke folder log:\nKosongkan",
    },
    folderPattern: {
      placeholder: "Pilih struktur folder",
      description:
        "Pilih struktur folder tanggal di bawah folder dasar. Tanpa folder tanggal membaca berkas langsung dari folder dasar. Folder tanggal yang tidak ada akan dilewati.",
      examples:
        "Tahun / bulan: yyyy/MM → 2026/10\nBulan saja: MM → 10\nTanpa folder tanggal: folder dasar saja",
    },
    filenamePattern: {
      placeholder: "Mis. {date}_{stream}.log",
      description:
        "Sertakan tepat satu {date} dan satu {stream}. {date} adalah tanggal delapan digit ddMMyyyy. {stream} mengelompokkan berkas berdasarkan jenis log; awalan MSG_ dihapus dari nama aliran yang ditampilkan. Jangan sertakan folder atau wildcard.",
      examples:
        "Pola: {date}_{stream}.log\nCocok: 22102026_APP.log\nCocok: 22102026_MSG_VA.log\nCocok: 22102026_MSG_CBS_KO.log",
    },
    username: {
      placeholder: "Mis. log-reader",
      description:
        "Akun Windows untuk autentikasi SMB. Akun harus dapat membaca share dan berkas log. Jika akun berada dalam domain, isi domain tersebut pada kolom Domain terpisah.",
      examples: "log-reader\nAdministrator",
    },
    domain: {
      placeholder: "Kosongkan untuk akun lokal",
      description:
        "Domain autentikasi opsional. Kosongkan untuk akun lokal, atau isi domain Windows yang diwajibkan server.",
      examples: "Kosong: akun lokal\nCORP: akun domain",
    },
    password: {
      placeholder: "Masukkan kata sandi akun SMB",
      description:
        "Gunakan kata sandi akun Windows di atas. Wajib untuk sumber baru, dienkripsi saat disimpan, dan tidak dikembalikan dalam metadata sumber. Saat mengedit, kosongkan untuk mempertahankan kata sandi tersimpan.",
      examples:
        "Sumber baru: kata sandi akun wajib\nSumber tersimpan: kosong mempertahankan kata sandi",
    },
    encoding: {
      placeholder: "Pilih encoding berkas log",
      description:
        "Sesuaikan dengan encoding teks aplikasi penulis log. Default UTF-8. Jika karakter tidak tampil dengan benar, pilih encoding yang digunakan aplikasi tersebut.",
      examples: "UTF-8\nwindows-1252\nISO-8859-1",
    },
    timezone: {
      placeholder: "Mis. Asia/Jakarta",
      description:
        "Zona waktu server untuk menentukan hari ini dan folder tanggal saat mengikuti log. Tidak mengubah timestamp di dalam teks log.",
      examples: "Asia/Jakarta\nAsia/Makassar\nUTC",
    },
  },
  fontSize: "Ukuran huruf log",
  decreaseFont: "Perkecil huruf log",
  increaseFont: "Perbesar huruf log",
  resetFont: "Atur ulang ukuran huruf log ke 10px",

  connectionErrorHint:
    "Periksa koneksi server atau pengaturan sumber, lalu coba lagi.",
  readOnly: "Hanya baca",
  connectionTitle: "Sumber & rentang tanggal",
  sourceHint: "Pilih sumber dan rentang waktu log yang ingin dibaca.",
  connectionGroup: "Koneksi",
  connectionDescription: "Hubungkan ke share Windows di server mana pun.",
  filesGroup: "Berkas log",
  filesDescription: "Atur struktur folder dan pola berkas harian.",
  credentialsGroup: "Autentikasi",
  credentialsDescription:
    "Kredensial disimpan di backend dan dienkripsi saat disimpan.",
  preferencesGroup: "Preferensi pembacaan",
  preferencesDescription:
    "Sesuaikan encoding dan zona waktu dengan pembuat log.",
  formDescription: "Simpan koneksi tersendiri untuk sumber log ini.",
  streamHint: "Berkas harian digabung secara kronologis menurut aliran.",
  live: "Langsung",
  today: "Hari ini · ikuti log baru",
  useToday: "Ikuti hari ini",
  checking: "Memeriksa sumber…",
  unavailable: "Koneksi tidak tersedia",

  title: "Penampil log",
  description:
    "Baca aliran log SMB berkelanjutan dari berkas harian dan folder bulanan.",
  add: "Tambah sumber",
  edit: "Konfigurasi sumber",
  cancel: "Batal",
  save: "Simpan sumber",
  saving: "Menyimpan…",
  name: "Nama sumber",
  host: "Host",
  port: "Port SMB",
  shareName: "Nama share",
  basePath: "Folder dasar",
  folderPattern: "Struktur folder",
  filenamePattern: "Pola nama berkas",
  username: "Nama pengguna",
  domain: "Domain (opsional)",
  password: "Kata sandi",
  keepPassword: "Kosongkan untuk mempertahankan kata sandi tersimpan",
  encoding: "Encoding teks",
  timezone: "Zona waktu server",
  flat: "Tanpa folder tanggal",
  yearMonth: "Tahun / bulan (yyyy/MM)",
  month: "Bulan saja (MM)",
  patternHint:
    "{date} mencocokkan ddMMyyyy; {stream} mencocokkan APP, MSG_VA, MSG_CBS_KO, dan jenis lainnya.",
  pathHint:
    "Relatif terhadap share. Untuk C$, mulai dari Simulator, tanpa C:\\.",
  emptyTitle: "Hubungkan sumber log pertama",
  emptyDescription:
    "Tambahkan koneksi server dan folder log, lalu simpan untuk menemukan aliran log.",
  source: "Sumber log",
  from: "Tanggal mulai",
  to: "Tanggal akhir (opsional)",
  rangeHint:
    "Kosongkan tanggal akhir untuk mengikuti hari ini di zona waktu server. Rentang maksimal: 366 hari.",
  refresh: "Periksa sumber",
  streams: "Aliran log",
  noFiles: "Tidak ada log yang cocok dalam rentang tanggal ini.",
  noFilesHint:
    "Periksa struktur folder, pola nama berkas, atau pilih tanggal mulai lebih awal.",
  loading: "Membaca log…",
  older: "Muat sebelumnya",
  latest: "Ke log terbaru",
  follow: "Ikuti entri baru",
  paused: "Dijeda",
  reset:
    "Log diganti atau dipotong. Tampilan dimulai ulang dari konten terbaru.",
  error: "Tidak dapat membaca log",
  retry: "Coba lagi",
  delete: "Hapus sumber",
  deleteTitle: "Hapus sumber log ini?",
  deleteDescription:
    "Pengaturan koneksi tersimpan akan dihapus. Berkas di server tetap tersimpan.",
  deleted: "Sumber log dihapus",
  saved: "Sumber log disimpan",
  connected: "Sumber dapat diakses",
  fileCount: "berkas cocok",
  bufferHint:
    "Konten lama dilepas saat aliran bertambah. Muat sebelumnya untuk membacanya lagi.",
  content: "Konten log",
  preset: "Preset JavaCMSInterface",
  chooseSource: "Pilih sumber",
} as const;
