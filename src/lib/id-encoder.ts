/**
 * Utility functions for encoding and decoding IDs in URLs
 * This helps mask numeric IDs from being directly visible in the browser
 */

const ENCODING_SALT = "biller-sim-2024"; // Salt to make encoding less predictable

/**
 * Encodes a numeric ID to a URL-safe string
 * Uses base64 encoding with a salt for additional obfuscation
 *
 * @param id - The numeric ID to encode
 * @returns URL-safe encoded string
 *
 * @example
 * encodeId(12) // Returns something like "MTJiaWxsZXItc2ltLTIwMjQ"
 */
export function encodeId(id: number | string): string {
  const idString = String(id);
  const combined = `${idString}${ENCODING_SALT}`;

  // Convert to base64 and make it URL-safe
  const base64 = btoa(combined);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

const BASE64_PADDING_SIZE = 4;

/**
 * Decodes a URL-safe encoded ID back to its original numeric form
 *
 * @param encoded - The encoded ID string
 * @returns The original numeric ID, or null if decoding fails
 *
 * @example
 * decodeId("MTJiaWxsZXItc2ltLTIwMjQ") // Returns "12"
 */
export function decodeId(encoded: string): string | null {
  try {
    // Restore base64 padding and special characters
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    while (base64.length % BASE64_PADDING_SIZE) {
      base64 += "=";
    }

    const decoded = atob(base64);

    // Remove the salt to get the original ID
    if (!decoded.endsWith(ENCODING_SALT)) {
      return null;
    }

    return decoded.slice(0, -ENCODING_SALT.length);
  } catch {
    return null;
  }
}

/**
 * Validates if a string is a valid encoded ID
 *
 * @param encoded - The string to validate
 * @returns true if the string is a valid encoded ID
 */
export function isValidEncodedId(encoded: string): boolean {
  return decodeId(encoded) !== null;
}
