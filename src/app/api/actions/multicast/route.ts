import { startGroupMulticast, cancelGroupMulticast } from "@/lib/fogTasks";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("DEBUG: Received body:", body);
    const { groupID, imageID, kernelDevice } = body;

    // Strict Validation
    if (!groupID || !imageID || !kernelDevice) {
      return new Response(
        JSON.stringify({
          error: "groupID, imageID, and kernelDevice are all required.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await startGroupMulticast(
      Number(groupID),
      Number(imageID),
      String(kernelDevice),
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Multicast failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { sessionID } = body;

    if (!sessionID) {
      return new Response(JSON.stringify({ error: "sessionID is required." }), {
        status: 400,
      });
    }

    const result = await cancelGroupMulticast(sessionID);

    return new Response(JSON.stringify(result), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Full Error ", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Cancel Group Multicast Failed",
      }),
      { status: 400 },
    );
  }
}
