import { NextResponse } from "next/server";
import { db } from "../database";
import { createErrorResponse } from "@/lib/errorHandler";

export async function GET() {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Fetch error:", error);
    return createErrorResponse(error);
  }
}
