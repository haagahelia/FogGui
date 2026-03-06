import { Image } from "@/types/image";

const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

export async function getImages(): Promise<Image[]> {
  const endpoint = useDummyData ? "/dummyImageData.json" : "/api/images";

  const res = await fetch(endpoint, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch images");
  }

  const json = await res.json();

  // Normalize dummy JSON structure
  if (useDummyData) {
    return json.images.map((img: any) => ({
      id: img.id,
      name: img.name,
      description: img.description,
      createdTime: img.createdTime,
      createdBy: img.createdBy,
      osname: img.osname ?? img.os?.name,
      imagetypename: img.imagetypename ?? img.imagetype?.name,
      imageparttypename: img.imageparttypename ?? img.imagepartitiontype?.name,
    })) as Image[];
  }

  // Real API returns data array
  return json.data as Image[];
}
