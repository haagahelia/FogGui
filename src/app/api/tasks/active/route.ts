import { Task } from "@/types/task";

//Function for getting active tasks

export async function GET(request: Request) {

    try {

        const { searchParams } = new URL(request.url);
        const hostIdsParam = searchParams.get("hostIdsParam");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_FOG_API_BASE_URL}/fog/task/active`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
                    "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
                },
            }
        );

        const fogResponse = await response.json();
        const allActiveTasks = fogResponse.data;

        const hostIds = hostIdsParam?.split(",").map(Number) || [];

        const filteredTasks = hostIds.length
            ? allActiveTasks.filter((task : Task) => hostIds.includes(task.hostID))
            : allActiveTasks;

        return Response.json(filteredTasks);

    } catch (e: any) {
        return new Response(e.message, { status: 500 })
    }

} 