import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/fogApi", () => ({
  fogFetchJson: vi.fn(),
}));

import { fogFetchJson } from "@/lib/fogApi";
import { GET as getGroupAssociations } from "./groupassociations/route";
import { GET as getGroups } from "./groups/route";
import { GET as getHosts } from "./hosts/route";
import { GET as getImages } from "./images/route";
import { GET as getTasks } from "./tasks/route";
import { GET as getActiveTasks } from "./tasks/active/route";

describe("simple API GET routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const routes = [
    {
      name: "group associations",
      fn: getGroupAssociations,
      path: "/fog/groupassociation",
    },
    { name: "groups", fn: getGroups, path: "/fog/group" },
    { name: "hosts", fn: getHosts, path: "/fog/host" },
    { name: "images", fn: getImages, path: "/fog/image" },
    { name: "tasks", fn: getTasks, path: "/fog/task" },
    { name: "active tasks", fn: getActiveTasks, path: "/fog/task/active" },
  ];

  it.each(routes)("returns data for $name", async ({ fn, path }) => {
    (fogFetchJson as any).mockResolvedValueOnce({ data: [{ id: 1 }] });

    const res = await fn();

    expect(res.status).toBe(200);
    expect(fogFetchJson).toHaveBeenCalledWith(path, { method: "GET" });
    await expect(res.json()).resolves.toEqual({ data: [{ id: 1 }] });
  });

  it.each(routes)("returns error response for $name", async ({ fn }) => {
    (fogFetchJson as any).mockRejectedValueOnce(new Error("upstream failed"));

    const res = await fn();

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "upstream failed" });
  });
});
