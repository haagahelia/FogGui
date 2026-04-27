import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGroups } from "./useGroups";
import { useHosts } from "./useHosts";
import { useImages } from "./useImages";
import { useGroupAssociations } from "./useGroupAssociations";

vi.mock("@/services/groupServices", () => ({
  getGroups: vi.fn(),
}));
vi.mock("@/services/hostServices", () => ({
  getHosts: vi.fn(),
}));
vi.mock("@/services/imageServices", () => ({
  getImages: vi.fn(),
}));
vi.mock("@/services/groupAssociationServices", () => ({
  getGroupAssociations: vi.fn(),
}));

import { getGroups } from "@/services/groupServices";
import { getHosts } from "@/services/hostServices";
import { getImages } from "@/services/imageServices";
import { getGroupAssociations } from "@/services/groupAssociationServices";

describe("data hooks", () => {
  it("useGroups loads groups", async () => {
    (getGroups as any).mockResolvedValue([{ id: 1, name: "g" }]);

    const { result } = renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.groups).toEqual([{ id: 1, name: "g" }]);
    expect(result.current.error).toBeNull();
  });

  it("useHosts exposes service errors", async () => {
    (getHosts as any).mockRejectedValue(new Error("failed hosts"));

    const { result } = renderHook(() => useHosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hosts).toEqual([]);
    expect(result.current.error).toBe("failed hosts");
  });

  it("useImages loads images", async () => {
    (getImages as any).mockResolvedValue([{ id: 3, name: "img" }]);

    const { result } = renderHook(() => useImages());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.images).toEqual([{ id: 3, name: "img" }]);
  });

  it("useGroupAssociations loads associations", async () => {
    (getGroupAssociations as any).mockResolvedValue([{ id: 9 }]);

    const { result } = renderHook(() => useGroupAssociations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.groupAssociations).toEqual([{ id: 9 }]);
    expect(result.current.error).toBeNull();
  });
});
