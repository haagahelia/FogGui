"use client";

import { useEffect, useState } from "react";
import { Host } from "@/types/host";
import { getHosts } from "@/services/hostServices";

export function useHosts() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHosts()
      .then(setHosts)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { hosts, loading, error };
}
