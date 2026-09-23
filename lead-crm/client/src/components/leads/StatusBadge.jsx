const COLORS = {
  New: 'bg-sky-100 text-sky-700',
  Contacted: 'bg-amber-100 text-amber-700',
  'Site Visit Scheduled': 'bg-violet-100 text-violet-700',
  'Site Visit Done': 'bg-indigo-100 text-indigo-700',
  Negotiation: 'bg-orange-100 text-orange-700',
  Converted: 'bg-emerald-100 text-emerald-700',
  Lost: 'bg-slate-200 text-slate-600',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}
