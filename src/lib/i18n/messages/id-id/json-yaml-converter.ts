export const jsonYamlConverterMessages = {
  circularAliasError: "Alias YAML sirkular tidak didukung.",
  clear: "Bersihkan",
  convert: "Konversi",
  copied: "Disalin",
  copyError: "Tidak dapat menyalin keluaran.",
  copyOutput: "Salin keluaran",
  conversionFailedDescription: "Dokumen tidak dapat dikonversi.",
  conversionFailedTitle: "Konversi gagal",
  description:
    "Konversi JSON dan YAML di browser Anda. Masukan Anda tidak pernah meninggalkan halaman ini.",
  duplicateYamlKeyError: "YAML berisi kunci pemetaan duplikat.",
  editorByteCount: "{count} b",
  editorLineCount: "{count} baris",
  errorLocation: "Baris {line}, kolom {column}",
  errorTitle: "Konversi gagal",
  eyebrow: "Alat pengembang / 02",
  formatsLabel: "Format",
  formatsValue: "JSON / YAML 1.2",
  jsonFormat: "JSON",
  jsonNegativeZeroError:
    "Nilai JSON ini tidak dapat melakukan round-trip melalui YAML. Nol negatif akan menjadi nol.",
  jsonParseError: "JSON tidak dapat diurai. {detail}",
  jsonUnsafeIntegerError:
    "Nilai JSON ini tidak dapat melakukan round-trip melalui YAML. Bilangan bulat berada di luar batas aman JavaScript.",
  limitLabel: "Batas",
  limitValue: "1 MiB / sumber",
  navigationGroup: "Developer Tools",
  nonFiniteNumberError: "Angka non-finite tidak didukung.",
  nonStringYamlKeyError: "Kunci pemetaan YAML harus berupa string.",
  outputDescription: "{format} terkonversi hanya-baca",
  outputLabel: "Keluaran {format}",
  pageDescription: "Konversi dokumen JSON ke YAML dan dokumen YAML ke JSON.",
  pageKeywords: ["json", "yaml", "konverter", "alat pengembang"],
  pageTitle: "JSON/YAML Converter",
  preservationNote:
    "Keluaran hasil konversi tidak mempertahankan komentar YAML, anchor, alias, atau format asli.",
  resetExample: "Reset contoh",
  shortcutLabel: "Ctrl / Cmd + Enter",
  sourceDescription: "Masukan {format} yang dapat diedit",
  sourceFormatLabel: "Format sumber",
  sourceLabel: "Sumber {format}",
  sourceTooLargeError: "Masukan sumber tidak boleh melebihi 1 MiB.",
  storageLabel: "Penyimpanan",
  storageValue: "Hanya memori",
  swap: "Tukar",
  title: "JSON/YAML Converter",
  tour: {
    controlsDescription:
      "Pilih JSON atau YAML sebagai sumber, lalu konversikan dengan tombol atau Ctrl/Cmd+Enter. Tombol Tukar tersedia setelah konversi berhasil.",
    controlsTitle: "Tentukan arah konversi",
    editorsDescription:
      "Edit sumber di sebelah kiri. Panel hanya-baca di sebelah kanan menampilkan keluaran terformat dalam tipe dokumen lain.",
    editorsTitle: "Bekerja di dua panel",
    outputDescription:
      "Salin hasil yang berhasil di sini. Konversi yang gagal mempertahankan keluaran valid terakhir sementara Anda memperbaiki sumbernya.",
    outputTitle: "Gunakan keluaran terkonversi",
    startButton: "Mulai tour",
  },
  unsupportedYamlValueError:
    "Nilai YAML ini tidak dapat melakukan round-trip melalui JSON.",
  yamlConversionError: "YAML tidak dapat dikonversi. {detail}",
  yamlFormat: "YAML",
  yamlNegativeZeroError:
    "Nilai YAML ini tidak dapat melakukan round-trip melalui JSON. Nol negatif akan menjadi nol.",
  yamlParseError: "YAML tidak dapat diurai. {detail}",
  yamlUnsafeIntegerError:
    "Nilai YAML ini tidak dapat melakukan round-trip melalui JSON. Bilangan bulat berada di luar batas aman JSON.",
} as const;
