import { useEffect, useState } from "react";
import { Task } from "@/types/task";

export function useActiveTasks(selectedGroup: { id: number } | null, refreshTrigger: boolean) {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!selectedGroup) return;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/active-tasks?groupId=${selectedGroup.id}`);
        const data: Task[] = await res.json();
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
  }, [selectedGroup, refreshTrigger]);

  return activeTasks;
}
