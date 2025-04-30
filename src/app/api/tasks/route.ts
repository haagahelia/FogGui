export async function GET() {
  try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/task`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
            "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch groups: ${response.statusText}`);
        }

        const groups = await response.json();
        return new Response(JSON.stringify(groups), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (error: any) {
        return new Response(error.message, { status: 500 });
      }
    }

export async function PUT(req: Request) {
  try {
    const { taskIds } = await req.json(); // Extract task IDs from the request body

    if (!taskIds || taskIds.length === 0) {
      return new Response("No tasks to cancel", { status: 400 });
    }

    // Iterate over the task IDs and cancel each task
    for (const taskId of taskIds) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/task/${taskId}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
          "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
        },
        body: JSON.stringify({
          stateID: "5", // Mark as cancelled
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel task with ID ${taskId}: ${response.statusText}`);
      }
    }

    return new Response("Tasks cancelled successfully", { status: 200 });
  } catch (error: any) {
    return new Response(`Error canceling tasks: ${error.message}`, { status: 500 });
  }
}
