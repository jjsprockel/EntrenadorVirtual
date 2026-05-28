import { NavLink } from 'react-router-dom';
import { Dumbbell, CalendarDays, BarChart2, User, Home, Shield } from 'lucide-react';
import { useUsersStore } from '@/stores/usersStore';

const baseNavItems = [
  { to: '/', label: 'Hoy', icon: Home, exact: true },
  { to: '/rutinas', label: 'Rutinas', icon: CalendarDays, exact: false },
  { to: '/ejercicios', label: 'Ejercicios', icon: Dumbbell, exact: false },
  { to: '/progreso', label: 'Progreso', icon: BarChart2, exact: false },
  { to: '/perfil', label: 'Perfil', icon: User, exact: false },
];

const adminNavItem = { to: '/admin', label: 'Admin', icon: Shield, exact: false };

export default function BottomNav() {
  const activeUser = useUsersStore((s) => s.getActiveUser());
  const isAdmin = activeUser?.role === 'admin';
  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex h-16 items-stretch">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')
            }
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
