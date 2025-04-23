export async function PUT(req: Request) {
    try {
      const body = await req.json();

      const { groupID, kernelDevice } = body;
      if (!groupID || !kernelDevice) {
        return new Response(
          JSON.stringify({ error: "Missing groupID or Primary Disk" }),
          { status: 400 }
        );
      }
  
      // Call the API to update the group with the disk to be wiped
      const response = await fetch(`${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/group/${groupID}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
          "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
        },
        body: JSON.stringify({
          kernelDevice: kernelDevice, // "Disk 1" or "Disk 2"
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update group Primary Disk.");
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
      const { groupID } = body;
  
      if (!groupID) {
        return new Response(JSON.stringify({ error: "Missing groupID for wipe" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
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
          taskTypeID: "18",  // Fast Wipe
          isActive: "1",
          shutdown: "0",
          other4: "0",
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({ error: `Failed to start wiping: ${errorText}` }), {
          status: response.status,
        });
      }
  
      const responseData = await response.json();
      return new Response(JSON.stringify({ success: true, data: responseData }), { status: 200 });
  
    } catch (error: any) {
      return new Response(JSON.stringify({ error: `Unexpected error: ${error.message || error}` }), {
        status: 500,
      });
    }
  }
  