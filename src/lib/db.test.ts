import { beforeEach, describe, expect, it, vi } from "vitest";

const { openMock, dbRunFn, dbAllFn } = vi.hoisted(() => ({
  openMock: vi.fn(),
  dbRunFn: vi.fn(),
  dbAllFn: vi.fn(),
}));

vi.mock("sqlite", () => ({
  open: openMock,
}));

vi.mock("sqlite3", () => ({
  default: {
    Database: function MockDatabase() {},
  },
}));

vi.mock("@/app/api/database", () => ({
  db: {
    run: dbRunFn,
    all: dbAllFn,
  },
}));

import sqlite3 from "sqlite3";
import { openDb, dbRun, dbAll } from "./db";

describe("db helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("openDb delegates to sqlite open with expected filename and driver", async () => {
    openMock.mockResolvedValue({});

    await openDb();

    expect(openMock).toHaveBeenCalledWith({
      filename: "./user.db",
      driver: sqlite3.Database,
    });
  });

  it("dbRun resolves when sqlite callback has no error", async () => {
    dbRunFn.mockImplementation((_sql: string, _params: any[], cb: Function) => {
      cb(null);
    });

    await expect(
      dbRun("UPDATE users SET role = ?", ["admin"]),
    ).resolves.toBeUndefined();
  });

  it("dbRun rejects when sqlite returns an error", async () => {
    dbRunFn.mockImplementation((_sql: string, _params: any[], cb: Function) => {
      cb(new Error("run failed"));
    });

    await expect(dbRun("DELETE FROM users", [])).rejects.toThrow("run failed");
  });

  it("dbAll resolves typed rows from sqlite", async () => {
    dbAllFn.mockImplementation((_sql: string, _params: any[], cb: Function) => {
      cb(null, [{ id: 1 }, { id: 2 }]);
    });

    await expect(
      dbAll<{ id: number }>("SELECT id FROM users", []),
    ).resolves.toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("dbAll rejects when sqlite returns an error", async () => {
    dbAllFn.mockImplementation((_sql: string, _params: any[], cb: Function) => {
      cb(new Error("all failed"), []);
    });

    await expect(dbAll("SELECT * FROM users", [])).rejects.toThrow(
      "all failed",
    );
  });
});
