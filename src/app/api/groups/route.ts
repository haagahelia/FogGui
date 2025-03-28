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

  export async function POST(req: Request) {
    try {
      // Parse the request body
      const { name, description } = await req.json();
  
      // Validate input
      if (!name || name.trim() === "") {
        return new Response(JSON.stringify({ error: "Group name is required" }), { status: 400 });
      }
  
      // Send POST request to FOG API
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
  
      // Return the created group
      const newGroup = await response.json();
      return new Response(JSON.stringify(newGroup), { status: 201, headers: { "Content-Type": "application/json" } });
  
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  