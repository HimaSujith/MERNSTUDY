import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/leads', label: 'Leads' },
  { to: '/followups', label: 'Follow-ups' },
  { to: '/users', label: 'Agents & Managers', roles: ['admin', 'manager'] },
  { to: '/profile', label: 'Profile' },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white sm:block">
      <div className="px-4 py-5">
        <p className="text-lg font-semibold text-indigo-600">Lead CRM</p>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {LINKS.filter((link) => !link.roles || link.roles.includes(user?.role)).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
