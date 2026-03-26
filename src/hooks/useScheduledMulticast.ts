"use client";

import { useEffect, useState } from "react";
import { ScheduledTask } from "@/types/task";
import {
  getScheduledMulticast,
  deleteScheduledMulticast,
} from "@/services/multicastServices";

export function useScheduledMulticast() {
  const [scheduledMulticast, setScheduledMulticast] = useState<ScheduledTask[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    setLoading(true);
    getScheduledMulticast()
      .then(setScheduledMulticast)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, [trigger]);

  const refetch = () => setTrigger((t) => t + 1);

  const cancelScheduledMulticast = async (scheduledTaskID: number) => {
    await deleteScheduledMulticast(scheduledTaskID);
    refetch();
  };

  return {
    scheduledMulticast,
    loading,
    error,
    refetch,
    cancelScheduledMulticast,
  };
}
