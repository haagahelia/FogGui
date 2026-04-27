import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../database", () => ({
  db: {
    all: vi.fn(),
  },
}));

import { GET } from "./route";
import { db } from "../database";

describe("api/users route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns rows from sqlite query", async () => {
    (db.all as any).mockImplementation(
      (
        _sql: string,
        _params: unknown[],
        cb: (err: null, rows: unknown[]) => void,
      ) => {
        cb(null, [{ id: 1, username: "admin" }]);
      },
    );

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([{ id: 1, username: "admin" }]);
  });

  it("returns normalized error response when sqlite query fails", async () => {
    (db.all as any).mockImplementation(
      (
        _sql: string,
        _params: unknown[],
        cb: (err: Error, rows: unknown[]) => void,
      ) => {
        cb(new Error("db failed"), []);
      },
    );

    const res = await GET();

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "db failed" });
  });
});
