import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  openDb: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compareSync: vi.fn(),
    hashSync: vi.fn(),
  },
}));

import { POST } from "./route";
import { openDb } from "@/lib/db";
import bcrypt from "bcryptjs";

describe("api/change-password route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    const req = new Request("http://localhost/api/change-password", {
      method: "POST",
      body: JSON.stringify({ username: "admin" }),
    }) as any;

    const res = await POST(req);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "All fields are required",
    });
  });

  it("returns 404 when user is not found", async () => {
    (openDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue(null),
      run: vi.fn(),
    });

    const req = new Request("http://localhost/api/change-password", {
      method: "POST",
      body: JSON.stringify({
        username: "admin",
        currentPassword: "old",
        newPassword: "new",
      }),
    }) as any;

    const res = await POST(req);

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: "User not found" });
  });

  it("returns 400 when current password is incorrect", async () => {
    (openDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue({ username: "admin", password: "hash" }),
      run: vi.fn(),
    });
    (bcrypt.compareSync as any).mockReturnValue(false);

    const req = new Request("http://localhost/api/change-password", {
      method: "POST",
      body: JSON.stringify({
        username: "admin",
        currentPassword: "old",
        newPassword: "new",
      }),
    }) as any;

    const res = await POST(req);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Current password is incorrect",
    });
  });

  it("updates password when current password matches", async () => {
    const run = vi.fn().mockResolvedValue(undefined);
    (openDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue({ username: "admin", password: "hash" }),
      run,
    });
    (bcrypt.compareSync as any).mockReturnValue(true);
    (bcrypt.hashSync as any).mockReturnValue("new_hash");

    const req = new Request("http://localhost/api/change-password", {
      method: "POST",
      body: JSON.stringify({
        username: "admin",
        currentPassword: "old",
        newPassword: "new",
      }),
    }) as any;

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(bcrypt.hashSync).toHaveBeenCalledWith("new", 10);
    expect(run).toHaveBeenCalledWith(
      "UPDATE users SET password = ? WHERE username = ?",
      ["new_hash", "admin"],
    );
    await expect(res.json()).resolves.toEqual({ success: true });
  });
});
