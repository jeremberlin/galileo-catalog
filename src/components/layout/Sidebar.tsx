import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Table2, School, BookOpen, GitCompare } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/explorer', icon: Table2, label: 'Catalogue' },
  { to: '/ecoles', icon: School, label: 'Par école' },
  { to: '/cursus', icon: BookOpen, label: 'Par cursus' },
  { to: '/comparaison', icon: GitCompare, label: 'Comparaison' },
];

export function Sidebar() {
  return (
    <aside className="w-56 bg-slate-900 text-white flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold tracking-tight">Galileo</h1>
        <p className="text-xs text-slate-400">Catalogue pédagogique</p>
      </div>
      <nav className="flex-1 py-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
