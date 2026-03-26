import { MulticastSession } from "@/types/task";
import { ScheduledTask } from "@/types/task";

export async function getMulticastSessions(): Promise<MulticastSession[]> {
  const res = await fetch(`/api/actions/multicast/sessions`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch multicast sessions");
  const json = await res.json();
  return json.data as MulticastSession[];
}

export async function getScheduledMulticast(): Promise<ScheduledTask[]> {
  const res = await fetch(`/api/actions/multicast/scheduled`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch scheduled tasks");
  const json = await res.json();
  return json.data as ScheduledTask[];
}

export async function createMulticast(payload: {
  groupID: number;
  imageID: number;
  kernelDevice: string;
  scheduledStartTime?: string;
}): Promise<void> {
  const res = await fetch("/api/actions/multicast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to start multicast");
}

export async function deleteMulticastSession(sessionID: number): Promise<void> {
  const res = await fetch("/api/actions/multicast", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionID }),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error || "Failed to cancel multicast session");
}

export async function deleteScheduledMulticast(
  scheduledTaskID: number,
): Promise<void> {
  const res = await fetch("/api/actions/multicast/scheduled", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scheduledTaskID }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to cancel scheduled task");
}
