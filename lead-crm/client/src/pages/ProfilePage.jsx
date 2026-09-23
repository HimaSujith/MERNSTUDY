import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth.api';
import Button from '../components/common/Button';

export default function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setMessage('Password changed. Please log in again.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Profile</h1>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <dl className="space-y-2 text-sm">
          <div><dt className="text-slate-500">Name</dt><dd className="text-slate-900">{user.name}</dd></div>
          <div><dt className="text-slate-500">Email</dt><dd className="text-slate-900">{user.email}</dd></div>
          <div><dt className="text-slate-500">Role</dt><dd className="capitalize text-slate-900">{user.role}</dd></div>
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Change password</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Change password'}</Button>
        </form>
      </section>
    </div>
  );
}
