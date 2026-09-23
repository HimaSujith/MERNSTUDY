import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads, useCreateLead } from '../hooks/useLeads';
import LeadTable from '../components/leads/LeadTable';
import LeadFilters from '../components/leads/LeadFilters';
import LeadForm from '../components/leads/LeadForm';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

export default function LeadsListPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useLeads(filters);
  const createLead = useCreateLead();
  const navigate = useNavigate();

  async function handleCreate(payload) {
    const res = await createLead.mutateAsync(payload);
    setShowForm(false);
    if (res.possibleDuplicate) {
      // eslint-disable-next-line no-alert
      alert(`Note: a lead with this phone number already exists ("${res.possibleDuplicate.name}"). Both were kept.`);
    }
    navigate(`/leads/${res.lead._id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
        <Button onClick={() => setShowForm(true)}>+ New lead</Button>
      </div>

      <LeadFilters filters={filters} onChange={setFilters} />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <LeadTable leads={data?.items || []} loading={isLoading} />
        </div>
        {data?.pagination && (
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        )}
      </div>

      <Modal open={showForm} title="New lead" onClose={() => setShowForm(false)}>
        <LeadForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} submitting={createLead.isPending} />
      </Modal>
    </div>
  );
}
