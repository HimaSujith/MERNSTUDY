import { useState } from 'react';
import Button from '../common/Button';

const TYPES = ['Call', 'Site Visit', 'Email', 'Meeting', 'Other'];

export default function FollowUpForm({ onSubmit, onCancel, submitting }) {
  const [type, setType] = useState('Call');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ type, dueDate: new Date(dueDate).toISOString(), notes });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Due date & time</label>
        <input
          type="datetime-local"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Schedule'}</Button>
      </div>
    </form>
  );
}
