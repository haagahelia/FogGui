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