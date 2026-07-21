import { aboutMessages as idAboutMessages } from "@/lib/i18n/messages/id-id/about";
import { enUsMessages } from "@/lib/i18n/messages/en-us";

export const idIdMessages = {
  ...enUsMessages,
  about: idAboutMessages,
} as const;
