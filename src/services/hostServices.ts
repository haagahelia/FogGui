import { Host } from "@/types/host";

const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

export async function getHosts(): Promise<Host[]> {
  const endpoint = useDummyData ? "/dummyData.json" : "/api/hosts";

  const res = await fetch(endpoint, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch hosts");
  }

  const json = await res.json();

  if (useDummyData) {
    // Normalize dummy JSON to match Host type
    return json.hosts.map((h: any) => ({
      id: h.id,
      name: h.name,
      ip: h.ip,
      primac: h.primac,
      imageID: h.imageID,
      imagename: h.imagename,
      image: h.image,
      createdTime: h.createdTime,
      deployed: h.deployed,
      pingstatuscode: h.pingstatuscode,
      pingstatustext: h.pingstatustext,
      pingstatus: h.pingstatus,
    })) as Host[];
  }

  // Real API returns data array
  return json.data as Host[];
}
