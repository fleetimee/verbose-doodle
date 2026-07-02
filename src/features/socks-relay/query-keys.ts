export const socksRelayQueryKeys = {
  all: ["socks-relay"] as const,
  detail: (relayId: string) => ["socks-relay", relayId] as const,
} as const;
