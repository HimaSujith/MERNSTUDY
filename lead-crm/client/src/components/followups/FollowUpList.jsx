import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { formatDateTime } from '../../utils/formatters';
import { useCompleteFollowUp, useCancelFollowUp } from '../../hooks/useFollowUps';

export default function FollowUpList({ followUps, loading, showLeadLink = true }) {
  const complete = useCompleteFollowUp();
  const cancel = useCancelFollowUp();

  if (loading) return <p className="p-6 text-center text-sm text-slate-500">Loading follow-ups…</p>;
  if (!followUps.length) return <p className="p-6 text-center text-sm text-slate-500">Nothing here.</p>;

  return (
    <ul className="divide-y divide-slate-100">
      {followUps.map((f) => {
        const overdue = f.status === 'Pending' && new Date(f.dueDate) < new Date();
        return (
          <li key={f._id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {f.type}
                {showLeadLink && f.lead && (
                  <>
                    {' '}for{' '}
                    <Link to={`/leads/${f.lead._id}`} className="text-indigo-600 hover:underline">
                      {f.lead.name}
                    </Link>
                  </>
                )}
              </p>
              <p className={`text-xs ${overdue ? 'font-medium text-red-600' : 'text-slate-500'}`}>
                Due {formatDateTime(f.dueDate)} · {f.status}
              </p>
              {f.notes && <p className="mt-0.5 text-xs text-slate-500">{f.notes}</p>}
            </div>
            {f.status === 'Pending' && (
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => cancel.mutate(f._id)}>Cancel</Button>
                <Button onClick={() => complete.mutate(f._id)}>Complete</Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
