import { useIsMutating } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router";
import { ENDPOINT_MUTATION_KEY } from "@/features/endpoints/data/endpoint-mutation-key";

type EndpointMemory = {
  readonly billerSlug: string;
  readonly endpointSlug: string;
};

type DashboardNavigationContextValue = {
  readonly endpointMutationPending: boolean;
  readonly forgetEndpoint: (endpointSlug: string) => void;
  readonly getRememberedEndpoint: (billerSlug: string) => string | undefined;
  readonly navigateToEndpoint: (path: string) => void;
  readonly registerEndpointNavigationGuard: (
    guard: (path: string) => boolean
  ) => () => void;
  readonly rememberEndpoint: (memory: EndpointMemory) => void;
  readonly requestEndpointNavigation: (path: string) => void;
};

const DashboardNavigationContext = createContext<
  DashboardNavigationContextValue | undefined
>(undefined);

export function DashboardNavigationProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const navigate = useNavigate();
  const guardRef = useRef<(path: string) => boolean>(() => true);
  const rememberedEndpointsRef = useRef(new Map<string, string>());
  const endpointMutationPending = useIsMutating({
    mutationKey: ENDPOINT_MUTATION_KEY,
  });

  const registerEndpointNavigationGuard = useCallback(
    (guard: (path: string) => boolean) => {
      guardRef.current = guard;
      return () => {
        if (guardRef.current === guard) {
          guardRef.current = () => true;
        }
      };
    },
    []
  );

  const requestEndpointNavigation = useCallback(
    (path: string) => {
      if (guardRef.current(path)) {
        navigate(path);
      }
    },
    [navigate]
  );

  const navigateToEndpoint = useCallback(
    (path: string) => navigate(path),
    [navigate]
  );

  const rememberEndpoint = useCallback((memory: EndpointMemory) => {
    rememberedEndpointsRef.current.set(memory.billerSlug, memory.endpointSlug);
  }, []);

  const getRememberedEndpoint = useCallback(
    (billerSlug: string) => rememberedEndpointsRef.current.get(billerSlug),
    []
  );

  const forgetEndpoint = useCallback((endpointSlug: string) => {
    for (const [
      billerSlug,
      rememberedEndpointId,
    ] of rememberedEndpointsRef.current) {
      if (rememberedEndpointId === endpointSlug) {
        rememberedEndpointsRef.current.delete(billerSlug);
      }
    }
  }, []);

  const value = useMemo<DashboardNavigationContextValue>(
    () => ({
      endpointMutationPending: endpointMutationPending > 0,
      forgetEndpoint,
      getRememberedEndpoint,
      navigateToEndpoint,
      registerEndpointNavigationGuard,
      rememberEndpoint,
      requestEndpointNavigation,
    }),
    [
      endpointMutationPending,
      forgetEndpoint,
      getRememberedEndpoint,
      navigateToEndpoint,
      registerEndpointNavigationGuard,
      rememberEndpoint,
      requestEndpointNavigation,
    ]
  );

  return (
    <DashboardNavigationContext.Provider value={value}>
      {children}
    </DashboardNavigationContext.Provider>
  );
}

export function useDashboardNavigation() {
  const context = useContext(DashboardNavigationContext);

  if (!context) {
    throw new Error(
      "useDashboardNavigation must be used inside DashboardNavigationProvider"
    );
  }

  return context;
}
