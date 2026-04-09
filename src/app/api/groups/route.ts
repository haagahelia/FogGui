import { fogFetchJson } from "@/lib/fogApi";
import { createErrorResponse } from "@/lib/errorHandler";

// GET /api/groups - Get all groups
export async function GET() {
  try {
    const groups = await fogFetchJson("/fog/group", { method: "GET" });

    return new Response(JSON.stringify(groups), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
