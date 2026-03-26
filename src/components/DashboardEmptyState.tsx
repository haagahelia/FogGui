export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-[#2a3550] text-[0.75rem] tracking-[0.1em] uppercase py-8">
      <span className="text-2xl opacity-30">⬡</span>
      {message}
    </div>
  );
}
