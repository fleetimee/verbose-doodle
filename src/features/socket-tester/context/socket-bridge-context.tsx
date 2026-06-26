import { createContext, useContext } from "react";
import { useSocketBridge } from "@/features/socket-tester/hooks/use-socket-bridge";

type SocketBridgeContextValue = ReturnType<typeof useSocketBridge>;

const SocketBridgeContext = createContext<SocketBridgeContextValue | null>(
  null
);

export function SocketBridgeProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const bridge = useSocketBridge();

  return (
    <SocketBridgeContext.Provider value={bridge}>
      {children}
    </SocketBridgeContext.Provider>
  );
}

export function useSocketBridgeContext() {
  const context = useContext(SocketBridgeContext);

  if (!context) {
    throw new Error(
      "useSocketBridgeContext must be used within SocketBridgeProvider"
    );
  }

  return context;
}
