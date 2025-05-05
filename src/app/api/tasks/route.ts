export async function GET() {

  try {

    const response = await fetch(`${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/task`, {

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

    const { taskIds } = await req.json(); // Expect an array of task IDs

    if (!Array.isArray(taskIds) || taskIds.length === 0) {

      return new Response("No task IDs provided", { status: 400 });

    }

    const fogApiBase = process.env.NEXT_PUBLIC_FOG_API_BASE_URL;

    const headers = {

      "Content-Type": "application/json",

      "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",

      "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",

    };

    // Cancel each task one by one

    const results = await Promise.allSettled(

        taskIds.map(taskId =>

            fetch(`${fogApiBase}/fog/task/${taskId}/edit`, {

              method: "PUT",

              headers,

              body: JSON.stringify({ stateID: "5" }), // Cancel state

            })

        )

    );

    const failed = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok));

    if (failed.length > 0) {

      return new Response(`Some tasks failed to cancel (${failed.length}/${taskIds.length})`, { status: 500 });

    }

    return new Response("All tasks cancelled", { status: 200 });

  } catch (error: any) {

    return new Response(error.message || "Internal server error", { status: 500 });

  }

}

