export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/group`, {
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
    const body = await req.json();

    console.log("Received PUT body:", body);

    // Ensure the body contains the necessary fields
    const { groupID, kernelDevice, imageID } = body;
    if (!groupID || !kernelDevice || !imageID) {
      return new Response(
        JSON.stringify({ error: "Missing groupID, kernelDevice, or imageID" }),
        { status: 400 }
      );
    }

    // Call the API to update the group with the new disk and image
    const response = await fetch(`${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/group/${groupID}/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
        "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
      },
      body: JSON.stringify({
        kernelDevice: kernelDevice, // "Disk 1" or "Disk 2"
        imageID: imageID,           // The image ID to assign to the group
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update group with selected image and disk.");
    }

    // Return a success message if the update is successful
    const updatedGroup = await response.json();
    return new Response(
      JSON.stringify({ success: true, data: updatedGroup }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    // Handle any errors that occur during the request
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

   /* if (body.action === "createGroup") {
      // Handle group creation
      const { name, description } = body;
      if (!name || name.trim() === "") {
        return new Response(JSON.stringify({ error: "Group name is required" }), { status: 400 });
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/group/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
          "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create group: ${response.statusText}`);
      }

      // Return created group
      const newGroup = await response.json();
      return new Response(JSON.stringify(newGroup), { status: 201, headers: { "Content-Type": "application/json" } });
    } */

    if (body.action === "startMulticast") {
      // Handle multicast task
      const { groupID, taskTypeID, name } = body;
      if (!groupID || !taskTypeID || !name) {
        return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400 });
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/group/${groupID}/task`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
          "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
        },
        body: JSON.stringify({ taskTypeID, name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({ error: `Failed to start multicast: ${errorText}` }), { status: response.status });
      }

      const responseData = await response.json();
      return new Response(JSON.stringify({ success: true, data: responseData }), { status: 200 });
    }

    if (body.action === "startUnicast") {
      // Handle unicast deployment
      const { groupID } = body;

      if (!groupID) {
        return new Response(JSON.stringify({ error: "Missing groupID for deployment" }), { status: 400 });
      }
    
      const apiUrl = `${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/group/${groupID}/task`;
    
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
          "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
        },
        body: JSON.stringify({
          taskTypeID: "1",    // Unicast deployment
          isActive: "1",      // Start immediately
          shutdown: "0",      // Don't shut down after
          other4: "1",        // Wake-on-LAN
        }),
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({ error: `Failed to start deployment: ${errorText}` }), {
          status: response.status,
        });
      }
    
      const responseData = await response.json();
      return new Response(JSON.stringify({ success: true, data: responseData }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  
}