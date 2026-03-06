import { fogFetchJson } from "@/lib/fogApi";

export async function GET() {
  try {
    const taskType = await fogFetchJson("/fog/tasktype", {
      method: "GET",
    });

    return new Response(JSON.stringify(taskType), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
