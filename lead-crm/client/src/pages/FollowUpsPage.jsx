import { useState } from 'react';
import { useFollowUps } from '../hooks/useFollowUps';
import FollowUpTabs from '../components/followups/FollowUpTabs';
import FollowUpList from '../components/followups/FollowUpList';

export default function FollowUpsPage() {
  const [view, setView] = useState('today');
  const { data, isLoading } = useFollowUps({ view, limit: 50 });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Follow-ups</h1>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <FollowUpTabs active={view} onChange={setView} />
        <FollowUpList followUps={data?.items || []} loading={isLoading} />
      </div>
    </div>
  );
}
