"use client";

import { useEffect, useState } from "react";
import { ActiveTask } from "@/types/task";
import { getActiveTasks } from "@/test-services/activeTaskServices";

export function useActiveTasks() {
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    setLoading(true);
    getActiveTasks()
      .then(setActiveTasks)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, [trigger]);

  const refetch = () => setTrigger((t) => t + 1);

  return { activeTasks, loading, error, refetch };
}
