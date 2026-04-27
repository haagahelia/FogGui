import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("fogApi", () => {
  const originalBase = process.env.NEXT_PUBLIC_FOG_API_BASE_URL;
  const originalApiToken = process.env.NEXT_PUBLIC_FOG_API_TOKEN;
  const originalUserToken = process.env.NEXT_PUBLIC_FOG_API_USER_KEY;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_FOG_API_BASE_URL = originalBase;
    process.env.NEXT_PUBLIC_FOG_API_TOKEN = originalApiToken;
    process.env.NEXT_PUBLIC_FOG_API_USER_KEY = originalUserToken;
  });

  it("throws at import time when base URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_FOG_API_BASE_URL;

    await expect(import("./fogApi")).rejects.toThrow(
      "NEXT_PUBLIC_FOG_API_BASE_URL is not defined",
    );
  });

  it("merges default headers and parses successful JSON", async () => {
    process.env.NEXT_PUBLIC_FOG_API_BASE_URL = "https://fog.local";
    process.env.NEXT_PUBLIC_FOG_API_TOKEN = "api-token";
    process.env.NEXT_PUBLIC_FOG_API_USER_KEY = "user-token";

    const { fogFetchJson } = await import("./fogApi");
    (fetch as any).mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('{"ok":true}'),
    });

    await expect(
      fogFetchJson("/fog/task", {
        method: "POST",
        headers: { "x-custom": "1" },
      }),
    ).resolves.toEqual({ ok: true });

    expect(fetch).toHaveBeenCalledWith("https://fog.local/fog/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "fog-api-token": "api-token",
        "fog-user-token": "user-token",
        "x-custom": "1",
      },
    });
  });

  it("returns null on empty success payload", async () => {
    process.env.NEXT_PUBLIC_FOG_API_BASE_URL = "https://fog.local";
    const { fogFetchJson } = await import("./fogApi");

    (fetch as any).mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });

    await expect(fogFetchJson("/fog/empty")).resolves.toBeNull();
  });

  it("throws response text when request fails", async () => {
    process.env.NEXT_PUBLIC_FOG_API_BASE_URL = "https://fog.local";
    const { fogFetchJson } = await import("./fogApi");

    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: vi.fn().mockResolvedValue("api boom"),
    });

    await expect(fogFetchJson("/fog/fail")).rejects.toThrow("api boom");
  });
});
