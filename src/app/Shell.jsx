import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';
import { api, setCsrf } from '../lib/api.js';
import reveloLogo from '../assets/revelo-logo.png';
import PublicLeadSettings from '../components/PublicLeadSettings.jsx';
import { ICONS, navFor } from './navigation.js';
import { Dashboard } from '../pages/Dashboard.jsx';
import { Dealers } from '../pages/admin/Dealers.jsx';
import { RecordPage } from '../pages/RecordPage.jsx';
import { AcquisitionPage } from '../pages/AcquisitionPage.jsx';
import { Activity } from '../pages/Activity.jsx';
import { Profile } from '../pages/Profile.jsx';
import { AppHeader } from '../components/layout/AppHeader.jsx';

export function Shell() {
  const go = useNavigate();
  const me = useQuery({
    queryKey: ['me'],
    queryFn: () =>
      api.get('/auth/me').then((r) => {
        setCsrf(r.data.csrfToken);
        return r.data.user;
      }),
    retry: false,
  });
  if (me.isLoading) return <div className="p-8">Loading ReVelo…</div>;
  if (me.isError) return <Navigate to="/login" />;
  const user = me.data;
  const nav = navFor(user);
  const logout = async () => {
    await api.post('/auth/logout');
    setCsrf('');
    go('/login');
  };
  const record = (t, e) => (
    <RecordPage
      title={t}
      endpoint={e}
      canUploadDocuments={user.role === 'Dealer Admin' || user.role === 'Super Admin'}
      canManageVehicles={user.role === 'Dealer Admin' || user.role === 'Super Admin'}
    />
  );
  return (
    <div className="app-shell min-h-screen md:flex">
      <aside className="relative w-64 overflow-hidden bg-navy p-4">
        <div className="mb-8 px-3">
          <img src={reveloLogo} alt="ReVelo" className="mx-auto h-20 w-20 object-contain" />
          <p className="mt-2 text-center text-xs font-normal text-slate-300">
            {user.operationalProfile || user.role}
          </p>
        </div>
        <nav className="space-y-1">
          {nav.map(([to, label]) => {
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
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route
              path="/dealers"
              element={user.role === 'Super Admin' ? <Dealers /> : <Navigate to="/dashboard" />}
            />
            <Route path="/public-lead-settings" element={user.role === 'Super Admin' ? <PublicLeadSettings /> : <Navigate to="/dashboard" />} />
            <Route
              path="/employees"
              element={
                user.role === 'Dealer Admin' ? record('Employees', 'users') : <Navigate to="/dashboard" />
              }
            />
            <Route path="/activity" element={<Activity />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route
              path="/acquisitions"
              element={
                user.role === 'Dealer Admin' ? (
                  <AcquisitionPage />
                ) : (
                  <Navigate to="/dashboard" />
                )
              }
            />
            <Route path="/parking" element={record('Parking & Yard', 'parking/slots')} />
            <Route path="/inspections" element={record('Inspection Queue', 'inspections')} />
            <Route path="/work-orders" element={record('Work orders', 'work-orders')} />
            <Route path="/enquiries" element={record('Enquiries', 'enquiries')} />
            <Route path="/vehicles" element={record('Vehicles', 'vehicles')} />
            <Route path="/documents" element={record('Documents', 'documents')} />
            <Route path="/offers" element={record('Offers', 'sales')} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </section>
    </div>
  );
}
