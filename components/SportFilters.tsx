import { SportFilter, SPORT_COLORS, SPORT_LABELS } from '@/lib/types';

const FILTERS: { key: SportFilter; label: string; color: string }[] = [
  { key: 'all', label: 'All Sports', color: '#6366F1' },
  { key: 'basketball', label: SPORT_LABELS.basketball, color: SPORT_COLORS.basketball },
  { key: 'college_basketball', label: SPORT_LABELS.college_basketball, color: SPORT_COLORS.college_basketball },
  { key: 'baseball', label: SPORT_LABELS.baseball, color: SPORT_COLORS.baseball },
  { key: 'hockey', label: SPORT_LABELS.hockey, color: SPORT_COLORS.hockey },
  { key: 'college_hockey', label: SPORT_LABELS.college_hockey, color: SPORT_COLORS.college_hockey },
  { key: 'soccer', label: SPORT_LABELS.soccer, color: SPORT_COLORS.soccer },
  { key: 'football', label: SPORT_LABELS.football, color: SPORT_COLORS.football },
  { key: 'minor_baseball', label: SPORT_LABELS.minor_baseball, color: SPORT_COLORS.minor_baseball },
  { key: 'mma', label: SPORT_LABELS.mma, color: SPORT_COLORS.mma },
  { key: 'f1', label: SPORT_LABELS.f1, color: SPORT_COLORS.f1 },
];

interface Props {
  active: SportFilter;
  onChange: (f: SportFilter) => void;
  counts: Record<string, number>;
}

export default function SportFilters({ active, onChange, counts }: Props) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map(f => {
        const isActive = active === f.key;
        const count = f.key === 'all' ? total : counts[f.key] || 0;
        if (f.key !== 'all' && count === 0) return null;
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