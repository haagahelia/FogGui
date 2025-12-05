import { useEffect, useState } from "react";
import { Task } from "@/types/task";

export function useActiveTasks(groupHostIds : number[], refreshTrigger: boolean) {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!groupHostIds.length) {
      setActiveTasks([]);
      return;
    }
  
    let intervalId: NodeJS.Timeout | null = null;

    const fetchTasks = async () => {
      try {
        const hostIdsParam = groupHostIds.join(",");
        const res = await fetch(`/api/tasks/active?hostIdsParam=${hostIdsParam}`);
        const data: Task[] = await res.json();
        console.log(data);
        setActiveTasks(data);

        if (data.length === 0 && intervalId) {
          clearInterval(intervalId);
        }
      } catch (e) {
        console.error("Failed to fetch active tasks:", e);
        setActiveTasks([]);
      }
    };

    fetchTasks();
    intervalId = setInterval(fetchTasks, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [groupHostIds, refreshTrigger]);

  return activeTasks;
}
