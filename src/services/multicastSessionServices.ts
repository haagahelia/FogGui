import { MulticastSession } from "@/types/task";

export async function getMulticastSessions(): Promise<MulticastSession[]> {
  const res = await fetch(`/api/actions/multicast/sessions`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch multicast sessions");
  }

  const json = await res.json();

  return json.data as MulticastSession[];
}
