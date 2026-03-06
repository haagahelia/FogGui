import { fogFetchJson } from "@/lib/fogApi";

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    const groups = await fogFetchJson("/fog/task", { method: "GET" });

    return new Response(JSON.stringify(groups), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
