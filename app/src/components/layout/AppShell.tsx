import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
