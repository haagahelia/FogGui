import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { imageId, hostId } = await req.json();

        if (!imageId || !hostId) {
            return NextResponse.json({ success: false, error: "Missing imageId or hostId" }, { status: 400 });
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_FOG_API_BASE_URL;
        const API_TOKEN = process.env.NEXT_PUBLIC_FOG_API_TOKEN || "";
        const USER_TOKEN = process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "";

        if (!API_BASE_URL || !API_TOKEN || !USER_TOKEN) {
            return NextResponse.json({ success: false, error: "FOG API credentials not set" }, { status: 500 });
        }

        const headers = {
            "Content-Type": "application/json",
            "fog-api-token": API_TOKEN,
            "fog-user-token": USER_TOKEN,
        };

        // 1. Assign the image to the host (PUT request)
        const assignResponse = await fetch(`${API_BASE_URL}/fog/host/${hostId}/edit`, {
            method: "PUT",
            headers,
            body: JSON.stringify({
                imageID: imageId, 
            }),
        });

        if (!assignResponse.ok) {
            const errorData = await assignResponse.json();
            return NextResponse.json({ success: false, error: "Failed to assign image", details: errorData }, { status: assignResponse.status });
        }

        // 2. Queue the deployment task (POST request)
        const deployResponse = await fetch(`${API_BASE_URL}/fog/host/${hostId}/task`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                taskTypeID: "1", // Deployment task
                isActive: "1",   // Task status active
                shutdown: "0",    // Do not shut down after
                other4: "0",      // No Wake On LAN
            }),
        });

        if (!deployResponse.ok) {
            const errorData = await deployResponse.json();
            return NextResponse.json({ success: false, error: "Failed to queue deployment task", details: errorData }, { status: deployResponse.status });
        }

        return NextResponse.json({ success: true, message: "Image assigned and deployment task queued successfully" });

    } catch (error) {
        console.error("Error deploying image:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
