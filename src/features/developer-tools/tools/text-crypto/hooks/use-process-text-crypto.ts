import { useMutation } from "@tanstack/react-query";
import { processTextCrypto } from "@/features/developer-tools/tools/text-crypto/api";
import type {
  TextCryptoRequest,
  TextCryptoResult,
} from "@/features/developer-tools/tools/text-crypto/types";
import type { ApiError } from "@/lib/api";

export function useProcessTextCrypto() {
  return useMutation<TextCryptoResult, ApiError, TextCryptoRequest>({
    mutationFn: processTextCrypto,
  });
}
