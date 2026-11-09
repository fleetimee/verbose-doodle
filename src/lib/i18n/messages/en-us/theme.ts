export const themeMessages = {
  dark: "Dark",
  darkTheme: "Dark theme",
  light: "Light",
  lightTheme: "Light theme",
  system: "System",
  toggleAriaLabel: "Toggle theme",
  toggleTooltip: "Toggle light/dark mode",
  settings: {
    title: "Settings",
    description:
      "Customize the workspace color scheme, appearance mode, and interface language on the fly.",
    documentTitle: "Workspace Settings — Fleetime Labs",
    documentDescription:
      "Configure live color scheme presets, appearance mode, and language preferences for Fleetime Labs.",
    resetDefaults: "Reset to defaults",
    resetSuccess: "Appearance reset to Harbor Teal default.",
    colorSchemeTitle: "Color Scheme",
    colorSchemeDescription:
      "Switch the instrument bench palette on the go. Each preset coordinates surface layers, borders, and primary accents across both light and dark modes.",
    colorSchemeStudioGroup: "Deep Workshop Palettes",
    colorSchemeStudioGroupDesc:
      "High-contrast obsidian and deep slate dark backgrounds (L ≈ 0.19) paired with crisp light paper.",
    colorSchemeSoftDarkGroup: "Soft & Lifted Dark Palettes",
    colorSchemeSoftDarkGroupDesc:
      "Lighter, low-glare twilight dark backgrounds (L ≈ 0.26–0.33) inspired by Catppuccin, Tokyo Night Storm, Nord, Rosé Pine Moon, and Everforest.",
    colorSchemeActiveBadge: "Active",
    colorSchemeDefaultBadge: "Default",
    colorSchemeLightPreview: "Light",
    colorSchemeDarkPreview: "Dark",
    appearanceModeTitle: "Appearance Mode",
    appearanceModeDescription:
      "Choose whether surfaces use light mode, dark mode, or follow your operating system preference.",
    modeLightDesc: "Cool paper & porcelain surfaces",
    modeDarkDesc: "Deep workshop slate layers",
    modeSystemDesc: "Sync with OS appearance",
    languageTitle: "Interface Language",
    languageDescription:
      "Select the language used for menus, labels, and operational messages.",
    livePreviewTitle: "Live Bench Preview",
    livePreviewDescription:
      "Inspect how active tokens render across controls, badges, and surface layers.",
    previewPrimaryAction: "Execute Simulation",
    previewSecondaryAction: "Inspect Payload",
    previewStatusOnline: "200 OK · 14 ms",
    previewEndpointLabel: "POST /v1/biller/inquiry",
    previewSurfaceCard: "Surface & Border Layer",
    previewSurfaceText:
      "Thin borders carry structure while the active accent highlights controls and data series.",
    schemes: {
      "harbor-teal": {
        name: "Harbor Teal",
        badge: "185° OKLCH",
        description:
          "Calm harbor teal paired with cool paper and deep workshop slate neutrals.",
      },
      "cobalt-bench": {
        name: "Cobalt Bench",
        badge: "252° OKLCH",
        description:
          "Precision blueprint cobalt with crisp arctic slate and midnight navy layers.",
      },
      "copper-forge": {
        name: "Copper Forge",
        badge: "55° OKLCH",
        description:
          "Warm phosphor copper and amber accents grounded on sandstone and espresso obsidian.",
      },
      "botanical-lab": {
        name: "Botanical Lab",
        badge: "152° OKLCH",
        description:
          "Measured emerald and sage instrumentation over botanical mist and pine charcoal.",
      },
      "ultraviolet-relay": {
        name: "Ultraviolet Relay",
        badge: "292° OKLCH",
        description:
          "High-contrast iris and ultraviolet telemetry over cool quartz and deep cosmos.",
      },
      "crimson-signal": {
        name: "Crimson Signal",
        badge: "16° OKLCH",
        description:
          "Sharp signal crimson and rose quartz accents with warm graphite workshop layers.",
      },
      "catppuccin-frappe": {
        name: "Catppuccin Frappé",
        badge: "#303446 · L 0.33",
        description:
          "Soothing pastel mauve and periwinkle over lifted dusk-slate Frappé surfaces and creamy Latte paper.",
      },
      "catppuccin-macchiato": {
        name: "Catppuccin Macchiato",
        badge: "#24273a · L 0.28",
        description:
          "Medium-contrast indigo twilight with soft lavender accents and warm Macchiato mantle layers.",
      },
      "tokyo-night-storm": {
        name: "Tokyo Night Storm",
        badge: "#24283b · L 0.28",
        description:
          "Stormy slate-blue night canvas with electric sky-blue and neon cyan terminal accents.",
      },
      "nord-polar": {
        name: "Nord Polar Night",
        badge: "#2e3440 · L 0.32",
        description:
          "Arctic Polar Night slate-gray surfaces paired with glacial frost cyan and snow-storm text.",
      },
      "rose-pine-moon": {
        name: "Rosé Pine Moon",
        badge: "#232136 · L 0.26",
        description:
          "Warm moonlit plum surfaces with iris, foam, and rose-gold accents paired with Dawn parchment.",
      },
      "everforest-soft": {
        name: "Everforest Medium",
        badge: "#2d353b · L 0.32",
        description:
          "Low-contrast woodland moss dark canvas and warm wheat foreground designed for effortless eye comfort.",
      },
    },
  },
} as const;
