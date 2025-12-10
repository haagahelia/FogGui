import { useEffect, useState, useRef } from "react";
import { Task } from "@/types/task";

export function useActiveTasks(groupHostIds: number[], refreshTrigger: boolean) {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!groupHostIds.length) {
      setActiveTasks([]);
      stopInterval();
      return;
    }

    const fetchTasks = async () => {
      try {
        const hostIdsParam = groupHostIds.join(",");
        const res = await fetch(`/api/tasks/active?hostIdsParam=${hostIdsParam}`);
        const data: Task[] = await res.json();
        console.log(data);
        setActiveTasks(data);

        if (data.length === 0) {
          stopInterval();
        } else if (!intervalRef.current) {
          intervalRef.current = setInterval(fetchTasks, 5000);
        }
      } catch (e) {
        console.error("Failed to fetch active tasks:", e);
        setActiveTasks([]);
        stopInterval();
      }
    };

    fetchTasks();

    return () => stopInterval();
  }, [groupHostIds, refreshTrigger]);

  return activeTasks;
}
