import { beforeEach, describe, expect, it, vi } from "vitest";

const { credentialsProviderMock } = vi.hoisted(() => ({
  credentialsProviderMock: vi.fn((config: any) => ({
    id: "credentials",
    type: "credentials",
    ...config,
  })),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: credentialsProviderMock,
}));

vi.mock("@/lib/db", () => ({
  openDb: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compareSync: vi.fn(),
  },
}));

import { authOptions } from "./auth-options";
import { openDb } from "@/lib/db";
import bcrypt from "bcryptjs";

describe("authOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when credentials are missing", async () => {
    const provider: any = authOptions.providers?.[0];
    await expect(provider.authorize(null)).resolves.toBeNull();
  });

  it("returns null when user is not found", async () => {
    (openDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue(null),
    });

    const provider: any = authOptions.providers?.[0];
    await expect(
      provider.authorize({ username: "admin", password: "pw" }),
    ).resolves.toBeNull();
  });

  it("returns null when password does not match", async () => {
    (openDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue({
        id: 1,
        username: "admin",
        role: "admin",
        password: "hash",
      }),
    });
    (bcrypt.compareSync as any).mockReturnValue(false);

    const provider: any = authOptions.providers?.[0];
    await expect(
      provider.authorize({ username: "admin", password: "bad" }),
    ).resolves.toBeNull();
  });

  it("returns user with string id when auth succeeds", async () => {
    (openDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue({
        id: 42,
        username: "admin",
        role: "admin",
        password: "hash",
      }),
    });
    (bcrypt.compareSync as any).mockReturnValue(true);

    const provider: any = authOptions.providers?.[0];
    await expect(
      provider.authorize({ username: "admin", password: "good" }),
    ).resolves.toEqual({
      id: "42",
      username: "admin",
      role: "admin",
      password: "hash",
    });
  });

  it("jwt callback copies id, username, role from user", async () => {
    const token: any = {};
    const result = await authOptions.callbacks?.jwt?.({
      token,
      user: { id: "7", username: "u", role: "admin" } as any,
    } as any);

    expect(result).toEqual({ id: "7", username: "u", role: "admin" });
  });

  it("session callback maps token fields to session user", async () => {
    const session = { user: {} } as any;
    const token = { id: "1", username: "me", role: "user" } as any;

    const result = await authOptions.callbacks?.session?.({
      session,
      token,
    } as any);

    expect(result.user.id).toBe("1");
    expect(result.user.username).toBe("me");
    expect(result.user.role).toBe("user");
  });
});
