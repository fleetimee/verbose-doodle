import { useEffect, useState } from "react";

type UseLocalStorageOptions<T> = {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
};

/**
 * Custom hook to manage state that persists in localStorage
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @param options - Optional serializer/deserializer functions
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void] {
  const serializer = options?.serializer ?? JSON.stringify;
  const deserializer = options?.deserializer ?? JSON.parse;

  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, serializer(storedValue));
    } catch {
      // Silently fail if localStorage is unavailable (e.g., private browsing)
    }
  }, [key, storedValue, serializer]);

  return [storedValue, setStoredValue];
}
