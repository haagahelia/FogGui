import { describe, it, expect, vi } from "vitest";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

import middleware from "./middleware";
import { getToken } from "next-auth/jwt";

function makeReq(path: string) {
  return {
    nextUrl: { pathname: path },
    url: `http://localhost${path}`,
  } as any;
}

describe("middleware", () => {
  it("redirects unauthenticated dashboard access", async () => {
    (getToken as any).mockResolvedValue(null);
    const res = await middleware(makeReq("/dashboard"));
    expect(res.status).toBe(307);
  });

  it("redirects non-admin from admin route", async () => {
    (getToken as any).mockResolvedValue({ role: "user" });
    const res = await middleware(makeReq("/admin/create-account"));
    expect(res.status).toBe(307);
  });

  it("allows admin route for admin token", async () => {
    (getToken as any).mockResolvedValue({ role: "admin" });
    const res = await middleware(makeReq("/admin/create-account"));
    expect(res.status).toBe(200);
  });
});
