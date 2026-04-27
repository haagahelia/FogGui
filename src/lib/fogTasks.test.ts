import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/fogApi", () => ({
  fogFetchJson: vi.fn(),
}));

vi.mock("./db", () => ({
  dbRun: vi.fn(),
}));

import { fogFetchJson } from "@/lib/fogApi";
import { dbRun } from "./db";
import {
  startGroupMulticast,
  scheduleGroupMulticast,
  cancelGroupMulticast,
  cancelScheduledTask,
} from "./fogTasks";

describe("fogTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when required args missing on startGroupMulticast", async () => {
    await expect(startGroupMulticast(0, 1, "/dev/sda")).rejects.toThrow();
  });

  it("starts multicast happy path", async () => {
    (fogFetchJson as any)
      .mockResolvedValueOnce({
        data: [
          { groupID: 12, hostID: 1001 },
          { groupID: 12, hostID: 1002 },
        ],
      })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ id: 999 });

    const result = await startGroupMulticast(12, 4, "/dev/sda");
    expect(result.success).toBe(true);
    expect(fogFetchJson).toHaveBeenCalledWith(
      "/fog/group/12/task",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("rejects if active task exists", async () => {
    (fogFetchJson as any)
      .mockResolvedValueOnce({
        data: [{ groupID: 12, hostID: 1001 }],
      })
      .mockResolvedValueOnce({
        data: [{ hostID: 1001 }],
      });

    await expect(startGroupMulticast(12, 4, "/dev/sda")).rejects.toThrow(
      "active tasks",
    );
  });

  it("schedules multicast and writes local db record", async () => {
    (fogFetchJson as any)
      .mockResolvedValueOnce({
        data: [{ groupID: 12, hostID: 1001 }],
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ id: 444 });

    const result = await scheduleGroupMulticast(
      12,
      4,
      "/dev/sda",
      "2026-04-25 10:00:00",
    );
    expect(result.success).toBe(true);
    expect(dbRun).toHaveBeenCalled();
  });

  it("cancels active session", async () => {
    (fogFetchJson as any).mockResolvedValueOnce({ ok: true });
    const result = await cancelGroupMulticast(77);
    expect(result.success).toBe(true);
  });

  it("cancels scheduled task and updates db", async () => {
    (fogFetchJson as any).mockResolvedValueOnce({ ok: true });
    const result = await cancelScheduledTask(88);
    expect(result.success).toBe(true);
    expect(dbRun).toHaveBeenCalled();
  });
});
