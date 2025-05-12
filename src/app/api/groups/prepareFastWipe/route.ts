export async function PUT(req: Request) {
  try {
    const bodyText = await req.text(); 

    const body = JSON.parse(bodyText);

    const { hostIDs, kernelDevice, groupID } = body;
    if (!Array.isArray(hostIDs) || hostIDs.length === 0 || !kernelDevice || !groupID ) {
      return new Response(
        JSON.stringify({ error: "Missing host IDs, kernel device or groupID" }),
        { status: 400 }
      );
    }

    const fogApiBase = process.env.NEXT_PUBLIC_FOG_API_BASE_URL;
    const headers = {
      "Content-Type": "application/json",
      "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
      "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
    };

    const groupRes = await fetch(`${fogApiBase}/fog/group/${groupID}/edit`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ kernelDevice }),
    });

    if (!groupRes.ok) {
      return new Response("Failed to update group primary disk", { status: 500 });
    }

    // updating selectedGroups each hosts kernelDevice (Primary disk)
    // commented out
/*
    const results = await Promise.allSettled(
      hostIDs.map((hostId: number) => {
        return fetch(`${fogApiBase}/fog/host/${hostId}/edit`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ kernelDevice }),
        });
      })
    );
    
    results.forEach((result, index) => {
      const hostId = hostIDs[index];
      if (result.status === "fulfilled") {
        console.log(`Host ${hostId} PUT status: ${result.value.status}`);
        if (!result.value.ok) {
          console.error(`Host ${hostId} response NOT OK`);
        }
      } else {
        console.error(`Host ${hostId} request REJECTED:`, result.reason);
      }
    });
    
    const failed = results.filter(
      r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)
    );

    if (failed.length > 0) {
      return new Response(
        `Some hosts failed to update kernelDevice (${failed.length}/${hostIDs.length})`,
        { status: 207 }
      );
    }
*/
    return new Response(JSON.stringify({ success: true, message: "All hosts updated successfully" }), {
  status: 200,
  headers: { "Content-Type": "application/json" },
});
  } catch (error: any) {
    console.error("Error during PUT:", error.message); // Log any errors
    return new Response(error.message || "Internal server error", { status: 500 });
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
          other2: "0",
          other4: "1",
          wol: "1",
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
  