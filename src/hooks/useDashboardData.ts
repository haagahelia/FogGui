"use client";

import { useEffect, useState } from "react";

import { Group } from "@/types/group";
import { Image } from "@/types/image";
import { Host } from "@/types/host";
import { Groupassociation } from "@/types/groupassociation";

import { getGroups } from "@/services/groupServices";
import { getImages } from "@/services/imageServices";
import { getHosts } from "@/services/hostServices";
import { getGroupAssociations } from "@/services/groupAssociationServices";

export function useDashboardData() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [groupAssociations, setGroupAssociations] = useState<
    Groupassociation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch all data in parallel
    Promise.all([getGroups(), getImages(), getHosts(), getGroupAssociations()])
      .then(
        ([
          fetchedGroups,
          fetchedImages,
          fetchedHosts,
          fetchedGroupAssociations,
        ]) => {
          setGroups(fetchedGroups);
          setImages(fetchedImages);
          setHosts(fetchedHosts);
          setGroupAssociations(fetchedGroupAssociations);
        },
      )
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    groups,
    images,
    hosts,
    groupAssociations,
    loading,
    error,
  };
}
