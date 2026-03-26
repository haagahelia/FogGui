import { TASK_STATES } from "@/lib/taskStates";

interface ActiveHostCardProps {
  task: {
    id: number;
    hostName: string;
    imageName: string;
    stateID: number;
    pct?: string;
  };
}

export function ActiveHostCard({ task }: ActiveHostCardProps) {
  const state = TASK_STATES[task.stateID] ?? {
    label: `State ${task.stateID}`,
    color: "text-slate-400 bg-[#1e2535] border-[#2a3550]",
  };

  return (
    <div
      className="grid items-center gap-5 px-5 py-4 bg-[#161b27] border border-[#1e2535] rounded-lg transition-colors duration-150 hover:border-[#2a3550]"
      style={{ gridTemplateColumns: "1.4fr 1.6fr auto auto" }}
    >
      <span className="text-[0.95rem] font-semibold text-slate-100 truncate">
        {task.hostName}
      </span>
      <span className="text-sm text-slate-400 truncate">{task.imageName}</span>
      <span
        className={`text-[0.6rem] px-2.5 py-0.5 rounded-full border whitespace-nowrap tracking-[0.05em] ${state.color}`}
      >
        {state.label}
      </span>
      {task.pct !== undefined && task.pct !== "" ? (
        <span className="text-sm font-medium text-[#4a90d9] whitespace-nowrap justify-self-end">
          {Number(task.pct.slice(-3))}%
        </span>
      ) : (
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e88] justify-self-end animate-pulse" />
      )}
    </div>
  );
}
