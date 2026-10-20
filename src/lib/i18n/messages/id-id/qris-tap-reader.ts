export const qrisTapReaderMessages = {
  releaseHighlights: [
    "Coba Demo Terpandu opsional dengan data QRIS TAP sintetis, tanpa memulai NFC atau menyimpan catatan inspeksi.",
    "Temui Chibi Eimi saat aplikasi dibuka, dengan visual sesuai tema dan dukungan pengurangan gerakan.",
    "Jelajahi bukti APDU, BER-TLV, Base64, HEX, dan log eksekusi secara terpandu dengan ilustrasi kontekstual.",
    "Profil broadcast, dialog status pemindaian dan broadcast, pratinjau QR, serta tampilan kosong yang lebih jelas.",
    "Peningkatan Mulai Cepat, navigasi penggunaan pertama, dan tata letak adaptif.",
    "Perbaikan pemulihan status demo, penanganan sentuhan, dan kelanjutan langsung alur NFC serta broadcast yang aktif.",
  ],
  size: "Ukuran",
  ratingsLabel: "Penilaian",
  sampleShort: "Contoh penilaian",
  universalApk: "APK universal",

  privacy: "Privasi Aplikasi",
  privacyIntro:
    "Pengungkapan privasi dalam Eimi menjelaskan inspeksi offline dan penyimpanan bukti lokal.",
  privacyTitle: "Inspeksi di perangkat",
  privacyBody:
    "Penguraian APDU dan analisis diagnostik berjalan di perangkat. Catatan inspeksi dan profil broadcast disimpan dalam basis data lokal privat. Eimi menyatakan tidak mengirim telemetri atau analitik.",
  privacySharing:
    "Bukti dapat keluar dari perangkat saat Anda membagikan atau mengekspornya, atau mengatur berbagi otomatis.",
  accessibility: "Aksesibilitas",
  accessibilityIntro:
    "Pilihan antarmuka dan umpan balik yang tersedia di aplikasi Android.",
  accessibilityTitle: "Tampilan & umpan balik",
  accessibilityFeatures: [
    "Tampilan terang dan gelap",
    "Suara pemindaian yang dapat diatur",
    "Umpan balik getaran",
    "Bahasa Inggris dan Jepang",
  ],
  accessibilityNote:
    "Kompatibilitas pembaca layar dan kesesuaian aksesibilitas belum diverifikasi untuk halaman ini.",
  provider: "Penyedia",
  providerValue: "Fleetime Labs",
  languageValue: "Inggris, Jepang",
  details: "Lihat detail",
  privacyDetails: "Jaminan Data & Privasi",
  ratings: "Penilaian & Ulasan",
  sample: "Pratinjau pengembangan · Contoh penilaian dan ulasan fiktif",
  ratingCount: "8 contoh penilaian",
  outOf: "dari 5",
  whatsNew: "Yang Baru",
  versionHistory: "Riwayat versi",
  releaseNote:
    "Pengenalan terpandu. Inspeksi lebih jelas. Eimi yang lebih ekspresif.",
  platform: "Platform",
  languages: "Bahasa",
  reviews: [
    {
      name: "Contoh pengembang",
      title: "Pertukaran data mudah diikuti",
      body: "Transkrip APDU dan payload yang telah diurai dalam satu tempat memudahkan inspeksi sesi pengujian.",
    },
    {
      name: "Contoh engineer QA",
      title: "Bukti berguna setelah pemindaian",
      body: "Riwayat lokal memudahkan pemeriksaan ulang pertukaran NFC dan perbandingan tampilan HEX serta BER-TLV.",
    },
    {
      name: "Contoh engineer integrasi",
      title: "Pendamping NFC yang terfokus",
      body: "Profil broadcast membantu memeriksa cara pembaca menangani payload tersimpan.",
    },
  ],
  download: "Instal",
  menu: "TAP Reader",
  subtitle: "Inspektur diagnostik QRIS TAP untuk pengembangan NFC",
  description:
    "Jelajahi Eimi, aplikasi Android untuk memeriksa pertukaran NFC QRIS TAP.",
  preview: "Tangkapan layar",
  about: "Tentang aplikasi",
  body: "Eimi membaca payload QRIS TAP dari perangkat pembayar NFC yang terdeteksi dan menyimpan bukti dalam catatan inspeksi lokal. Periksa pertukaran APDU, Base64, HEX, BER-TLV, log eksekusi, hasil, dan catatan.",
  broadcast:
    "Tampilkan Profil Broadcast tersimpan ke satu pembaca NFC melalui sesi broadcast latar belakang privat selama lima menit.",
  notice:
    "Eimi memeriksa pertukaran data. Aplikasi ini tidak memulai atau menyelesaikan pembayaran.",
  information: "Informasi",
  compatibility: "Kompatibilitas",
  requirements:
    "Android 7.0 atau lebih baru. Perangkat NFC diperlukan untuk pemindaian langsung.",
  version: "Versi",
  category: "Kategori",
  categoryValue: "Alat pengembang",
  storage: "Catatan inspeksi",
  storageValue: "Disimpan secara lokal di perangkat",
  availability: "Aplikasi Android",
  hint: "Gunakan panah atau geser. Pilih tangkapan layar untuk memperbesar.",
  scan: "Pemindaian langsung",
  history: "Riwayat inspeksi",
  apdu: "Transkrip APDU",
  base64: "Inspeksi Base64",
  tlv: "Inspeksi BER-TLV",
  hex: "Inspeksi HEX",
  logs: "Log eksekusi",
  broadcastShot: "Pengaturan broadcast",
  openScreenshot: "Perbesar tangkapan layar",
} as const;
