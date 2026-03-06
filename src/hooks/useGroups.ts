"use client";

import { useEffect, useState } from "react";
import { Group } from "@/types/group";
import { getGroups } from "@/services/groupServices";

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGroups()
      .then(setGroups)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { groups, loading, error };
}
