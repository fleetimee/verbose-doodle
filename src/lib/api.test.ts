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
  });

  afterEach(() => {
    // Restore original fetch after each test
    fetchSpy.mockRestore();
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
