import { fogFetchJson } from "@/lib/fogApi";
import { createErrorResponse } from "@/lib/errorHandler";

// GET /api/images - Get all images
export async function GET() {
  try {
    const images = await fogFetchJson("/fog/image", { method: "GET" });

    return new Response(JSON.stringify(images), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
