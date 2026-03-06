import { fogFetchJson } from "@/lib/fogApi";

// GET /api/actions/tests
export async function GET() {
  try {
    const test = await fogFetchJson(`/fog/scheduledtask/7`, {
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
