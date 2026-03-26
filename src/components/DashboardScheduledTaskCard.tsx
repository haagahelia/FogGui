interface ScheduledTaskCardProps {
  task: {
    id: number;
    groupName: string;
    starttime: string;
    imageName: string;
    type: string;
  };
  isSelected: boolean;
  onSelect: (id: number | null) => void;
}

export function ScheduledTaskCard({
  task,
  isSelected,
  onSelect,
}: ScheduledTaskCardProps) {
  return (
    <div
      className={`grid items-center gap-5 px-5 py-4 border rounded-lg transition-colors duration-150 cursor-pointer ${
        isSelected
          ? "border-red-500 bg-[#1a1520] hover:border-red-400"
          : "bg-[#161b27] border-[#1e2535] hover:border-[#2a3550]"
      }`}
      style={{ gridTemplateColumns: "1.4fr 1.2fr 1.6fr auto" }}
      onClick={() => onSelect(isSelected ? null : task.id)}
    >
      <span className="text-[0.95rem] font-semibold text-slate-100 truncate">
        {task.groupName}
      </span>
      <span className="text-sm font-normal text-slate-300 whitespace-nowrap">
        {task.starttime}
      </span>
      <span className="text-sm text-slate-400 truncate">{task.imageName}</span>
      <span className="text-[0.6rem] px-2.5 py-0.5 rounded-full bg-[#0d1f33] text-[#4a90d9] border border-[#1e3a5a] whitespace-nowrap tracking-[0.05em] justify-self-end">
        {task.type}
      </span>
    </div>
  );
}
