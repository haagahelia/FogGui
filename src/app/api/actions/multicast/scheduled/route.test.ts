import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/fogApi", () => ({
  fogFetchJson: vi.fn(),
}));

vi.mock("@/lib/fogTasks", () => ({
  cancelScheduledTask: vi.fn(),
}));

import { DELETE, GET } from "./route";
import { fogFetchJson } from "@/lib/fogApi";
import { cancelScheduledTask } from "@/lib/fogTasks";

describe("api/actions/multicast/scheduled route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns scheduled tasks", async () => {
    (fogFetchJson as any).mockResolvedValue([{ id: 2 }]);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(fogFetchJson).toHaveBeenCalledWith("/fog/scheduledtask", {
      method: "GET",
    });
    await expect(res.json()).resolves.toEqual([{ id: 2 }]);
  });

  it("GET returns error response when fog API fails", async () => {
    (fogFetchJson as any).mockRejectedValue(new Error("service down"));

    const res = await GET();

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "service down" });
  });

  it("DELETE validates scheduledTaskID", async () => {
    const req = new Request(
      "http://localhost/api/actions/multicast/scheduled",
      {
        method: "DELETE",
        body: JSON.stringify({}),
      },
    );

    const res = await DELETE(req);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "scheduledTaskID is required.",
    });
  });

  it("DELETE calls cancelScheduledTask", async () => {
    (cancelScheduledTask as any).mockResolvedValue({ success: true });

    const req = new Request(
      "http://localhost/api/actions/multicast/scheduled",
      {
        method: "DELETE",
        body: JSON.stringify({ scheduledTaskID: 77 }),
      },
    );

    const res = await DELETE(req);

    expect(res.status).toBe(200);
    expect(cancelScheduledTask).toHaveBeenCalledWith(77);
    await expect(res.json()).resolves.toEqual({ success: true });
  });
});
