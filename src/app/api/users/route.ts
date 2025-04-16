import { NextResponse } from "next/server";
import { db } from "../database";

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

    // Return the rows as JSON if successful
    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    // Assert the error type to `Error` to safely access `message`
    const error = err as Error;
    console.error("Fetch error:", error.message);

    // If there's an error, return a 500 response
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
