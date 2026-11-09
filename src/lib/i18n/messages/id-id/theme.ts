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
    colorSchemeAllFilter: "Semua Skema",
    colorSchemeSoftDarkFilter: "Gelap Lembut",
    colorSchemeStudioFilter: "Workshop Pekat",
    colorSchemeSeasonalFilter: "Musiman",
    colorSchemeSnowBadge: "Efek Salju",
    colorSchemeStudioGroup: "Palet Workshop Gelap Pekat",
    colorSchemeStudioGroupDesc:
      "Latar gelap obsidian dan batu tulis kontras tinggi (L ≈ 0.19) dipadukan dengan kertas terang yang tajam.",
    colorSchemeSoftDarkGroup: "Palet Gelap Lembut & Terangkat",
    colorSchemeSoftDarkGroupDesc:
      "Latar gelap senja yang lebih terang dan ramah mata (L ≈ 0.26–0.33) terinspirasi oleh Catppuccin, Tokyo Night Storm, Nord, Rosé Pine Moon, dan Everforest.",
    colorSchemeShowingCount: "{count} skema",
    colorSchemeGridView: "Tampilan kisi",
    colorSchemeListView: "Tampilan daftar",
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
      "dracula-classic": {
        name: "Dracula",
        badge: "#282a36 · L 0.29",
        description:
          "Kanvas batu tulis ungu ikonik dengan aksen ungu cerah, merah muda neon, dan sian.",
      },
      "gruvbox-material": {
        name: "Gruvbox Material",
        badge: "#282828 · L 0.28",
        description:
          "Arang retro hangat bernuansa bumi dengan sorotan oranye-amber dan teks krem perkamen.",
      },
      "one-dark-pro": {
        name: "One Dark Pro",
        badge: "#282c34 · L 0.29",
        description:
          "Meja kerja arang-batu tulis klasik Atom yang seimbang dengan sorotan biru langit dan sage.",
      },
      "kanagawa-wave": {
        name: "Kanagawa Wave",
        badge: "#1f1f28 · L 0.24",
        description:
          "Lapisan gelap tinta sumi samudra dan teks perkamen Fuji terinspirasi lukisan cukil kayu Hokusai.",
      },
      "ayu-mirage": {
        name: "Ayu Mirage",
        badge: "#1f2430 · L 0.26",
        description:
          "Permukaan senja biru-abu halus yang diterangi aksen instrumen kuning-amber hangat.",
      },
      "material-palenight": {
        name: "Material Palenight",
        badge: "#292d3e · L 0.30",
        description:
          "Permukaan batu tulis ungu beludru yang ramah mata dengan aksen kecubung dan sian.",
      },
      "solarized-precision": {
        name: "Solarized",
        badge: "#002b36 · L 0.27",
        description:
          "Meja instrumen teal gelap dan krem terang terkalibrasi CIELAB karya Ethan Schoonover.",
      },
      "monokai-pro": {
        name: "Monokai Pro",
        badge: "#272822 · L 0.28",
        description:
          "Lapisan studio arang-zaitun hangat dengan aksen mawar-koral dan kuning kenari fokus tinggi.",
      },
      "christmas-noel": {
        name: "Christmas Noël",
        badge: "25 Nov – 15 Jan · L 0.26",
        description:
          "Permukaan pinus musim dingin Nordik dengan merah buah holly, emas hangat, dan salju turun lembut (bawaan otomatis 25 Nov – 15 Jan).",
      },
    },
  },
} as const;
