import { describe, it, expect } from "vitest";
import { formatTime } from "./formatTime";

describe("formatTime", () => {
  it("returns undefined for empty input", () => {
    expect(formatTime("")).toBeUndefined();
  });

  it("converts datetime-local into FOG timestamp format", () => {
    expect(formatTime("2026-04-24T15:30")).toBe("2026-04-24 15:30:00");
  });

  it("keeps seconds when already present", () => {
    expect(formatTime("2026-04-24T15:30:45")).toBe("2026-04-24 15:30:45");
  });
});
