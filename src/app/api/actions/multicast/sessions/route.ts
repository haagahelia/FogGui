import { fogFetchJson } from "@/lib/fogApi";

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
  } catch (error: any) {
    console.error("Full Error", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch multicast sessions",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
