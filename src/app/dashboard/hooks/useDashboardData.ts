import { useEffect, useState } from "react";
import { Group } from "@/types/group";
import { Image } from "@/types/image";
import { Host } from "@/types/host";
import { Groupassociation } from "@/types/groupassociation";

export function useDashboardData(useDummyData: boolean) {
  const [groupAssociations, setGroupAssociations] = useState<Groupassociation[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assocEndpoint = useDummyData ? "/dummyGroupAssociation.json" : "/api/groupassociations";
        const hostEndpoint = useDummyData ? "/dummyData.json" : "/api/hosts";
        const groupEndpoint = useDummyData ? "/dummyGroupData.json" : "/api/groups";
        const imageEndpoint = useDummyData ? "/dummyImageData.json" : "/api/images";

        const [assocRes, hostRes, groupRes, imageRes] = await Promise.all([
          fetch(assocEndpoint),
          fetch(hostEndpoint),
          fetch(groupEndpoint),
          fetch(imageEndpoint),
        ]);

        const [assocData, hostData, groupData, imageData] = await Promise.all([
          assocRes.json(),
          hostRes.json(),
          groupRes.json(),
          imageRes.json(),
        ]);

        setGroupAssociations(assocData.groupassociations || []);
        setHosts(hostData.hosts || []);
        setGroups(groupData.groups || []);
        setImages(imageData.images || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [useDummyData]);

  return { groupAssociations, hosts, groups, images, loading };
}
