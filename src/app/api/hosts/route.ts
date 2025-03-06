export async function DELETE(req: Request) {
  try {
    const { hostId } = await req.json(); // Extract host ID from request body

    const response = await fetch(`${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/host/${hostId}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
        "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete host: ${response.statusText}`);
    }

    return new Response("Host deleted", { status: 200 });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
