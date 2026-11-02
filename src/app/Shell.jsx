import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, setCsrf } from '../lib/api.js';
import reveloLogo from '../assets/revelo-logo.png';

const sections = [['dashboard', 'Dashboard'], ['vehicles', 'Vehicles'], ['enquiries', 'Enquiries'], ['acquisitions', 'Acquisitions'], ['inspections', 'Inspections'], ['parking', 'Parking'], ['work-orders', 'Work orders'], ['documents', 'Documents'], ['activity', 'Activity'], ['profile', 'Profile']];

function Dashboard() {
  const query = useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/dashboard').then((response) => response.data) });
  if (query.isLoading) return <p>Loading dashboard…</p>;
  if (query.isError) return <p className="text-red-600">Dashboard data could not be loaded.</p>;
  const cards = [['Vehicles', query.data.vehicles], ['Ready for sale', query.data.readyForSale], ['Open enquiries', query.data.activeBuyerEnquiries], ['Active employees', query.data.activeEmployees]];
  return <div><h1 className="text-3xl font-bold text-navy">Dashboard</h1><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <article className="card p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-navy">{value ?? 0}</p></article>)}</div></div>;
}

function Records({ label, endpoint }) {
  const query = useQuery({ queryKey: ['records', endpoint], queryFn: () => api.get(`/${endpoint}`).then((response) => response.data) });
  return <div><h1 className="text-3xl font-bold text-navy">{label}</h1>{query.isLoading ? <p className="mt-5">Loading…</p> : query.isError ? <p className="mt-5 text-red-600">This section could not be loaded.</p> : <pre className="mt-5 max-h-[65vh] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(query.data, null, 2)}</pre>}</div>;
}

export function Shell() {
  const navigate = useNavigate();
  const me = useQuery({ queryKey: ['me'], queryFn: () => api.get('/auth/me').then((response) => { setCsrf(response.data.csrfToken); return response.data.user; }), retry: false });
  if (me.isLoading) return <div className="p-8">Loading ReVelo…</div>;
  if (me.isError) return <Navigate to="/login" replace />;
  const logout = async () => { await api.post('/auth/logout'); setCsrf(''); navigate('/login'); };
  const user = me.data;
  return <div className="app-shell min-h-screen md:flex"><aside className="w-64 bg-navy p-4 text-white"><img src={reveloLogo} alt="ReVelo" className="mx-auto h-20 w-20 object-contain"/><p className="my-4 text-center text-sm">{user.operationalProfile || user.role}</p><nav className="space-y-1">{sections.map(([path, label]) => <NavLink key={path} to={`/${path}`} className={({ isActive }) => `nav ${isActive ? 'nav-active' : ''}`}>{label}</NavLink>)}</nav><button className="mt-6 w-full rounded-lg border border-white/30 px-3 py-2 text-sm" onClick={logout}>Sign out</button></aside><main className="workspace min-w-0 flex-1 p-6 md:p-8"><Routes><Route path="/dashboard" element={<Dashboard />} /><Route path="/dealer/dashboard" element={<Dashboard />} /><Route path="/platform/dashboard" element={<Dashboard />} />{sections.slice(1).map(([path, label]) => <Route key={path} path={`/${path}`} element={<Records label={label} endpoint={path} />} />)}<Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></main></div>;
}
