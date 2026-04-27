import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/fogTasks", () => ({
  startGroupMulticast: vi.fn(),
  scheduleGroupMulticast: vi.fn(),
  cancelGroupMulticast: vi.fn(),
}));

import { POST, DELETE } from "./route";
import {
  startGroupMulticast,
  scheduleGroupMulticast,
  cancelGroupMulticast,
} from "@/lib/fogTasks";

describe("api/actions/multicast route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST returns 400 when missing required payload", async () => {
    const req = new Request("http://localhost/api/actions/multicast", {
      method: "POST",
      body: JSON.stringify({ groupID: 1 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("POST immediate multicast uses startGroupMulticast", async () => {
    (startGroupMulticast as any).mockResolvedValue({ success: true });

    const req = new Request("http://localhost/api/actions/multicast", {
      method: "POST",
      body: JSON.stringify({
        groupID: 1,
        imageID: 2,
        kernelDevice: "/dev/sda",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(startGroupMulticast).toHaveBeenCalled();
  });

  it("POST scheduled multicast uses scheduleGroupMulticast", async () => {
    (scheduleGroupMulticast as any).mockResolvedValue({ success: true });

    const req = new Request("http://localhost/api/actions/multicast", {
      method: "POST",
      body: JSON.stringify({
        groupID: 1,
        imageID: 2,
        kernelDevice: "/dev/sda",
        scheduledStartTime: "2026-04-25 10:00:00",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(scheduleGroupMulticast).toHaveBeenCalled();
  });

  it("DELETE validates sessionID", async () => {
    const req = new Request("http://localhost/api/actions/multicast", {
      method: "DELETE",
      body: JSON.stringify({}),
    });

    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it("DELETE calls cancelGroupMulticast", async () => {
    (cancelGroupMulticast as any).mockResolvedValue({ success: true });

    const req = new Request("http://localhost/api/actions/multicast", {
      method: "DELETE",
      body: JSON.stringify({ sessionID: 55 }),
    });

    const res = await DELETE(req);
    expect(res.status).toBe(200);
  });
});
