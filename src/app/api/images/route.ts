import { fogFetchJson } from "@/lib/fogApi";

// GET /api/images - Get all images
export async function GET() {
  try {
    const images = await fogFetchJson("/fog/image", { method: "GET" });

    return new Response(JSON.stringify(images), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { hostID, imageID } = await req.json();

    if (!hostID || !imageID) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing hostID or imageID",
        }),
        { status: 400 },
      );
    }

    // Step 1: Assign Image to Host
    const assignImageResponse = await fetch(
      `${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/host/${hostID}/edit`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
          "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
        },
        body: JSON.stringify({
          imageID: imageID,
        }),
      },
    );

    if (!assignImageResponse.ok) {
      throw new Error("Failed to assign image to host.");
    }

    // Step 2: Create and Queue Deployment Task
    const createTaskResponse = await fetch(
      `${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/host/${hostID}/task`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
          "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
        },
        body: JSON.stringify({
          taskTypeID: "1", // deploy
          isActive: "1",
          shutdown: "0",
          other2: "0",
          other4: "1",
          wol: "1",
        }),
      },
    );

    if (!createTaskResponse.ok) {
      throw new Error("Failed to create deployment task.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Deployment started successfully.",
      }),
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { status: 500 },
    );
  }
}
