import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/hooks/useDashboardData", () => ({
  useDashboardData: () => ({
    groups: [],
    images: [],
    hosts: [],
    groupAssociations: [],
    loading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/useActiveTasks", () => ({
  useActiveTasks: () => ({
    activeTasks: [],
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/useMulticastSessions", () => ({
  useMulticastSessions: () => ({
    multicastSessions: [],
    refetch: vi.fn(),
    cancelActiveSession: vi.fn(),
  }),
}));

vi.mock("@/hooks/useScheduledMulticast", () => ({
  useScheduledMulticast: () => ({
    scheduledMulticast: [],
    refetch: vi.fn(),
    cancelScheduledMulticast: vi.fn(),
  }),
}));

import Page from "./page";

describe("dashboard page", () => {
  it("renders scheduled and active sections", () => {
    render(<Page />);
    expect(screen.getByText("Scheduled Tasks")).toBeInTheDocument();
    expect(screen.getByText("Active Hosts")).toBeInTheDocument();
  });
});
