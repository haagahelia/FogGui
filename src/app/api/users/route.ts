import { NextResponse } from "next/server";
import { db } from "../database";

export async function GET() {
    return new Promise((resolve) => {
        db.all("SELECT * FROM users", [], (err, rows) => {
            if (err) {
                console.error("Fetch error:", err.message);
                resolve(NextResponse.json({ error: "Database error" }, { status: 500 }));
            } else {
                resolve(NextResponse.json(rows, { status: 200 }));
            }
        });
    });
}
