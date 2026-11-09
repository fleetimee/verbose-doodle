export const themeMessages = {
  dark: "Gelap",
  darkTheme: "Tema gelap",
  light: "Terang",
  lightTheme: "Tema terang",
  system: "Sistem",
  toggleAriaLabel: "Ganti tema",
  toggleTooltip: "Ganti mode terang/gelap",
  settings: {
    title: "Pengaturan",
    description:
      "Sesuaikan skema warna ruang kerja, mode tampilan, dan bahasa antarmuka secara langsung.",
    documentTitle: "Pengaturan Ruang Kerja — Fleetime Labs",
    documentDescription:
      "Konfigurasikan preset skema warna langsung, mode tampilan, dan preferensi bahasa untuk Fleetime Labs.",
    resetDefaults: "Kembalikan ke bawaan",
    resetSuccess: "Tampilan dikembalikan ke bawaan Harbor Teal.",
    colorSchemeTitle: "Skema Warna",
    colorSchemeDescription:
      "Ganti palet meja instrumen kapan saja. Setiap preset menyelaraskan lapisan permukaan, batas, dan aksen utama di mode terang maupun gelap.",
    colorSchemeStudioGroup: "Palet Workshop Gelap Pekat",
    colorSchemeStudioGroupDesc:
      "Latar gelap obsidian dan batu tulis kontras tinggi (L ≈ 0.19) dipadukan dengan kertas terang yang tajam.",
    colorSchemeSoftDarkGroup: "Palet Gelap Lembut & Terangkat",
    colorSchemeSoftDarkGroupDesc:
      "Latar gelap senja yang lebih terang dan ramah mata (L ≈ 0.26–0.33) terinspirasi oleh Catppuccin, Tokyo Night Storm, Nord, Rosé Pine Moon, dan Everforest.",
    colorSchemeActiveBadge: "Aktif",
    colorSchemeDefaultBadge: "Bawaan",
    colorSchemeLightPreview: "Terang",
    colorSchemeDarkPreview: "Gelap",
    appearanceModeTitle: "Mode Tampilan",
    appearanceModeDescription:
      "Pilih apakah permukaan menggunakan mode terang, mode gelap, atau mengikuti preferensi sistem operasi Anda.",
    modeLightDesc: "Permukaan kertas sejuk & porselen",
    modeDarkDesc: "Lapisan batu tulis ruang kerja gelap",
    modeSystemDesc: "Sinkronkan dengan tampilan OS",
    languageTitle: "Bahasa Antarmuka",
    languageDescription:
      "Pilih bahasa yang digunakan untuk menu, label, dan pesan operasional.",
    livePreviewTitle: "Pratinjau Langsung",
    livePreviewDescription:
      "Periksa bagaimana token aktif ditampilkan pada kontrol, lencana, dan lapisan permukaan.",
    previewPrimaryAction: "Jalankan Simulasi",
    previewSecondaryAction: "Periksa Payload",
    previewStatusOnline: "200 OK · 14 mdtk",
    previewEndpointLabel: "POST /v1/biller/inquiry",
    previewSurfaceCard: "Lapisan Permukaan & Batas",
    previewSurfaceText:
      "Garis batas tipis menjaga struktur sementara aksen aktif menyoroti kontrol dan seri data.",
    schemes: {
      "harbor-teal": {
        name: "Harbor Teal",
        badge: "185° OKLCH",
        description:
          "Harbor teal yang tenang dipadukan dengan permukaan kertas sejuk dan batu tulis gelap.",
      },
      "cobalt-bench": {
        name: "Cobalt Bench",
        badge: "252° OKLCH",
        description:
          "Biru kobalt presisi dengan lapisan batu tulis arktik dan biru malam.",
      },
      "copper-forge": {
        name: "Copper Forge",
        badge: "55° OKLCH",
        description:
          "Aksen tembaga fosfor hangat dan amber di atas lapisan batu pasir dan obsidian.",
      },
      "botanical-lab": {
        name: "Botanical Lab",
        badge: "152° OKLCH",
        description:
          "Instrumentasi zamrud dan sage terukur di atas kabut botani dan arang pinus.",
      },
      "ultraviolet-relay": {
        name: "Ultraviolet Relay",
        badge: "292° OKLCH",
        description:
          "Telemetri iris dan ultraviolet kontras tinggi di atas kuarsa sejuk dan kosmos gelap.",
      },
      "crimson-signal": {
        name: "Crimson Signal",
        badge: "16° OKLCH",
        description:
          "Aksen merah sinyal tajam dan kuarsa mawar dengan lapisan ruang kerja grafit hangat.",
      },
      "catppuccin-frappe": {
        name: "Catppuccin Frappé",
        badge: "#303446 · L 0.33",
        description:
          "Pastel mauve dan periwinkle lembut di atas permukaan senja Frappé yang lebih terang serta kertas Latte.",
      },
      "catppuccin-macchiato": {
        name: "Catppuccin Macchiato",
        badge: "#24273a · L 0.28",
        description:
          "Senja indigo kontras menengah dengan aksen lavender lembut dan lapisan mantel Macchiato.",
      },
      "tokyo-night-storm": {
        name: "Tokyo Night Storm",
        badge: "#24283b · L 0.28",
        description:
          "Kanvas malam biru-abu badai dengan aksen biru langit elektrik dan sian terminal.",
      },
      "nord-polar": {
        name: "Nord Polar Night",
        badge: "#2e3440 · L 0.32",
        description:
          "Permukaan batu tulis arktik Polar Night dipadukan dengan sian embun beku dan teks badai salju.",
      },
      "rose-pine-moon": {
        name: "Rosé Pine Moon",
        badge: "#232136 · L 0.26",
        description:
          "Permukaan plum cahaya bulan yang hangat dengan aksen iris, foam, dan emas mawar serta perkamen Dawn.",
      },
      "everforest-soft": {
        name: "Everforest Medium",
        badge: "#2d353b · L 0.32",
        description:
          "Kanvas gelap lumut hutan kontras rendah dan teks gandum hangat untuk kenyamanan mata.",
      },
    },
  },
} as const;
