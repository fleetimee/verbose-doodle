import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  apiDelete,
  apiFetch,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  createApiClient,
} from "@/lib/api";

describe("API utilities", () => {
  const originalFetch = globalThis.fetch;
  let fetchSpy: ReturnType<typeof mock>;

  beforeEach(() => {
    fetchSpy = mock();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    localStorage.clear();
  });

  test("creates a client from injected session and fetch dependencies", async () => {
    const fetchCalls: RequestInit[] = [];
    const session = {
      getSnapshot: () => ({ accessToken: "session-token" }),
      refresh: () => Promise.resolve(),
      signOut: () => undefined,
    };
    const injectedFetch = (_input: RequestInfo | URL, init?: RequestInit) => {
      fetchCalls.push(init ?? {});
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ ok: true }),
      } as Response);
    };

    const client = createApiClient({ session, fetch: injectedFetch });

    await expect(client.apiGet<{ ok: boolean }>("/injected")).resolves.toEqual({
      ok: true,
    });
    expect(fetchCalls[0]?.headers).toEqual(
      expect.objectContaining({ Authorization: "Bearer session-token" })
    );
  });

  describe("apiFetch", () => {
    test("makes successful GET request", async () => {
      const mockData = { id: 1, name: "Test" };
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      } as Response);

      const result = await apiFetch("/test");
      expect(result).toEqual(mockData);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    test("uses custom baseUrl when provided", async () => {
      const mockData = { success: true };
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      } as Response);

      await apiFetch("/test", { baseUrl: "https://api.example.com" });

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    test("includes default Content-Type header", async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({}),
      } as Response);

      await apiFetch("/test");

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    test("merges custom headers with defaults", async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({}),
      } as Response);

      await apiFetch("/test", {
        headers: { Authorization: "Bearer token123" },
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer token123",
          }),
        })
      );
    });

    test("handles non-JSON response", async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "text/plain" }),
      } as Response);

      const result = await apiFetch("/test");
      expect(result).toBeUndefined();
    });

    test("throws error for failed request", async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Headers(),
        json: async () => ({ message: "Resource not found" }),
      } as Response);

      await expect(apiFetch("/test")).rejects.toEqual({
        message: "Resource not found",
        status: 404,
        code: "404",
      });
    });

    test("handles error response without JSON body", async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers(),
        json: () => {
          throw new Error("Not JSON");
        },
      } as unknown as Response);

      await expect(apiFetch("/test")).rejects.toEqual({
        message: "Internal Server Error",
        status: 500,
        code: "500",
      });
    });

    test("signs out through the session on an authenticated 401", async () => {
      let signOutCalls = 0;
      const client = createApiClient({
        session: {
          getSnapshot: () => ({ accessToken: "access-token" }),
          refresh: () => Promise.resolve(),
          signOut: () => {
            signOutCalls += 1;
          },
        },
        fetch: fetchSpy as unknown as typeof fetch,
      });

      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers(),
        json: async () => ({ message: "Unauthorized" }),
      } as Response);

      await expect(
        client.apiFetch("/test", { retryOnUnauthorized: false })
      ).rejects.toEqual({
        message: "Unauthorized",
        status: 401,
        code: "401",
      });

      expect(signOutCalls).toBe(1);
    });

    test("refreshes token and retries once on 401", async () => {
      let accessToken = "old-access-token";
      let refreshCalls = 0;
      let signOutCalls = 0;
      const client = createApiClient({
        session: {
          getSnapshot: () => ({ accessToken }),
          refresh: () => {
            refreshCalls += 1;
            accessToken = "new-access-token";
            return Promise.resolve();
          },
          signOut: () => {
            signOutCalls += 1;
          },
        },
        fetch: fetchSpy as unknown as typeof fetch,
      });
      const mockData = { ok: true };

      fetchSpy
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
          headers: new Headers(),
          json: async () => ({ message: "Unauthorized" }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockData,
        } as Response);

      const result = await client.apiFetch("/test");

      expect(result).toEqual(mockData);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(refreshCalls).toBe(1);
      expect(fetchSpy.mock.calls[0]?.[1]).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer old-access-token",
          }),
        })
      );
      expect(fetchSpy.mock.calls[1]?.[1]).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer new-access-token",
          }),
        })
      );
      expect(signOutCalls).toBe(0);
    });

    test("shares one refresh across concurrent unauthorized requests", async () => {
      let accessToken = "old-access-token";
      let refreshCalls = 0;
      let resolveRefresh: (() => void) | undefined;
      const refreshPromise = new Promise<void>((resolve) => {
        resolveRefresh = resolve;
      });
      const client = createApiClient({
        session: {
          getSnapshot: () => ({ accessToken }),
          refresh: () => {
            refreshCalls += 1;
            return refreshPromise.then(() => {
              accessToken = "new-access-token";
            });
          },
          signOut: () => undefined,
        },
        fetch: fetchSpy as unknown as typeof fetch,
      });

      fetchSpy.mockImplementation(
        (input: string | URL | Request, init?: RequestInit) => {
          const url = String(input);
          const authorization = (
            init?.headers as Record<string, string> | undefined
          )?.Authorization;

          if (authorization === "Bearer old-access-token") {
            return Promise.resolve({
              ok: false,
              status: 401,
              statusText: "Unauthorized",
              headers: new Headers(),
              json: async () => ({ message: "Unauthorized" }),
            } as Response);
          }

          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ url }),
          } as Response);
        }
      );

      const firstRequest = client.apiFetch<{ url: string }>("/first");
      const secondRequest = client.apiFetch<{ url: string }>("/second");
      resolveRefresh?.();
      const [first, second] = await Promise.all([firstRequest, secondRequest]);

      expect(first).toEqual({ url: "/first" });
      expect(second).toEqual({ url: "/second" });
      expect(refreshCalls).toBe(1);
      expect(fetchSpy).toHaveBeenCalledTimes(4);
    });

    test("emits one logout transition when a shared refresh fails", async () => {
      let signOutCalls = 0;
      const client = createApiClient({
        session: {
          getSnapshot: () => ({ accessToken: "old-access-token" }),
          refresh: () => Promise.reject(new Error("refresh failed")),
          signOut: () => {
            signOutCalls += 1;
          },
        },
        fetch: fetchSpy as unknown as typeof fetch,
      });

      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers(),
        json: async () => ({ message: "Unauthorized" }),
      } as Response);

      const results = await Promise.allSettled([
        client.apiFetch("/first"),
        client.apiFetch("/second"),
      ]);

      expect(
        results.every((result) => result.status === "rejected")
      ).toBeTrue();
      expect(signOutCalls).toBe(1);
    });

    test("does not sign out when unauthorized handling is disabled", async () => {
      let signOutCalls = 0;
      const client = createApiClient({
        session: {
          getSnapshot: () => ({ accessToken: null }),
          refresh: () => Promise.resolve(),
          signOut: () => {
            signOutCalls += 1;
          },
        },
        fetch: fetchSpy as unknown as typeof fetch,
      });

      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers(),
        json: async () => ({ message: "Unauthorized" }),
      } as Response);

      await expect(
        client.apiFetch("/api/refresh", {
          auth: false,
          emitUnauthorized: false,
          retryOnUnauthorized: false,
        })
      ).rejects.toEqual({
        message: "Unauthorized",
        status: 401,
        code: "401",
      });

      expect(signOutCalls).toBe(0);
    });

    test("handles timeout", async () => {
      // Mock fetch to respect AbortSignal
      fetchSpy.mockImplementation((_url: string, options?: RequestInit) => {
        return new Promise((resolve, reject) => {
          const signal = options?.signal as AbortSignal;

          if (signal) {
            signal.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }

          // Simulate slow response (longer than timeout)
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({}),
            } as Response);
          }, 1000);
        });
      });

      await expect(apiFetch("/test", { timeout: 50 })).rejects.toEqual({
        message: "Request timeout",
        code: "TIMEOUT",
      });
    });
  });

  describe("HTTP method helpers", () => {
    test("apiGet makes GET request", async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ data: "test" }),
      } as Response);

      await apiGet("/test");

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    test("apiPost makes POST request with body", async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ id: 1 }),
      } as Response);

      const postData = { name: "Test" };
      await apiPost("/test", postData);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postData),
        })
      );
    });

    test("apiPut makes PUT request with body", async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ updated: true }),
      } as Response);

      const putData = { name: "Updated" };
      await apiPut("/test/1", putData);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(putData),
        })
      );
    });

    test("apiPatch makes PATCH request with body", async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ patched: true }),
      } as Response);

      const patchData = { status: "active" };
      await apiPatch("/test/1", patchData);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(patchData),
        })
      );
    });

    test("apiDelete makes DELETE request", async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as Response);

      await apiDelete("/test/1");

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });
});
