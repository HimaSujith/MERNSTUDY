import { useState } from 'react';
import { useUsers, useCreateUser, useDeactivateUser } from '../hooks/useUsersList';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data, isLoading } = useUsers();
  const createUser = useCreateUser();
  const deactivateUser = useDeactivateUser();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await createUser.mutateAsync(form);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'agent' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Agents & Managers</h1>
        <Button onClick={() => setShowForm(true)}>+ Add user</Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {['Name', 'Email', 'Role', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">Loading…</td></tr>
            )}
            {(data?.items || []).map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 text-sm font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-2 text-sm text-slate-600">{u.email}</td>
                <td className="px-4 py-2 text-sm capitalize text-slate-600">{u.role}</td>
                <td className="px-4 py-2 text-sm">{u.isActive ? 'Active' : 'Deactivated'}</td>
                <td className="px-4 py-2 text-right">
                  {currentUser.role === 'admin' && u.isActive && u.id !== currentUser.id && (
                    <Button variant="secondary" onClick={() => deactivateUser.mutate(u.id)}>Deactivate</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} title="Add agent or manager" onClose={() => setShowForm(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Temporary password</label>
            <input type="password" required minLength={8} value={form.password} onChange={(e) => set('password', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          {currentUser.role === 'admin' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
              <select value={form.role} onChange={(e) => set('role', e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="agent">Agent</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={createUser.isPending}>{createUser.isPending ? 'Creating…' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
