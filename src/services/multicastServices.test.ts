import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMulticast,
  deleteMulticastSession,
  deleteScheduledMulticast,
  getMulticastSessions,
  getScheduledMulticast,
} from "./multicastServices";

describe("multicastServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("loads multicast sessions", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: [{ id: 1 }] }),
    });

    await expect(getMulticastSessions()).resolves.toEqual([{ id: 1 }]);
    expect(fetch).toHaveBeenCalledWith("/api/actions/multicast/sessions", {
      cache: "no-store",
    });
  });

  it("loads scheduled multicast", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: [{ id: 2 }] }),
    });

    await expect(getScheduledMulticast()).resolves.toEqual([{ id: 2 }]);
    expect(fetch).toHaveBeenCalledWith("/api/actions/multicast/scheduled", {
      cache: "no-store",
    });
  });

  it("createMulticast throws API error payload", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: "denied" }),
    });

    await expect(
      createMulticast({ groupID: 1, imageID: 2, kernelDevice: "eth0" }),
    ).rejects.toThrow("denied");
  });

  it("deleteMulticastSession throws fallback error", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({}),
    });

    await expect(deleteMulticastSession(10)).rejects.toThrow(
      "Failed to cancel multicast session",
    );
  });

  it("deleteScheduledMulticast sends DELETE payload", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    await expect(deleteScheduledMulticast(99)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("/api/actions/multicast/scheduled", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledTaskID: 99 }),
    });
  });
});
