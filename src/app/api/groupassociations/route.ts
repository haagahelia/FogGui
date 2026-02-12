import { fogFetchJson } from "@/lib/fogApi";

// GET /api/groupassociations - Get all group associations
export async function GET() {
  try {
    const groupAssociations = await fogFetchJson("/fog/groupassociation", {
      method: "GET",
    });

    return new Response(JSON.stringify(groupAssociations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
