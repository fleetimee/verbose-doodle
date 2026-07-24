import { useCallback, useEffect, useRef, useState } from "react";
import {
  createNfcBridgeUrl,
  NfcBridgeClient,
} from "@/features/developer-tools/tools/nfc-reader-inspector/bridge-client";

const DEFAULT_BRIDGE_URL = "ws://127.0.0.1:7788/ws";

export function useNfcBridge() {
  const clientRef = useRef<NfcBridgeClient | null>(null);
  if (!clientRef.current) {
    const configuredUrl =
      import.meta.env.VITE_NFC_READER_BRIDGE_URL ?? DEFAULT_BRIDGE_URL;
    const token = import.meta.env.VITE_NFC_READER_BRIDGE_TOKEN ?? "";
    clientRef.current = new NfcBridgeClient(
      createNfcBridgeUrl(configuredUrl, token)
    );
  }
  const client = clientRef.current;
  const [state, setState] = useState(() => client.getState());

  useEffect(() => {
    const unsubscribe = client.subscribe(() => setState(client.getState()));
    return unsubscribe;
  }, [client]);

  const connect = useCallback(() => client.connect(), [client]);
  const disconnect = useCallback(() => client.disconnect(), [client]);
  const refresh = useCallback(() => {
    client.disconnect();
    client.connect();
  }, [client]);

  return { ...state, connect, disconnect, refresh };
}
