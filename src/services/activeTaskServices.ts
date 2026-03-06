import { ActiveTask } from "@/types/task";

export async function getActiveTasks(): Promise<ActiveTask[]> {
  const res = await fetch(`/api/tasks/active`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch active tasks");
  }

  const json = await res.json();

  return json.data as ActiveTask[];
}
