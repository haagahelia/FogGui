import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/fogApi", () => ({
  fogFetchJson: vi.fn(),
}));

import { GET } from "./route";
import { fogFetchJson } from "@/lib/fogApi";

describe("api/actions/multicast/sessions route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns multicast sessions", async () => {
    (fogFetchJson as any).mockResolvedValue([{ id: 10 }]);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(fogFetchJson).toHaveBeenCalledWith("/fog/multicastsession", {
      method: "GET",
    });
    await expect(res.json()).resolves.toEqual([{ id: 10 }]);
  });

  it("returns error response when fog call fails", async () => {
    (fogFetchJson as any).mockRejectedValue(new Error("boom"));

    const res = await GET();

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "boom" });
  });
});
