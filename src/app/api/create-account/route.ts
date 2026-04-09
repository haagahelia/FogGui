import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { openDb } from "@/lib/db";
import { createErrorResponse, ApiError } from "@/lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      throw new ApiError("Username and password are required", 400);
    }

    const db = await openDb();
    const existingUser = await db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );

    if (existingUser) {
      throw new ApiError("Username already exists", 400);
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, "user"],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating account:", error);
    return createErrorResponse(error);
  }
}
