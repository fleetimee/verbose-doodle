import { enUsMessages } from "@/lib/i18n/messages/en-us";
import { aboutMessages as idAboutMessages } from "@/lib/i18n/messages/id-id/about";

export const idIdMessages = {
  ...enUsMessages,
  about: idAboutMessages,
} as const;
