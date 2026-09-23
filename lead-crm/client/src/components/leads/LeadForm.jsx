import { useState } from 'react';
import Button from '../common/Button';

const SOURCES = ['Walk-in', 'Referral', 'Website', 'Phone Inquiry', 'Social Media', 'Newspaper', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function LeadForm({ onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Other',
    priority: 'Medium',
    budgetMin: '',
    budgetMax: '',
    location: '',
    propertyRequirement: '',
  });

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name" required value={form.name} onChange={(v) => set('name', v)} />
        <Field label="Phone" required value={form.phone} onChange={(v) => set('phone', v)} />
      </div>
      <Field label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} />
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Source" value={form.source} onChange={(v) => set('source', v)} options={SOURCES} />
        <SelectField label="Priority" value={form.priority} onChange={(v) => set('priority', v)} options={PRIORITIES} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Budget min" type="number" value={form.budgetMin} onChange={(v) => set('budgetMin', v)} />
        <Field label="Budget max" type="number" value={form.budgetMax} onChange={(v) => set('budgetMax', v)} />
      </div>
      <Field label="Location" value={form.location} onChange={(v) => set('location', v)} />
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Requirement notes</label>
        <textarea
          rows={2}
          value={form.propertyRequirement}
          onChange={(e) => set('propertyRequirement', e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save lead'}</Button>
      </div>
    </form>
  );
}

function Field({ label, required, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
