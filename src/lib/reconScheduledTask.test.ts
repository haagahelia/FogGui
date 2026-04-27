import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbAllMock, dbRunMock, fogFetchJsonMock } = vi.hoisted(() => ({
  dbAllMock: vi.fn(),
  dbRunMock: vi.fn(),
  fogFetchJsonMock: vi.fn(),
}));

vi.mock("./db", () => ({
  dbAll: dbAllMock,
  dbRun: dbRunMock,
}));

vi.mock("./fogApi", () => ({
  fogFetchJson: fogFetchJsonMock,
}));

describe("reconScheduledTask", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(global, "setInterval").mockImplementation((() => 1) as any);
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
  });

  it("starts the job once and schedules 60s interval", async () => {
    dbAllMock.mockResolvedValue([]);

    const { startReconciliationJob } = await import("./reconScheduledTask");

    startReconciliationJob();
    startReconciliationJob();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60 * 1000);
    expect(dbAllMock).toHaveBeenCalledTimes(1);
  });

  it("marks local task cancelled when fog scheduled task no longer exists", async () => {
    dbAllMock.mockResolvedValue([
      {
        id: 9,
        fogTaskID: 111,
        groupID: 5,
        imageID: 22,
        kernelDevice: "eth0",
        scheduledTime: 1001,
        status: "pending",
        createdAt: 1,
      },
    ]);
    fogFetchJsonMock.mockRejectedValueOnce(new Error("not found"));
    dbRunMock.mockResolvedValue(undefined);

    const { startReconciliationJob } = await import("./reconScheduledTask");

    startReconciliationJob();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fogFetchJsonMock).toHaveBeenCalledWith("/fog/scheduledtask/111");
    expect(dbRunMock).toHaveBeenCalledWith(
      "UPDATE scheduled_multicast_tasks SET status = 'cancelled' WHERE id = ?",
      [9],
    );
  });

  it("reconciles by updating all group hosts and marks task reconciled", async () => {
    dbAllMock.mockResolvedValue([
      {
        id: 10,
        fogTaskID: 222,
        groupID: 7,
        imageID: 33,
        kernelDevice: "ens160",
        scheduledTime: 1001,
        status: "pending",
        createdAt: 1,
      },
    ]);

    fogFetchJsonMock
      .mockResolvedValueOnce({ id: 222 })
      .mockResolvedValueOnce({
        data: [
          { groupID: 7, hostID: 101 },
          { groupID: 7, hostID: 102 },
          { groupID: 8, hostID: 201 },
        ],
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });

    dbRunMock.mockResolvedValue(undefined);

    const { startReconciliationJob } = await import("./reconScheduledTask");

    startReconciliationJob();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fogFetchJsonMock).toHaveBeenCalledWith("/fog/scheduledtask/222");
    expect(fogFetchJsonMock).toHaveBeenCalledWith("/fog/groupassociation");
    expect(fogFetchJsonMock).toHaveBeenCalledWith("/fog/host/101/edit", {
      method: "PUT",
      body: JSON.stringify({ imageID: 33, kernelDevice: "ens160" }),
    });
    expect(fogFetchJsonMock).toHaveBeenCalledWith("/fog/host/102/edit", {
      method: "PUT",
      body: JSON.stringify({ imageID: 33, kernelDevice: "ens160" }),
    });
    expect(dbRunMock).toHaveBeenCalledWith(
      "UPDATE scheduled_multicast_tasks SET status = 'reconciled' WHERE id = ?",
      [10],
    );
  });

  it("logs and keeps task pending when host updates fail", async () => {
    dbAllMock.mockResolvedValue([
      {
        id: 11,
        fogTaskID: 333,
        groupID: 12,
        imageID: 44,
        kernelDevice: "eth1",
        scheduledTime: 1001,
        status: "pending",
        createdAt: 1,
      },
    ]);

    fogFetchJsonMock
      .mockResolvedValueOnce({ id: 333 })
      .mockResolvedValueOnce({
        data: [{ groupID: 12, hostID: 301 }],
      })
      .mockRejectedValueOnce(new Error("update failed"));

    const { startReconciliationJob } = await import("./reconScheduledTask");

    startReconciliationJob();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(console.error).toHaveBeenCalled();
    expect(dbRunMock).not.toHaveBeenCalledWith(
      "UPDATE scheduled_multicast_tasks SET status = 'reconciled' WHERE id = ?",
      [11],
    );
  });
});
