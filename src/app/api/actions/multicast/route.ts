import {
  startGroupMulticast,
  cancelGroupMulticast,
  scheduleGroupMulticast,
} from "@/lib/fogTasks";
import { createErrorResponse, ApiError } from "@/lib/errorHandler";

// POST /api/actions/multicast
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { groupID, imageID, kernelDevice, scheduledStartTime } = body;

    if (!groupID || !imageID || !kernelDevice) {
      throw new ApiError(
        "groupID, imageID, and kernelDevice are all required.",
        400,
      );
    }

    const result = scheduledStartTime
      ? await scheduleGroupMulticast(
          Number(groupID),
          Number(imageID),
          String(kernelDevice),
          String(scheduledStartTime),
        )
      : await startGroupMulticast(
          Number(groupID),
          Number(imageID),
          String(kernelDevice),
        );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

// DELETE /api/actions/multicast
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { sessionID } = body;

    if (!sessionID) {
      throw new ApiError("sessionID is required.", 400);
    }

    const result = await cancelGroupMulticast(sessionID);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Full Error ", error);
    return createErrorResponse(error);
  }
}
