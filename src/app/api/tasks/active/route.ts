import { Task } from "@/types/task";
import { fogFetchJson } from "@/lib/fogApi";

// GET /api/tasks/active - Get active tasks
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostIdsParam = searchParams.get("hostIdsParam");

    const allActiveTasks = await fogFetchJson("/fog/task/active", {
      method: "GET",
    });

    const hostIds = hostIdsParam?.split(",").map(Number) || [];

    const filteredTasks = hostIds.length
      ? allActiveTasks.filter((task: Task) => hostIds.includes(task.hostID))
      : allActiveTasks;

    return new Response(JSON.stringify(filteredTasks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
