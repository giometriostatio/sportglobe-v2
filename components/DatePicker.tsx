interface Props {
  value: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ value, onChange }: Props) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#1a1a24] text-gray-200 border border-[#2a2a3a] focus:outline-none focus:border-[#10B981]"
      style={{ colorScheme: 'dark' }}
    />
  );
}
