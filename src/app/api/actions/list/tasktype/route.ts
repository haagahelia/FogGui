import { fogFetchJson } from "@/lib/fogApi";
import { ApiError, createErrorResponse } from "@/lib/errorHandler";

// GET /api/actions/tasktype
export async function GET() {
  try {
    const taskType = await fogFetchJson("/fog/tasktype", {
      method: "GET",
    });

    return new Response(JSON.stringify(taskType), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
