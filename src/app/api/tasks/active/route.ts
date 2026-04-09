import { fogFetchJson } from "@/lib/fogApi";
import { createErrorResponse } from "@/lib/errorHandler";

// GET /api/tasks/active - Get active tasks
export async function GET() {
  try {
    const activeTasks = await fogFetchJson("/fog/task/active", {
      method: "GET",
    });

    return new Response(JSON.stringify(activeTasks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
