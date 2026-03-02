"use client";

import { useEffect, useState } from "react";
import { MulticastSession } from "@/types/task";
import { getMulticastSessions } from "@/test-services/multicastSessionServices";

export function useMulticastSessions() {
  const [multicastSessions, setMulticastSessions] = useState<
    MulticastSession[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    setLoading(true);
    getMulticastSessions()
      .then(setMulticastSessions)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, [trigger]);

  const refetch = () => setTrigger((t) => t + 1);

  return { multicastSessions, loading, error, refetch };
}
