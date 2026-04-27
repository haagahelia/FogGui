import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardData } from "./useDashboardData";

vi.mock("@/services/groupServices", () => ({
  getGroups: vi.fn(),
}));
vi.mock("@/services/imageServices", () => ({
  getImages: vi.fn(),
}));
vi.mock("@/services/hostServices", () => ({
  getHosts: vi.fn(),
}));
vi.mock("@/services/groupAssociationServices", () => ({
  getGroupAssociations: vi.fn(),
}));

import { getGroups } from "@/services/groupServices";
import { getImages } from "@/services/imageServices";
import { getHosts } from "@/services/hostServices";
import { getGroupAssociations } from "@/services/groupAssociationServices";

describe("useDashboardData", () => {
  it("loads all dashboard resources in parallel", async () => {
    (getGroups as any).mockResolvedValue([{ id: 1 }]);
    (getImages as any).mockResolvedValue([{ id: 2 }]);
    (getHosts as any).mockResolvedValue([{ id: 3 }]);
    (getGroupAssociations as any).mockResolvedValue([{ id: 4 }]);

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.groups).toEqual([{ id: 1 }]);
    expect(result.current.images).toEqual([{ id: 2 }]);
    expect(result.current.hosts).toEqual([{ id: 3 }]);
    expect(result.current.groupAssociations).toEqual([{ id: 4 }]);
    expect(result.current.error).toBeNull();
  });

  it("returns error when one data source fails", async () => {
    (getGroups as any).mockResolvedValue([{ id: 1 }]);
    (getImages as any).mockRejectedValue(new Error("image fetch failed"));
    (getHosts as any).mockResolvedValue([{ id: 3 }]);
    (getGroupAssociations as any).mockResolvedValue([{ id: 4 }]);

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("image fetch failed");
    expect(result.current.groups).toEqual([]);
    expect(result.current.images).toEqual([]);
    expect(result.current.hosts).toEqual([]);
    expect(result.current.groupAssociations).toEqual([]);
  });
});
