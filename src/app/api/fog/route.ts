import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/host`, {
      headers: {
        "Content-Type": "application/json",
        "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
        "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch from FOG API");

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
