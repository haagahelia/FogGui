import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  openDb: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hashSync: vi.fn(),
  },
}));

import { POST } from "./route";
import { openDb } from "@/lib/db";
import bcrypt from "bcryptjs";

describe("api/create-account route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when username or password is missing", async () => {
    const req = new Request("http://localhost/api/create-account", {
      method: "POST",
      body: JSON.stringify({ username: "" }),
    }) as any;

    const res = await POST(req);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Username and password are required",
    });
  });

  it("returns 400 when username already exists", async () => {
    (openDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue({ id: 1, username: "admin" }),
      run: vi.fn(),
    });

    const req = new Request("http://localhost/api/create-account", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "pw" }),
    }) as any;

    const res = await POST(req);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Username already exists",
    });
  });

  it("creates account with hashed password", async () => {
    const run = vi.fn().mockResolvedValue(undefined);
    (openDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue(null),
      run,
    });
    (bcrypt.hashSync as any).mockReturnValue("hashed_pw");

    const req = new Request("http://localhost/api/create-account", {
      method: "POST",
      body: JSON.stringify({ username: "newuser", password: "pw" }),
    }) as any;

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(bcrypt.hashSync).toHaveBeenCalledWith("pw", 10);
    expect(run).toHaveBeenCalledWith(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      ["newuser", "hashed_pw", "user"],
    );
    await expect(res.json()).resolves.toEqual({ success: true });
  });
});
