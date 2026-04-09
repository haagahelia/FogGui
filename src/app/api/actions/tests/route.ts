import { fogFetchJson } from "@/lib/fogApi";
import { createErrorResponse } from "@/lib/errorHandler";

// GET /api/actions/tests
export async function GET() {
  try {
    const test = await fogFetchJson(`/fog/scheduledtask`, {
      method: "GET",
    });

    console.log(test);

    return new Response(JSON.stringify(test), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
