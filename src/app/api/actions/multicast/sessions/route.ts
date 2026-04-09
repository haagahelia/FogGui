import { fogFetchJson } from "@/lib/fogApi";
import { createErrorResponse } from "@/lib/errorHandler";

// GET /api/actions/multicast/sessions
export async function GET() {
  try {
    const sessions = await fogFetchJson(`/fog/multicastsession`, {
      method: "GET",
    });

    return new Response(JSON.stringify(sessions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Full Error", error);
    return createErrorResponse(error);
  }
}
