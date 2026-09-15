export const numberBaseConverterMessages = {
  asciiLabel: "ASCII",
  basesLabel: "Basis",
  basesValue: "2 / 8 / 10 / 16",
  binary: "Biner",
  bitWidthLabel: "Lebar bit",
  bitWidthItemAriaLabel: "{width} bit",
  byteIndex: "Byte {index}",
  bytesDescription:
    "Urutan network byte order, dengan byte yang tidak dapat dicetak ditampilkan sebagai titik.",
  bytesTitle: "Byte dan ASCII",
  clear: "Bersihkan",
  conversionFailed: "Gagal mengonversi nilai",
  convert: "Konversi",
  copied: "Disalin",
  copyFailed: "Gagal menyalin keluaran.",
  copyOutput: "Salin {base}",
  decimal: "Desimal",
  description:
    "Periksa bilangan bulat sebagai pola bit yang tepat. Nilai tidak pernah meninggalkan browser ini.",
  emptyBytes: "Tampilan Byte dan ASCII muncul setelah konversi berhasil.",
  emptyResults:
    "Konversikan nilai untuk membandingkan setiap representasi basis bilangan.",
  eyebrow: "Alat pengembang / 04",
  errors: {
    emptyInput: "Masukkan nilai.",
    invalidDigit: "Nilai memiliki digit yang tidak diterima oleh base {base}.",
    negativeNonDecimal:
      "Hanya masukan decimal yang menerima tanda minus. Masukan signed non-decimal dibaca sebagai bit pattern dengan lebar tetap.",
    negativeUnsigned: "Nilai Unsigned tidak boleh negatif.",
    signedOutOfRange:
      "Nilai signed decimal harus berada di antara {min} dan {max}.",
    signedWordOutOfRange: "Nilai tidak muat dalam word signed {bitWidth}-bit.",
    unsignedWordOutOfRange: "Nilai tidak muat dalam word {bitWidth}-bit.",
  },
  hexadecimal: "Heksadesimal",
  inputBaseLabel: "Basis masukan",
  inputHelp:
    "Awalan dan pemisah garis bawah diterima. Masukan non-desimal bertanda dibaca sebagai two's complement.",
  navigationGroup: "Developer Tools",
  octal: "Oktal",
  outputLabel: "Keluaran {base}",
  pageDescription:
    "Konversikan bilangan bulat dengan lebar tetap antara biner, oktal, desimal, dan heksadesimal.",
  pageKeywords: [
    "basis bilangan",
    "biner",
    "oktal",
    "desimal",
    "heksadesimal",
    "alat pengembang",
  ],
  pageTitle: "Number Base Converter",
  patternDescription:
    "Bit berorde tinggi terlebih dahulu, dikelompokkan ke dalam nibble empat bit.",
  patternTitle: "Pola bit",
  representationLabel: "Interpretasi",
  resetExample: "Reset contoh",
  resultDescription:
    "Setiap keluaran berasal dari pola bit lebar tetap yang sama persis.",
  resultTitle: "Nilai terkonversi",
  shortcutLabel: "Ctrl / Cmd + Enter",
  signed: "Signed (Bertanda)",
  signedValue: "Signed: {value}",
  storageLabel: "Penyimpanan",
  storageValue: "Hanya memori",
  title: "Number Base Converter",
  tour: {
    bytesDescription:
      "Baris byte mengikuti network order dan memasangkan setiap byte dengan pratinjau ASCII yang dapat dicetak.",
    bytesTitle: "Baca byte yang mendasarinya",
    controlsDescription:
      "Atur basis masukan, ukuran word, dan interpretasi tanda sebelum mengonversi.",
    controlsTitle: "Pilih cara membaca masukan",
    resultsDescription:
      "Keempat keluaran berbagi satu pola bit persis, termasuk nilai yang lebih besar dari batas integer aman JavaScript.",
    resultsTitle: "Bandingkan setiap representasi",
    startButton: "Mulai tour",
  },
  unsigned: "Unsigned (Tanpa tanda)",
  unsignedValue: "Unsigned: {value}",
  valueLabel: "Nilai",
  valuePlaceholder: "255",
  widthsLabel: "Ukuran word",
  widthsValue: "8 hingga 64 bit",
} as const;
