import { useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity as ActivityIcon, ArrowUpRight, ChevronLeft, ChevronRight, LayoutDashboard, Menu, ShieldCheck, X } from 'lucide-react';
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
import { DealerOversight } from '../pages/DealerOversight.jsx';
import { SellerDiscussions } from '../pages/SellerDiscussions.jsx';
import { PricingListing } from '../pages/PricingListing.jsx';
import { RefurbishmentManagerWorkspace } from '../components/records/RefurbishmentManagerWorkspace.jsx';
import { AppHeader } from '../components/layout/AppHeader.jsx';
import { DashboardFooter } from '../components/layout/DashboardFooter.jsx';
import '../styles/sidebar.css';

export function Shell() {
  const go = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const navGroups = [
    { title: 'Overview', links: nav.filter(([to]) => to === 'dashboard') },
    {
      title: 'Workspace',
      links: nav.filter(([to]) => !['dashboard', 'activity', 'profile'].includes(to)),
    },
    { title: 'Your space', links: nav.filter(([to]) => ['activity', 'profile'].includes(to)) },
  ].filter((group) => group.links.length);
  const parkingWorkspace = location.pathname === '/parking';
  const logout = async () => {
    await api.post('/auth/logout');
    setCsrf('');
    go('/login');
  };
  const record = (t, e) => (
    <RecordPage
      title={t}
      endpoint={e}
      operationalProfile={user.operationalProfile}
      canConfigureParking={user.role === 'Dealer Admin' || user.role === 'Super Admin' || user.operationalProfile === 'Parking Manager'}
      canUploadDocuments={user.role === 'Dealer Admin' || user.role === 'Super Admin'}
      canManageVehicles={user.role === 'Dealer Admin' || user.role === 'Super Admin'}
      canCreateWorkOrders={user.role === 'Dealer Admin' || user.role === 'Super Admin' || user.operationalProfile === 'Dealership Manager'}
    />
  );
  return (
    <div className={`app-shell min-h-screen md:flex ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {!parkingWorkspace && (
        <button className="fixed bottom-5 right-5 z-[60] grid h-12 w-12 place-items-center rounded-full bg-navy text-white shadow-float md:hidden" aria-label="Toggle workspace navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
      <aside className={`app-sidebar relative w-full overflow-hidden bg-navy md:w-64 ${parkingWorkspace ? 'hidden' : `${menuOpen ? 'block' : 'hidden'} md:block`}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <img src={reveloLogo} alt="ReVelo" />
          </div>
          <div className="sidebar-brand-copy">
            <p className="sidebar-brand-name">ReVelo</p>
            <p className="sidebar-brand-caption">MOTOR OPERATIONS</p>
          </div>
          <span className="sidebar-brand-spark" aria-hidden="true">✦</span>
          <button
            type="button"
            className="sidebar-collapse-toggle"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
          >
            {sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>
        <div className="sidebar-profile">
          <span className="sidebar-profile-icon"><ShieldCheck size={16} /></span>
          <span className="sidebar-profile-copy">
            <span>Workspace</span>
            <strong>{user.operationalProfile || user.role}</strong>
          </span>
          <span className="sidebar-profile-status" title="Secure workspace" />
        </div>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          {navGroups.map((group, groupIndex) => (
            <div className="sidebar-nav-group" key={group.title} style={{ '--group-index': groupIndex }}>
              <p className="sidebar-nav-heading">{group.title}</p>
              <div className="sidebar-nav-links">
                {group.links.map(([to, label]) => {
                  const Icon = ICONS[label.split(' ')[0]] || LayoutDashboard;
                  return (
                    <NavLink
                      key={to}
                      to={`/${to}`}
                      title={label}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) => `nav sidebar-link ${isActive ? 'nav-active' : ''}`}
                    >
                      <span className="sidebar-link-icon"><Icon size={17} strokeWidth={1.8} /></span>
                      <span className="sidebar-link-label">{label}</span>
                      <ArrowUpRight className="sidebar-link-arrow" size={14} aria-hidden="true" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footer-art" aria-hidden="true">
            <ActivityIcon size={19} />
            <span />
          </div>
          <div className="sidebar-footer-copy">
            <p className="sidebar-footer-title">ReVelo network</p>
            <p className="sidebar-footer-subtitle"><span /> Workspace connected</p>
          </div>
          <span className="sidebar-footer-spark" aria-hidden="true">✧</span>
        </div>
      </aside>
      <section className={`min-w-0 flex-1 ${parkingWorkspace ? 'parking-fullscreen' : ''}`}>
        {!parkingWorkspace && <AppHeader user={user} logout={logout} />}
        <main className={`workspace ${parkingWorkspace ? 'min-h-screen p-3 md:p-4' : 'p-6 md:p-8'}`}>
          {!parkingWorkspace && (
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-400"><span>Workspace</span><span>/</span><span className="capitalize text-slate-600">{location.pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') || 'dashboard'}</span></div>
          )}
          <Routes>
            <Route path="/account/dashboard" element={user.role === 'Buyer & Seller' ? <Dashboard user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/dealer/dashboard" element={user.role !== 'Buyer & Seller' && user.role !== 'Super Admin' ? <Dashboard user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/platform/dashboard" element={user.role === 'Super Admin' ? <Dashboard user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user.operationalProfile === 'Dealership Manager' ? <DealerOversight managerMode /> : <Dashboard user={user} />} />
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
            <Route path="/activity" element={<Activity user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/dealer-oversight" element={user.role === 'Dealer Admin' || user.operationalProfile === 'Dealership Manager' ? <DealerOversight managerMode={user.operationalProfile === 'Dealership Manager'} /> : <Navigate to="/dashboard" />} />
            <Route path="/seller-discussions" element={user.operationalProfile === 'Dealership Manager' ? <SellerDiscussions /> : <Navigate to="/dashboard" />} />
            <Route
              path="/acquisitions"
              element={
                user.role === 'Dealer Admin' || user.operationalProfile === 'Dealership Manager' ? (
                  <AcquisitionPage managerMode={user.operationalProfile === 'Dealership Manager'} />
                ) : (
                  <Navigate to="/dashboard" />
                )
              }
            />
            <Route path="/parking" element={record('Parking & Yard', 'parking/slots')} />
            <Route path="/inspections" element={user.role === 'Dealer Admin' ? <Navigate to="/dealer-oversight" /> : record(user.operationalProfile === 'Service Advisor' ? 'Physical Intake' : 'Inspection Queue', 'inspections')} />
            <Route path="/work-orders" element={record(user.operationalProfile === 'Dealership Manager' ? 'Refurbishment Progress' : 'Work orders', 'work-orders')} />
            <Route path="/completed-handovers" element={user.operationalProfile === 'Dealership Manager' ? <RefurbishmentManagerWorkspace handoverOnly /> : <Navigate to="/dashboard" />} />
            <Route path="/pricing-listing" element={user.operationalProfile === 'Dealership Manager' ? <PricingListing /> : <Navigate to="/dashboard" />} />
            <Route path="/enquiries" element={record('Enquiries', 'enquiries')} />
            <Route path="/vehicles" element={record('Vehicles', 'vehicles')} />
            <Route path="/documents" element={record('Documents', 'documents')} />
            <Route path="/offers" element={record('Offers', 'sales')} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          <DashboardFooter />
        </main>
      </section>
    </div>
  );
}
