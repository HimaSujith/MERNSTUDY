import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUnreadCount, useNotificationsList, useMarkAllNotificationsRead, useMarkNotificationRead } from '../../hooks/useNotifications';
import { formatDateTime } from '../../utils/formatters';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: unread } = useUnreadCount();
  const { data: list } = useNotificationsList(open);
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const count = unread?.count || 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Notifications"
      >
        🔔
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <button
              type="button"
              className="text-xs font-medium text-indigo-600 hover:underline"
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {(list?.items || []).length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-slate-500">No notifications yet</p>
            )}
            {(list?.items || []).map((n) => (
              <Link
                key={n._id}
                to={n.link || '#'}
                onClick={() => {
                  if (!n.isRead) markRead.mutate(n._id);
                  setOpen(false);
                }}
                className={`block border-b border-slate-50 px-3 py-2 text-sm hover:bg-slate-50 ${
                  n.isRead ? 'text-slate-500' : 'font-medium text-slate-900'
                }`}
              >
                <p>{n.title}</p>
                <p className="text-xs text-slate-500">{n.message}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
