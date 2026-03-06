"use client";

import { useEffect, useState } from "react";
import { Groupassociation } from "@/types/groupassociation";
import { getGroupAssociations } from "@/services/groupAssociationServices";

export function useGroupAssociations() {
  const [groupAssociations, setGroupAssociations] = useState<
    Groupassociation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGroupAssociations()
      .then(setGroupAssociations)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { groupAssociations, loading, error };
}
