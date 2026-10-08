export const jsonTextDiffMessages = {
  title: "Diff JSON / teks",
  description:
    "Bandingkan payload yang diharapkan dan aktual berdasarkan field JSON atau baris teks.",
  runtime: "Hanya browser",
  limit: "100 KB per input",
  tags: ["JSON", "Diff", "Teks"],
  keywords: ["perbandingan JSON", "diff teks", "perbandingan payload"],
  mode: "Bandingkan sebagai",
  json: "Field JSON",
  text: "Baris teks",
  ignoreKeyOrder: "Abaikan urutan key objek",
  jsonNote:
    "Array dibandingkan berdasarkan posisi. Path menggunakan notasi JSON Pointer.",
  textNote:
    "Akhir baris dinormalisasi. Spasi, tab, dan baris baru terakhir dipertahankan.",
  compare: "Bandingkan",
  swap: "Tukar input",
  clear: "Kosongkan input",
  resetExample: "Muat contoh",
  before: "Diharapkan / sebelum",
  after: "Aktual / sesudah",
  beforeDescription: "Tempel payload asli atau yang diharapkan.",
  afterDescription: "Tempel payload baru atau hasil tangkapan.",
  lineCount: "{count} baris",
  byteCount: "{count} byte",
  pageSummary:
    "Perubahan {start}–{end} dari {total}. Salin diff mencakup semua perubahan.",
  previous: "Sebelumnya",
  next: "Berikutnya",
  results: "Hasil perbandingan",
  empty: "Tempel kedua payload, pilih mode, lalu bandingkan.",
  identical: "Tidak ada perbedaan.",
  summary:
    "{added} ditambahkan · {removed} dihapus · {changed} berubah · {reordered} diurutkan ulang",
  textSummary: "{added} baris ditambahkan · {removed} baris dihapus",
  copy: "Salin diff",
  copied: "Tersalin",
  copyError: "Tidak dapat menyalin. Coba salin hasil secara manual.",
  root: "(root)",
  missing: "Tidak ada",
  blankLine: "(baris kosong)",
  added: "Ditambahkan",
  removed: "Dihapus",
  changed: "Berubah",
  reordered: "Urutan key berubah",
  equal: "Tidak berubah",
  orderNote: "Nilai di bawah menampilkan key objek sesuai urutan aslinya.",
  sizeError: "{side} melebihi 100 KB. Bandingkan payload yang lebih kecil.",
  jsonError:
    "{side} bukan JSON yang valid. Perbaiki sintaks lalu bandingkan kembali.",
  depthError:
    "{side} melebihi 100 tingkat nesting. Bandingkan bagian yang lebih kecil.",
  linesError:
    "{side} melebihi 2.000 baris. Bandingkan bagian yang lebih kecil.",
  complexityError:
    "Dokumen memiliki terlalu banyak baris untuk disejajarkan. Bandingkan bagian yang lebih kecil.",
  numberError:
    "{side} berisi angka di luar rentang numerik yang aman. Gunakan mode teks untuk membandingkan digit persis, atau tulis pengenal besar sebagai string.",
  failed: "Perbandingan gagal. Periksa input dan coba lagi.",
} as const;
