import { describe, it, expect } from "vitest";
import {
  ApiError,
  getErrorMessage,
  getStatusCode,
  createErrorResponse,
} from "./errorHandler";

describe("errorHandler", () => {
  it("extracts message from ApiError", () => {
    const err = new ApiError("bad request", 400);
    expect(getErrorMessage(err)).toBe("bad request");
    expect(getStatusCode(err)).toBe(400);
  });

  it("handles generic errors", () => {
    const err = new Error("boom");
    expect(getErrorMessage(err)).toBe("boom");
    expect(getStatusCode(err)).toBe(500);
  });

  it("creates proper JSON response", async () => {
    const res = createErrorResponse(new ApiError("fail", 422));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json).toEqual({ error: "fail" });
  });
});
