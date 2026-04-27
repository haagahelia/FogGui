import { describe, expect, it, vi } from "vitest";

const { nextAuthMock } = vi.hoisted(() => ({
  nextAuthMock: vi.fn(() => {
    return async function handler() {
      return new Response("ok");
    };
  }),
}));

vi.mock("next-auth", () => ({
  default: nextAuthMock,
}));

vi.mock("@/lib/auth-options", () => ({
  authOptions: { mocked: true },
}));

import { authOptions } from "@/lib/auth-options";
import { GET, POST } from "./route";

describe("api/auth/[...nextauth] route", () => {
  it("creates GET and POST handlers using NextAuth(authOptions)", async () => {
    expect(nextAuthMock).toHaveBeenCalledWith(authOptions);

    const getRes = await GET();
    const postRes = await POST();

    expect(getRes.status).toBe(200);
    expect(postRes.status).toBe(200);
  });
});
