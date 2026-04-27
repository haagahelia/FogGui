import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useMulticastSessions } from "./useMulticastSessions";
import { useScheduledMulticast } from "./useScheduledMulticast";

vi.mock("@/services/multicastServices", () => ({
  getMulticastSessions: vi.fn(),
  deleteMulticastSession: vi.fn(),
  getScheduledMulticast: vi.fn(),
  deleteScheduledMulticast: vi.fn(),
}));

import {
  getMulticastSessions,
  deleteMulticastSession,
  getScheduledMulticast,
  deleteScheduledMulticast,
} from "@/services/multicastServices";

describe("multicast hooks", () => {
  it("useMulticastSessions loads and can cancel then refetch", async () => {
    (getMulticastSessions as any)
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ id: 2 }]);
    (deleteMulticastSession as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useMulticastSessions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.multicastSessions).toEqual([{ id: 1 }]);

    await act(async () => {
      await result.current.cancelActiveSession(1);
    });

    await waitFor(() => {
      expect(result.current.multicastSessions).toEqual([{ id: 2 }]);
    });

    expect(deleteMulticastSession).toHaveBeenCalledWith(1);
    expect(getMulticastSessions).toHaveBeenCalledTimes(2);
  });

  it("useScheduledMulticast captures load errors", async () => {
    (getScheduledMulticast as any).mockRejectedValue(new Error("load failed"));

    const { result } = renderHook(() => useScheduledMulticast());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("load failed");
    expect(result.current.scheduledMulticast).toEqual([]);
  });

  it("useScheduledMulticast cancels then refetches", async () => {
    (getScheduledMulticast as any)
      .mockResolvedValueOnce([{ id: 8 }])
      .mockResolvedValueOnce([{ id: 9 }]);
    (deleteScheduledMulticast as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useScheduledMulticast());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.cancelScheduledMulticast(8);
    });

    await waitFor(() => {
      expect(result.current.scheduledMulticast).toEqual([{ id: 9 }]);
    });

    expect(deleteScheduledMulticast).toHaveBeenCalledWith(8);
  });
});
