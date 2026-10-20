export const qrisTapReaderMessages = {
  releaseHighlights: [
    "Try an optional Guided Demo with synthetic QRIS TAP data, without starting NFC or saving an inspection record.",
    "Meet Chibi Eimi at startup, with theme-aware visuals and reduced-motion support.",
    "Explore guided APDU, BER-TLV, Base64, HEX, and execution-log evidence with contextual illustrations.",
    "Clearer broadcast profiles, scan and broadcast status dialogs, QR previews, and empty states.",
    "Improved Quick Start, first-run navigation, and adaptive layouts.",
    "Fixed demo return-state restoration, touch handling, and direct resumption of active NFC and broadcast workflows.",
  ],
  size: "Size",
  ratingsLabel: "Ratings",
  sampleShort: "Sample ratings",
  universalApk: "Universal APK",

  privacy: "App Privacy",
  privacyIntro:
    "Eimi’s in-app privacy disclosure describes offline inspection and local evidence storage.",
  privacyTitle: "On-device inspection",
  privacyBody:
    "APDU parsing and diagnostic analysis run on your device. Inspection records and broadcast profiles are stored in a private local database. Eimi reports no telemetry or analytics.",
  privacySharing:
    "Evidence can leave the device when you share or export it, or configure automatic sharing.",
  accessibility: "Accessibility",
  accessibilityIntro:
    "Available interface and feedback options in the Android app.",
  accessibilityTitle: "Appearance & feedback",
  accessibilityFeatures: [
    "Light and dark appearance",
    "Configurable scan sounds",
    "Vibration feedback",
    "English and Japanese",
  ],
  accessibilityNote:
    "Screen reader compatibility and accessibility conformance have not been verified for this listing.",
  provider: "Provider",
  providerValue: "Fleetime Labs",
  languageValue: "English, Japanese",
  details: "See details",
  privacyDetails: "Data Guarantee & Privacy",
  ratings: "Ratings & Reviews",
  sample: "Development preview · Sample ratings and fictional reviews",
  ratingCount: "8 sample ratings",
  outOf: "out of 5",
  whatsNew: "What’s New",
  versionHistory: "Version history",
  releaseNote:
    "A guided introduction. Clearer inspection. A more expressive Eimi.",
  platform: "Platform",
  languages: "Languages",
  reviews: [
    {
      name: "Sample developer",
      title: "The exchange is easy to follow",
      body: "Having the APDU transcript and decoded payload together makes a test session much easier to inspect.",
    },
    {
      name: "Sample QA engineer",
      title: "Useful evidence after every scan",
      body: "Local history makes it convenient to revisit an NFC exchange and compare the HEX and BER-TLV views.",
    },
    {
      name: "Sample integration engineer",
      title: "A focused NFC companion",
      body: "The broadcast profile is handy when checking how a reader handles a saved payload.",
    },
  ],
  download: "Install",
  menu: "TAP Reader",
  subtitle: "QRIS TAP diagnostic inspector for NFC development",
  description:
    "Explore Eimi, the Android companion for inspecting QRIS TAP NFC exchanges.",
  preview: "Screenshots",
  about: "About this app",
  body: "Eimi reads QRIS TAP payloads from a detected NFC payer device and keeps the evidence together in local inspection records. Review APDU exchanges, Base64, HEX, BER-TLV, execution logs, outcomes, and notes.",
  broadcast:
    "Present a saved Broadcast Profile to one NFC reader through a private, five-minute background broadcast session.",
  notice:
    "Eimi inspects the exchange. It does not initiate or complete a payment.",
  information: "Information",
  compatibility: "Compatibility",
  requirements:
    "Android 7.0 or later. NFC hardware is required for live scanning.",
  version: "Version",
  category: "Category",
  categoryValue: "Developer tools",
  storage: "Inspection records",
  storageValue: "Stored locally on the device",
  availability: "Android app",
  hint: "Use the arrows or swipe. Select a screenshot to enlarge.",
  scan: "Live scan",
  history: "Inspection history",
  apdu: "APDU transcript",
  base64: "Base64 inspection",
  tlv: "BER-TLV inspection",
  hex: "HEX inspection",
  logs: "Execution log",
  broadcastShot: "Broadcast settings",
  openScreenshot: "Enlarge screenshot",
} as const;
