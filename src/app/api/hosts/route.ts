export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/host`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
        "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch hosts: ${response.statusText}`);
    }

    const hosts = await response.json(); // Parse response JSON
    return new Response(JSON.stringify(hosts), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

//End point for chancing the image and kerneldevice for host
export async function PUT(req: Request) {
  try {
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    const { hostID, kernelDevice, imageID } = body;

    if (!hostID || !kernelDevice || !imageID) {
      return new Response(
        JSON.stringify({ error: "Missing host ID, image ID or kernel device" }),
        { status: 400 }
      );
    }

    const fogApiBase = process.env.NEXT_PUBLIC_FOG_API_BASE_URL;
    const headers = {
      "Content-Type": "application/json",
      "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
      "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
    };

    const hostRes = await fetch(`${fogApiBase}/fog/host/${hostID}/edit`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ kernelDevice, imageID }),
    });

    if (!hostRes.ok) {
      return new Response("Failed to update host image or kerneldevice", { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, message: "All hosts updated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });


  } catch (error: any) {
    console.error("Error editing host:", error.message); // Log any errors
    return new Response(error.message || "Internal server error", { status: 500 });
  }


}
/*
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
} */
