import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard.api';
import { useFollowUps } from '../hooks/useFollowUps';
import StatTile from '../components/dashboard/StatTile';
import PipelineFunnelChart from '../components/dashboard/PipelineFunnelChart';
import FollowUpList from '../components/followups/FollowUpList';
import Spinner from '../components/common/Spinner';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'summary'], queryFn: dashboardApi.summary });
  const { data: todayFollowUps, isLoading: loadingFollowUps } = useFollowUps({ view: 'today', limit: 5 });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your pipeline and upcoming work</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total leads" value={data?.totalLeads ?? 0} />
        <StatTile label="Due today" value={data?.followUps?.today ?? 0} accent="warning" />
        <StatTile label="Overdue" value={data?.followUps?.overdue ?? 0} accent="critical" />
        <StatTile label="Upcoming" value={data?.followUps?.upcoming ?? 0} accent="good" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PipelineFunnelChart pipeline={data?.pipeline} />
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Today's follow-ups</h3>
            <Link to="/followups" className="text-xs font-medium text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          <FollowUpList followUps={todayFollowUps?.items || []} loading={loadingFollowUps} />
        </div>
      </div>
    </div>
  );
}
