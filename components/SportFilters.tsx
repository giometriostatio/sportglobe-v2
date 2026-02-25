import { SportFilter, SPORT_COLORS, SPORT_LABELS } from '@/lib/types';

const FILTERS: { key: SportFilter; label: string; color: string }[] = [
  { key: 'all', label: 'All Sports', color: '#6366F1' },
  { key: 'basketball', label: SPORT_LABELS.basketball, color: SPORT_COLORS.basketball },
  { key: 'college_basketball', label: SPORT_LABELS.college_basketball, color: SPORT_COLORS.college_basketball },
  { key: 'baseball', label: SPORT_LABELS.baseball, color: SPORT_COLORS.baseball },
];

interface Props {
  active: SportFilter;
  onChange: (f: SportFilter) => void;
  counts: Record<string, number>;
}

export default function SportFilters({ active, onChange, counts }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map(f => {
        const isActive = active === f.key;
        const count = f.key === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[f.key] || 0;
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: isActive ? f.color : '#1a1a24',
              color: isActive ? '#fff' : '#9ca3af',
              border: `1px solid ${isActive ? f.color : '#2a2a3a'}`,
            }}
          >
            {f.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
