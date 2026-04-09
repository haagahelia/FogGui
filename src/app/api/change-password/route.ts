import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { openDb } from "@/lib/db";
import { createErrorResponse, ApiError } from "@/lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    const { username, currentPassword, newPassword } = await req.json();

    if (!username || !currentPassword || !newPassword) {
      throw new ApiError("All fields are required", 400);
    }

    const db = await openDb();
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const passwordMatch = bcrypt.compareSync(currentPassword, user.password);

    if (!passwordMatch) {
      throw new ApiError("Current password is incorrect", 400);
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await db.run("UPDATE users SET password = ? WHERE username = ?", [
      hashedPassword,
      username,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return createErrorResponse(error);
  }
}
