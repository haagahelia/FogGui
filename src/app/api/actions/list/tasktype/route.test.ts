import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/fogApi", () => ({
  fogFetchJson: vi.fn(),
}));

import { GET } from "./route";
import { fogFetchJson } from "@/lib/fogApi";

describe("api/actions/list/tasktype route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns task types from fog API", async () => {
    (fogFetchJson as any).mockResolvedValue([{ id: 1, name: "deploy" }]);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(fogFetchJson).toHaveBeenCalledWith("/fog/tasktype", {
      method: "GET",
    });
    await expect(res.json()).resolves.toEqual([{ id: 1, name: "deploy" }]);
  });

  it("returns normalized error response on failure", async () => {
    (fogFetchJson as any).mockRejectedValue(new Error("upstream failed"));

    const res = await GET();
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "upstream failed" });
  });
});
