import { Group } from "@/types/group";

const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

export async function getGroups(): Promise<Group[]> {
  const endpoint = useDummyData ? "/dummyGroupData.json" : "/api/groups";

  const res = await fetch(endpoint, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch groups");
  }

  const json = await res.json();

  // Normalize response shape
  if (useDummyData) {
    return json.groups.map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      kernelDevice: g.kernelDevice,
      members: g.hostcount,
      createdTime: g.createdTime,
    })) as Group[];
  }

  return json.data as Group[];
}
