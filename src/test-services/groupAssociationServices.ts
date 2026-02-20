import { Groupassociation } from "@/types/groupassociation";

const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

export async function getGroupAssociations(): Promise<Groupassociation[]> {
  const endpoint = useDummyData
    ? "/dummyGroupAssociation.json"
    : "/api/groupassociations";

  const res = await fetch(endpoint, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch group associations");
  }

  const json = await res.json();

  if (useDummyData) {
    // Normalize dummy structure to match the type
    return json.groupassociations.map((ga: any) => ({
      id: ga.id,
      groupID: ga.groupID,
      hostID: ga.hostID,
    })) as Groupassociation[];
  }

  // Real API returns data array
  return json.data as Groupassociation[];
}
