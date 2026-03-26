interface SelectOption {
  id: number | string;
  name: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
}

export function SelectField({
  label,
  value,
  options,
  placeholder = "— Select —",
  onChange,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.65rem] font-medium tracking-[0.1em] uppercase text-slate-400">
        {label}
      </label>
      <select
        className="w-full px-3 py-2.5 bg-[#0f1117] border border-[#1e2535] rounded-md text-slate-200 text-sm outline-none transition-colors duration-150 cursor-pointer appearance-none focus:border-[#4a90d9] [&>option]:bg-[#161b27]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}
