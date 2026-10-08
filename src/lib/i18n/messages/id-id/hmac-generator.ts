export const hmacGeneratorMessages = {
  title: "Tanda tangan HMAC",
  description:
    "Buat tanda tangan HMAC-SHA-256 dan bandingkan tanda tangan API mitra.",
  runtime: "Hanya browser",
  limit: "100 KB per pesan atau key",
  tags: ["HMAC", "SHA-256", "Tanda tangan"],
  keywords: [
    "generator HMAC",
    "tanda tangan API",
    "SHA-256",
    "perbandingan tanda tangan",
  ],
  inputs: "Input penandatanganan",
  results: "Tanda tangan dan perbandingan",
  message: "Pesan",
  key: "Signing key",
  messageEncoding: "Encoding pesan",
  keyEncoding: "Encoding key",
  outputEncoding: "Encoding tanda tangan",
  expectedEncoding: "Encoding tanda tangan yang diharapkan",
  utf8: "UTF-8",
  hex: "Hex",
  base64: "Base64",
  reset: "Muat contoh",
  clear: "Kosongkan input",
  copy: "Salin tanda tangan",
  copied: "Tanda tangan tersalin",
  copyError:
    "Tidak dapat menyalin. Pilih tanda tangan dan salin secara manual.",
  note: "Spasi dan akhir baris pesan ditandatangani persis sesuai input. Input hex mengizinkan whitespace di antara byte.",
  privacy:
    "Dihitung secara lokal. Pesan dan key tidak disimpan atau dikirim ke server.",
  example: "Input awal adalah contoh publik, bukan kredensial produksi.",
  expected: "Tanda tangan yang diharapkan (opsional)",
  expectedHint:
    "Tempel tanda tangan SHA-256 lengkap. Hex menerima huruf besar atau kecil; Base64 memerlukan padding.",
  signature: "Tanda tangan yang dihasilkan",
  bytes: "{message} byte pesan · {key} byte key · 32 byte tanda tangan",
  preview: "Byte yang ditandatangani (hex)",
  previewHint:
    "Pratinjau byte mencakup spasi, tab, dan baris baru. Tidak ada pemformatan JSON atau normalisasi.",
  match: "Tanda tangan cocok",
  mismatch: "Tanda tangan tidak cocok",
  noExpected: "Masukkan tanda tangan yang diharapkan untuk membandingkan.",
  pending: "Menghitung tanda tangan…",
  empty:
    "Masukkan signing key untuk membuat tanda tangan. Pesan kosong didukung.",
  invalid: "Periksa input penandatanganan",
  hexError:
    "Masukkan pasangan byte hex lengkap menggunakan 0–9 dan A–F. Hanya whitespace yang diizinkan sebagai pemisah.",
  unicodeError:
    "Teks berisi surrogate Unicode tanpa pasangan. Ganti atau gunakan byte hex.",
  sizeError: "Input melebihi 100 KB. Gunakan nilai yang lebih kecil.",
  keyError: "Masukkan signing key yang tidak kosong.",
  signatureError:
    "Masukkan 64 digit hex atau tanda tangan SHA-256 Base64 kanonis dengan padding sepanjang 44 karakter.",
  failed: "Tidak dapat menghitung tanda tangan. Periksa browser dan coba lagi.",
  emptyBytes: "(pesan kosong)",
} as const;
