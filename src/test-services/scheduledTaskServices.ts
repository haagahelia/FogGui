import { ScheduledTask } from "@/types/task";

export async function getScheduledMulticast(): Promise<ScheduledTask[]> {
  const res = await fetch(`/api/actions/multicast/scheduled`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch scheduled tasks");
  }

  const json = await res.json();

  return json.data as ScheduledTask[];
}
