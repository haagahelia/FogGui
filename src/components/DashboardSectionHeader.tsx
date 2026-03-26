interface SectionHeaderProps {
  title: string;
  badge: { label: string; active: boolean };
  cancelButton?: {
    disabled: boolean;
    isLoading: boolean;
    onClick: () => void;
  };
}

export function SectionHeader({
  title,
  badge,
  cancelButton,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#1e2535] pb-3">
      <div className="flex items-center gap-2.5">
        <div className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[#4a90d9]">
          {title}
        </div>
        <span
          className={`text-[0.65rem] px-2.5 py-0.5 rounded-full tracking-[0.05em] ${
            badge.active
              ? "bg-[#0d2a1a] text-green-500 border border-green-800"
              : "bg-[#1e2535] text-slate-500"
          }`}
        >
          {badge.label}
        </span>
      </div>
      {cancelButton && (
        <button
          className="text-[0.6rem] font-semibold tracking-[0.08em] uppercase px-3 py-1 rounded border border-red-500 bg-transparent text-red-500 cursor-pointer transition-all duration-150 hover:not-disabled:bg-red-500 hover:not-disabled:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={cancelButton.disabled}
          onClick={cancelButton.onClick}
        >
          {cancelButton.isLoading ? "Cancelling..." : "Cancel"}
        </button>
      )}
    </div>
  );
}
