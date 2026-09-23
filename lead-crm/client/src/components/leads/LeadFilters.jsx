const STATUSES = ['New', 'Contacted', 'Site Visit Scheduled', 'Site Visit Done', 'Negotiation', 'Converted', 'Lost'];
const SOURCES = ['Walk-in', 'Referral', 'Website', 'Phone Inquiry', 'Social Media', 'Newspaper', 'Other'];

export default function LeadFilters({ filters, onChange }) {
  function set(field, value) {
    onChange({ ...filters, [field]: value, page: 1 });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        placeholder="Search name, phone, email…"
        value={filters.search || ''}
        onChange={(e) => set('search', e.target.value)}
        className="w-56 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <select
        value={filters.status || ''}
        onChange={(e) => set('status', e.target.value)}
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        value={filters.source || ''}
        onChange={(e) => set('source', e.target.value)}
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      >
        <option value="">All sources</option>
        {SOURCES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
