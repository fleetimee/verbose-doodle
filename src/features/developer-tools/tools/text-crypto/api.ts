import type {
  TextCryptoRequest,
  TextCryptoResult,
} from "@/features/developer-tools/tools/text-crypto/types";
import { apiPost } from "@/lib/api";

type TextCryptoApiResponse = {
  readonly responseCode: string;
  readonly responseDesc: string;
  readonly data: TextCryptoResult;
};

export async function processTextCrypto(
  request: TextCryptoRequest
): Promise<TextCryptoResult> {
  const response = await apiPost<TextCryptoApiResponse, TextCryptoRequest>(
    "/api/tools/text-crypto/process",
    request,
    { timeout: 15_000 }
  );

  return response.data;
}
