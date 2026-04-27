import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function mockJsonResponse(json: unknown, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(json),
  };
}

describe("data services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("getActiveTasks returns data from API", async () => {
    const { getActiveTasks } = await import("./activeTaskServices");
    (fetch as any).mockResolvedValue(mockJsonResponse({ data: [{ id: 1 }] }));

    await expect(getActiveTasks()).resolves.toEqual([{ id: 1 }]);
    expect(fetch).toHaveBeenCalledWith("/api/tasks/active", {
      cache: "no-store",
    });
  });

  it("getActiveTasks throws on non-ok response", async () => {
    const { getActiveTasks } = await import("./activeTaskServices");
    (fetch as any).mockResolvedValue(mockJsonResponse({}, false));

    await expect(getActiveTasks()).rejects.toThrow(
      "Failed to fetch active tasks",
    );
  });

  it("getGroups returns normalized dummy data", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_USE_DUMMY_DATA", "true");
    const { getGroups } = await import("./groupServices");

    (fetch as any).mockResolvedValue(
      mockJsonResponse({
        groups: [
          {
            id: 4,
            name: "Lab",
            description: "desc",
            kernelDevice: "eth0",
            hostcount: 2,
            createdTime: 123,
          },
        ],
      }),
    );

    await expect(getGroups()).resolves.toEqual([
      {
        id: 4,
        name: "Lab",
        description: "desc",
        kernelDevice: "eth0",
        members: 2,
        createdTime: 123,
      },
    ]);
    expect(fetch).toHaveBeenCalledWith("/dummyGroupData.json", {
      cache: "no-store",
    });
  });

  it("getHosts returns API data when dummy mode is off", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_USE_DUMMY_DATA", "false");
    const { getHosts } = await import("./hostServices");

    (fetch as any).mockResolvedValue(mockJsonResponse({ data: [{ id: 9 }] }));

    await expect(getHosts()).resolves.toEqual([{ id: 9 }]);
    expect(fetch).toHaveBeenCalledWith("/api/hosts", {
      cache: "no-store",
    });
  });

  it("getGroupAssociations returns normalized dummy data", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_USE_DUMMY_DATA", "true");
    const { getGroupAssociations } = await import("./groupAssociationServices");

    (fetch as any).mockResolvedValue(
      mockJsonResponse({
        groupassociations: [{ id: 1, groupID: 2, hostID: 3 }],
      }),
    );

    await expect(getGroupAssociations()).resolves.toEqual([
      { id: 1, groupID: 2, hostID: 3 },
    ]);
    expect(fetch).toHaveBeenCalledWith("/dummyGroupAssociation.json", {
      cache: "no-store",
    });
  });

  it("getImages normalizes nested dummy image fields", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_USE_DUMMY_DATA", "true");
    const { getImages } = await import("./imageServices");

    (fetch as any).mockResolvedValue(
      mockJsonResponse({
        images: [
          {
            id: 7,
            name: "img",
            description: "d",
            createdTime: 1,
            createdBy: "admin",
            os: { name: "linux" },
            imagetype: { name: "golden" },
            imagepartitiontype: { name: "single" },
          },
        ],
      }),
    );

    await expect(getImages()).resolves.toEqual([
      {
        id: 7,
        name: "img",
        description: "d",
        createdTime: 1,
        createdBy: "admin",
        osname: "linux",
        imagetypename: "golden",
        imageparttypename: "single",
      },
    ]);
  });
});
