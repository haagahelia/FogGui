import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActiveTasks } from "./useActiveTasks";

vi.mock("@/services/activeTaskServices", () => ({
  getActiveTasks: vi.fn(),
}));

import { getActiveTasks } from "@/services/activeTaskServices";

describe("useActiveTasks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads tasks and polls every 10 seconds", async () => {
    (getActiveTasks as any).mockResolvedValue([{ id: 1, hostID: 9 }]);

    const { result } = renderHook(() => useActiveTasks());
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.activeTasks.length).toBe(1);

    await act(async () => {
      vi.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(getActiveTasks).toHaveBeenCalledTimes(2);
  });
});
