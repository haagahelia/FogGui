import { fogFetchJson } from "@/lib/fogApi";
import { createErrorResponse } from "@/lib/errorHandler";

// GET /api/hosts - Get all host machines
export async function GET() {
  try {
    const hosts = await fogFetchJson("/fog/host", { method: "GET" });

    return new Response(JSON.stringify(hosts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
