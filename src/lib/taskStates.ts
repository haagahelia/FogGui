export const TASK_STATES: Record<number, { label: string; color: string }> = {
  1: {
    label: "Queuing",
    color: "text-yellow-400 bg-[#2a1f00] border-yellow-800",
  },
  2: {
    label: "Check-in",
    color: "text-orange-400 bg-[#2a1500] border-orange-800",
  },
  3: {
    label: "In-Progress",
    color: "text-[#4a90d9]  bg-[#0d1f33] border-[#1e3a5a]",
  },
  4: {
    label: "Completed",
    color: "text-green-400  bg-[#0d2a1a] border-green-800",
  },
  5: {
    label: "Cancelled",
    color: "text-red-400    bg-[#2a0d0d] border-red-800",
  },
};
