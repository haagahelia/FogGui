import { fogFetchJson } from "@/lib/fogApi";
import { cancelScheduledTask } from "@/lib/fogTasks";
import { createErrorResponse, ApiError } from "@/lib/errorHandler";

// GET /api/actions/multicast/scheduled
export async function GET() {
  try {
    const scheduledTask = await fogFetchJson(`/fog/scheduledtask`, {
      method: "GET",
    });

    return new Response(JSON.stringify(scheduledTask), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

// DELETE /api/actions/multicast/scheduled
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { scheduledTaskID } = body;

    if (!scheduledTaskID) {
      throw new ApiError("scheduledTaskID is required.", 400);
    }

    const result = await cancelScheduledTask(scheduledTaskID);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Full Error ", error);
    return createErrorResponse(error);
  }
}
