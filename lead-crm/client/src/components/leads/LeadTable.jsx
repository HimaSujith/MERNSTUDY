import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../../utils/formatters';

export default function LeadTable({ leads, loading }) {
  if (loading) {
    return <p className="p-6 text-center text-sm text-slate-500">Loading leads…</p>;
  }

  if (!leads.length) {
    return <p className="p-6 text-center text-sm text-slate-500">No leads found.</p>;
  }

  return (
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          {['Name', 'Phone', 'Status', 'Priority', 'Source', 'Assigned To', 'Created'].map((h) => (
            <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {leads.map((lead) => (
          <tr key={lead._id} className="hover:bg-slate-50">
            <td className="px-4 py-2 text-sm">
              <Link to={`/leads/${lead._id}`} className="font-medium text-indigo-600 hover:underline">
                {lead.name}
              </Link>
            </td>
            <td className="px-4 py-2 text-sm text-slate-600">{lead.phone}</td>
            <td className="px-4 py-2"><StatusBadge status={lead.status} /></td>
            <td className="px-4 py-2 text-sm text-slate-600">{lead.priority}</td>
            <td className="px-4 py-2 text-sm text-slate-600">{lead.source}</td>
            <td className="px-4 py-2 text-sm text-slate-600">{lead.assignedTo?.name || '—'}</td>
            <td className="px-4 py-2 text-sm text-slate-500">{formatDate(lead.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
