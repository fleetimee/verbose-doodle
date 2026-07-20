import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import {
  apiDelete,
  apiFetch,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/lib/api";

describe("API utilities", () => {
  let fetchSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    // Create spy on global fetch
    fetchSpy = spyOn(global, "fetch");
    localStorage.clear();
  });

  afterEach(() => {
    // Restore original fetch after each test
    fetchSpy.mockRestore();
    localStorage.clear();
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

    test("clears auth token and emits unauthorized event on 401", async () => {
      const authUtils = await import("@/features/auth/utils");
      const clearSpy = spyOn(authUtils, "clearAuthToken");
      const emitSpy = spyOn(authUtils, "emitUnauthorizedEvent");

      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers(),
        json: async () => ({ message: "Unauthorized" }),
      } as Response);

      await expect(apiFetch("/test")).rejects.toEqual({
        message: "Unauthorized",
        status: 401,
        code: "401",
      });

      expect(clearSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledTimes(1);

      clearSpy.mockRestore();
      emitSpy.mockRestore();
    });

    test("refreshes token and retries once on 401", async () => {
      const authUtils = await import("@/features/auth/utils");
      const clearSpy = spyOn(authUtils, "clearAuthToken");
      const emitSpy = spyOn(authUtils, "emitUnauthorizedEvent");
      const mockData = { ok: true };

      localStorage.setItem("auth_token", "old-access-token");
      localStorage.setItem("refresh_token", "refresh-token");

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
          json: async () => ({
            responseCode: "00",
            responseDesc: "Success",
            data: {
              accessToken: "new-access-token",
              refreshToken: "new-refresh-token",
              tokenType: "Bearer",
              expiresIn: 900,
            },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockData,
        } as Response);

      const result = await apiFetch("/test");

      expect(result).toEqual(mockData);
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(fetchSpy.mock.calls[0]?.[1]).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer old-access-token",
          }),
        })
      );
      expect(fetchSpy.mock.calls[1]?.[1]).toEqual(
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
      expect(fetchSpy.mock.calls[2]?.[1]).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer new-access-token",
          }),
        })
      );
      expect(localStorage.getItem("auth_token")).toBe("new-access-token");
      expect(localStorage.getItem("refresh_token")).toBe("new-refresh-token");
      expect(clearSpy).not.toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();

      clearSpy.mockRestore();
      emitSpy.mockRestore();
    });

    test("shares one refresh across concurrent unauthorized requests", async () => {
      localStorage.setItem("auth_token", "old-access-token");
      localStorage.setItem("refresh_token", "refresh-token");

      let refreshRequests = 0;
      fetchSpy.mockImplementation(
        async (input: string | URL | Request, init?: RequestInit) => {
          const url = String(input);
          const authorization = (
            init?.headers as Record<string, string> | undefined
          )?.Authorization;

          if (url === "/api/refresh") {
            refreshRequests += 1;
            await Promise.resolve();
            return {
              ok: true,
              status: 200,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({
                responseCode: "00",
                responseDesc: "Success",
                data: {
                  accessToken: "new-access-token",
                  refreshToken: "new-refresh-token",
                  tokenType: "Bearer",
                  expiresIn: 900,
                },
              }),
            } as Response;
          }

          if (authorization === "Bearer old-access-token") {
            return {
              ok: false,
              status: 401,
              statusText: "Unauthorized",
              headers: new Headers(),
              json: async () => ({ message: "Unauthorized" }),
            } as Response;
          }

          return {
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ url }),
          } as Response;
        }
      );

      const [first, second] = await Promise.all([
        apiFetch<{ url: string }>("/first"),
        apiFetch<{ url: string }>("/second"),
      ]);

      expect(first).toEqual({ url: "/first" });
      expect(second).toEqual({ url: "/second" });
      expect(refreshRequests).toBe(1);
      expect(fetchSpy).toHaveBeenCalledTimes(5);
    });

    test("emits one logout transition when a shared refresh fails", async () => {
      const authUtils = await import("@/features/auth/utils");
      const emitSpy = spyOn(authUtils, "emitUnauthorizedEvent");

      localStorage.setItem("auth_token", "old-access-token");
      localStorage.setItem("refresh_token", "refresh-token");

      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers(),
        json: async () => ({ message: "Unauthorized" }),
      } as Response);

      const results = await Promise.allSettled([
        apiFetch("/first"),
        apiFetch("/second"),
      ]);

      expect(
        results.every((result) => result.status === "rejected")
      ).toBeTrue();
      expect(emitSpy).toHaveBeenCalledTimes(1);
      emitSpy.mockRestore();
    });

    test("does not emit unauthorized event when disabled", async () => {
      const authUtils = await import("@/features/auth/utils");
      const clearSpy = spyOn(authUtils, "clearAuthToken");
      const emitSpy = spyOn(authUtils, "emitUnauthorizedEvent");

      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers(),
        json: async () => ({ message: "Unauthorized" }),
      } as Response);

      await expect(
        apiFetch("/api/refresh", {
          auth: false,
          emitUnauthorized: false,
          retryOnUnauthorized: false,
        })
      ).rejects.toEqual({
        message: "Unauthorized",
        status: 401,
        code: "401",
      });

      expect(clearSpy).not.toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();

      clearSpy.mockRestore();
      emitSpy.mockRestore();
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
