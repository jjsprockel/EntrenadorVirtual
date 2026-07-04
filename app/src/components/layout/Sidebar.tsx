import { NavLink } from 'react-router-dom';
import { Dumbbell, CalendarDays, BarChart2, User, Home, Shield, Zap } from 'lucide-react';
import { useUsersStore } from '@/stores/usersStore';

const baseNavItems = [
  { to: '/', label: 'Hoy', icon: Home, exact: true },
  { to: '/sesion-libre', label: 'Sesión libre', icon: Zap, exact: false },
  { to: '/rutinas', label: 'Rutinas', icon: CalendarDays, exact: false },
  { to: '/ejercicios', label: 'Ejercicios', icon: Dumbbell, exact: false },
  { to: '/progreso', label: 'Progreso', icon: BarChart2, exact: false },
  { to: '/perfil', label: 'Perfil', icon: User, exact: false },
];

const adminNavItem = { to: '/admin', label: 'Admin', icon: Shield, exact: false };

export default function Sidebar() {
  // Select a stable boolean — avoids re-renders on every unrelated store update
  const isAdmin = useUsersStore(
    (s) => s.users.find((u) => u.id === s.activeUserId)?.role === 'admin',
  );
  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-sidebar h-dvh sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <Dumbbell className="h-5 w-5 text-primary" />
        <span className="font-bold text-foreground tracking-tight">EntrenadorVirtual</span>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              ].join(' ')
            }
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
