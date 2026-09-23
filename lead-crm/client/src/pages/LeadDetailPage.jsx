import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLead, useLeadActivity, useChangeLeadStatus, useAddLeadNote, useAssignLead } from '../hooks/useLeads';
import { useFollowUps, useCreateFollowUp } from '../hooks/useFollowUps';
import { useUsersList } from '../hooks/useUsersList';
import { useAuth } from '../hooks/useAuth';
import StatusBadge from '../components/leads/StatusBadge';
import FollowUpList from '../components/followups/FollowUpList';
import FollowUpForm from '../components/followups/FollowUpForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const STATUSES = ['New', 'Contacted', 'Site Visit Scheduled', 'Site Visit Done', 'Negotiation', 'Converted', 'Lost'];

export default function LeadDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: lead, isLoading } = useLead(id);
  const { data: activity } = useLeadActivity(id);
  const { data: followUps } = useFollowUps({ lead: id, view: 'all', limit: 50 });
  const { data: users } = useUsersList(user.role !== 'agent');

  const changeStatus = useChangeLeadStatus(id);
  const addNote = useAddLeadNote(id);
  const assignLead = useAssignLead(id);
  const createFollowUp = useCreateFollowUp();

  const [note, setNote] = useState('');
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);

  if (isLoading || !lead) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  function handleNoteSubmit(e) {
    e.preventDefault();
    if (!note.trim()) return;
    addNote.mutate(note, { onSuccess: () => setNote('') });
  }

  const canManage = user.role === 'admin' || user.role === 'manager' || lead.assignedTo?._id === user.id;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{lead.name}</h1>
          <p className="text-sm text-slate-500">{lead.phone} {lead.email ? `· ${lead.email}` : ''}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Lead details</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Source" value={lead.source} />
              <Detail label="Priority" value={lead.priority} />
              <Detail label="Location" value={lead.location || '—'} />
              <Detail label="Budget" value={lead.budgetMin || lead.budgetMax ? `${formatCurrency(lead.budgetMin)} – ${formatCurrency(lead.budgetMax)}` : '—'} />
              <Detail label="Assigned to" value={lead.assignedTo?.name || '—'} />
              <Detail label="Requirement" value={lead.propertyRequirement || '—'} span />
            </dl>

            {canManage && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <label className="text-sm text-slate-600">Change status:</label>
                <select
                  value={lead.status}
                  onChange={(e) => changeStatus.mutate({ status: e.target.value })}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                {(user.role === 'admin' || user.role === 'manager') && (
                  <>
                    <label className="ml-4 text-sm text-slate-600">Reassign to:</label>
                    <select
                      value={lead.assignedTo?._id || ''}
                      onChange={(e) => assignLead.mutate(e.target.value)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                    >
                      {(users || []).map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Follow-ups</h2>
              <Button onClick={() => setShowFollowUpForm(true)}>+ Schedule</Button>
            </div>
            <FollowUpList followUps={followUps?.items || []} loading={false} showLeadLink={false} />
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Add a note</h2>
            <form onSubmit={handleNoteSubmit} className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this lead…"
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <Button type="submit" disabled={addNote.isPending}>Add</Button>
            </form>
          </section>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Activity timeline</h2>
          <ul className="space-y-3">
            {(activity || []).map((entry) => (
              <li key={entry._id} className="border-l-2 border-slate-200 pl-3 text-sm">
                <p className="text-slate-800">{entry.message}</p>
                <p className="text-xs text-slate-400">
                  {entry.actor?.name} · {formatDateTime(entry.createdAt)}
                </p>
              </li>
            ))}
            {!(activity || []).length && <p className="text-sm text-slate-500">No activity yet.</p>}
          </ul>
        </section>
      </div>

      <Modal open={showFollowUpForm} title="Schedule a follow-up" onClose={() => setShowFollowUpForm(false)}>
        <FollowUpForm
          submitting={createFollowUp.isPending}
          onCancel={() => setShowFollowUpForm(false)}
          onSubmit={(payload) =>
            createFollowUp.mutate(
              { ...payload, lead: id },
              { onSuccess: () => setShowFollowUpForm(false) }
            )
          }
        />
      </Modal>
    </div>
  );
}

function Detail({ label, value, span }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  );
}
