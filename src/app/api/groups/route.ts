import { fogFetchJson } from "@/lib/fogApi";

// GET /api/groups - Get all groups
export async function GET() {
  try {
    const groups = await fogFetchJson("/fog/group", { method: "GET" });

    return new Response(JSON.stringify(groups), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const bodyText = await req.text(); // Log the raw body as text

    const body = JSON.parse(bodyText); // Manually parse the body to see any discrepancies

    const { hostIDs, kernelDevice, imageID, groupID } = body;
    if (
      !Array.isArray(hostIDs) ||
      hostIDs.length === 0 ||
      !kernelDevice ||
      !groupID ||
      !imageID
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing host IDs, kernel device, groupID, or imageID",
        }),
        { status: 400 },
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
      body: JSON.stringify({ imageID, kernelDevice }),
    });

    if (!groupRes.ok) {
      return new Response("Failed to update group image", { status: 500 });
    }

    // updating selectedGroups each hosts kernelDevice (Primary disk)
    // commented out
    /*
    const results = await Promise.allSettled(
      hostIDs.map((hostId: number) => {
        console.log(`Sending PUT to host ${hostId}...`);
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
    return new Response(
      JSON.stringify({
        success: true,
        message: "All hosts updated successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error during PUT:", error.message); // Log any errors
    return new Response(error.message || "Internal server error", {
      status: 500,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Create empty group possibility commented out

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
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          { status: 400 },
        );
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
          taskTypeID,
          name,
          isActive: "1",
          shutdown: "0",
          other2: "0",
          other4: "1",
          wol: "1",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          JSON.stringify({ error: `Failed to start multicast: ${errorText}` }),
          { status: response.status },
        );
      }

      const responseData = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: responseData }),
        { status: 200 },
      );
    }

    if (body.action === "startUnicast") {
      // Handle unicast deployment
      const { groupID } = body;

      if (!groupID) {
        return new Response(
          JSON.stringify({ error: "Missing groupID for deployment" }),
          { status: 400 },
        );
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
          taskTypeID: "1", // Unicast deployment
          isActive: "1",
          shutdown: "0",
          other2: "0",
          other4: "1",
          wol: "1",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          JSON.stringify({ error: `Failed to start deployment: ${errorText}` }),
          {
            status: response.status,
          },
        );
      }

      const responseData = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: responseData }),
        { status: 200 },
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
