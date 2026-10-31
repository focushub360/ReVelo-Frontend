import { NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';
import { api, setCsrf } from '../../lib/api.js';
import reveloLogo from '../../assets/revelo-logo.png';
import { ICONS, navFor } from '../../app/navigation.js';
import { AdminManagement } from './AdminManagement.jsx';
import { AppHeader } from '../../components/layout/AppHeader.jsx';

export function AdminGate() {
  const go = useNavigate();
  const me = useQuery({
    queryKey: ['admin-route-me'],
    queryFn: () =>
      api.get('/auth/me').then((r) => {
        setCsrf(r.data.csrfToken);
        return r.data.user;
      }),
    retry: false,
  });
  if (me.isLoading)
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-500">
        Loading platform access…
      </div>
    );
  if (me.isError || me.data.role !== 'Super Admin') return <Navigate to="/dashboard" />;
  const user = me.data;
  const logout = async () => {
    await api.post('/auth/logout');
    setCsrf('');
    go('/login');
  };
  return (
    <div className="app-shell min-h-screen md:flex">
      <aside className="relative w-64 overflow-hidden bg-navy p-4">
        <div className="mb-8 px-3">
          <img src={reveloLogo} alt="ReVelo" className="mx-auto h-20 w-20 object-contain" />
          <p className="mt-2 text-center text-xs font-normal text-slate-300">Super Admin</p>
        </div>
        <nav className="space-y-1">
          {navFor(user).map(([to, label]) => {
            const Icon = ICONS[label.split(' ')[0]] || LayoutDashboard;
            return (
              <NavLink
                key={to}
                to={`/${to}`}
                className={({ isActive }) => `nav ${isActive ? 'nav-active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <section className="min-w-0 flex-1">
        <AppHeader user={user} logout={logout} />
        <main className="workspace p-6 md:p-8">
          <AdminManagement />
        </main>
      </section>
    </div>
  );
}
