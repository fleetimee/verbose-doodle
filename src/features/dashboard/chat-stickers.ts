export const CHAT_STICKER_IDS = [
  "hello",
  "bye",
  "thanks",
  "ok",
  "yes",
  "nope",
  "lol",
  "love",
  "wow",
  "confused",
  "thinking",
] as const;

export type ChatStickerId = (typeof CHAT_STICKER_IDS)[number];

export function isChatStickerId(value: unknown): value is ChatStickerId {
  return CHAT_STICKER_IDS.some((id) => id === value);
}

export function getChatStickerSrc(id: ChatStickerId) {
  return `/brand/chat-stickers/${id}.webp`;
}

export function encodeChatSticker(id: ChatStickerId) {
  return `[fleetime-sticker:${id}]`;
}

export function parseChatSticker(message: string): ChatStickerId | undefined {
  return CHAT_STICKER_IDS.find((id) => encodeChatSticker(id) === message);
}
