export const serversMessages = {
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
  sshKnownHostsMissing:
    "File known_hosts backend tidak ditemukan. Minta administrator mengonfigurasinya, lalu hubungkan kembali.",
  sshHostKeyRejected:
    "Kunci host server tidak dikenal atau telah berubah. Minta administrator memverifikasinya dan memperbarui file known_hosts backend.",
  sshSessionEnded:
    "Sesi SSH berakhir. Hubungkan kembali untuk memulai shell baru.",
  sshTerminalHelp:
    "Menutup jendela ini memutuskan SSH. Sesi berakhir setelah 30 menit. Menghubungkan kembali memulai shell baru.",
  sshOutputOverflow:
    "Output terminal melebihi batas buffer. Hubungkan kembali untuk memulai shell baru.",
} as const;
