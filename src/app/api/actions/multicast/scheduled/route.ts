import { fogFetchJson } from "@/lib/fogApi";
import { cancelScheduledTask } from "@/lib/fogTasks";

// GET /api/actions/multicast/scheduled
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
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

// DELETE /api/actions/multicast/scheduled
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { scheduledTaskID } = body;

    if (!scheduledTaskID) {
      return new Response(
        JSON.stringify({ error: "scheduleTaskID is required." }),
        {
          status: 400,
        },
      );
    }

    const result = await cancelScheduledTask(scheduledTaskID);

    return new Response(JSON.stringify(result), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Full Error ", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Cancel Scheduled Multicast Failed",
      }),
      { status: 400 },
    );
  }
}
