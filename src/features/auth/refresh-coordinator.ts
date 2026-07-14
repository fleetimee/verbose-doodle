let activeRefresh: Promise<unknown> | null = null;

class CoordinatedRefreshError extends Error {
  handled = false;

  constructor(cause: unknown) {
    super("Shared token refresh failed", { cause });
  }
}

export function coordinateRefresh<T>(refresh: () => Promise<T>): Promise<T> {
  if (activeRefresh) {
    return activeRefresh as Promise<T>;
  }

  const operation = refresh()
    .catch((error: unknown) => {
      throw new CoordinatedRefreshError(error);
    })
    .finally(() => {
      if (activeRefresh === operation) {
        activeRefresh = null;
      }
    });
  activeRefresh = operation;
  return operation;
}

export function handleRefreshFailureOnce(
  error: unknown,
  handleFailure: () => void
): void {
  if (error instanceof CoordinatedRefreshError) {
    if (error.handled) {
      return;
    }
    error.handled = true;
  }

  handleFailure();
}
