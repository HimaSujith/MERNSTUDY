const ACCENTS = {
  neutral: 'border-l-slate-300',
  good: 'border-l-[#0ca30c]',
  warning: 'border-l-[#fab219]',
  critical: 'border-l-[#d03b3b]',
};

export default function StatTile({ label, value, accent = 'neutral' }) {
  return (
    <div className={`rounded-lg border border-slate-200 border-l-4 bg-white px-4 py-3 shadow-sm ${ACCENTS[accent]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
