import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { api, setCsrf } from './lib/api';
import reveloLogo from './assets/revelo-logo.png';
import showroomImage from './assets/login-showroom.png';
import ProfileSettingsPanel from './components/ProfileSettings';

const ICONS = {
  Dashboard: LayoutDashboard,
  Dealers: Building2,
  Employees: Users,
  Vehicles: CarFront,
  Enquiries: FileText,
  Inspections: ClipboardCheck,
  Parking: MapPin,
  Workshop: Wrench,
  Activity: ShieldCheck,
  Profile: Users,
  Inventory: CarFront,
  Documents: FileText,
  Offers: FileText,
  Acquisitions: CircleDot,
};
const navFor = (user) => {
  if (user.role === 'Super Admin')
    return [
      ['dashboard', 'Platform Dashboard'],
      ['dealers', 'Dealers'],
      ['admins', 'Admin Management'],
      ['activity', 'Platform Activity'],
      ['profile', 'My Profile'],
    ];
  if (user.role === 'Dealer Admin')
    return [
      ['dashboard', 'Dealership Dashboard'],
      ['enquiries', 'Enquiries'],
      ['vehicles', 'Vehicles'],
      ['documents', 'Documents'],
      ['inspections', 'Inspections'],
      ['acquisitions', 'Acquisitions'],
      ['work-orders', 'Refurbishment'],
      ['parking', 'Parking & Yard'],
      ['offers', 'Offers'],
      ['employees', 'Employees'],
      ['activity', 'Activity Logs'],
      ['profile', 'My Profile'],
    ];
  if (user.operationalProfile === 'Parking Manager')
    return [
      ['dashboard', 'Parking Dashboard'],
      ['parking', 'Yard Map'],
      ['vehicles', 'Vehicle Locations'],
      ['activity', 'My Activity'],
      ['profile', 'My Profile'],
    ];
  if (user.operationalProfile === 'Refurbishment Technician')
    return [
      ['dashboard', 'Workshop Dashboard'],
      ['work-orders', 'My Work Orders'],
      ['activity', 'My Activity'],
      ['profile', 'My Profile'],
    ];
  if (user.role === 'Technician & Service Advisor')
    return [
      ['dashboard', 'My Dashboard'],
      ['inspections', 'Inspection Queue'],
      ['activity', 'My Activity'],
      ['profile', 'My Profile'],
    ];
  return [
    ['dashboard', 'My Dashboard'],
    ['enquiries', 'My Enquiries'],
    ['vehicles', 'Available Vehicles'],
    ['documents', 'My Documents'],
    ['offers', 'Offers'],
    ['activity', 'My Activity'],
    ['profile', 'My Profile'],
  ];
};
function Login() {
  const [form, setForm] = useState({ email: 'super.admin@revelo.test', password: 'ChangeMe123!' });
  const [error, setError] = useState('');
  const go = useNavigate();
  const login = useMutation({
    mutationFn: () => api.post('/auth/login', form),
    onSuccess: ({ data }) => {
      setCsrf(data.csrfToken);
      go('/dashboard');
    },
    onError: (e) => setError(e.response?.data?.error?.message || 'Unable to sign in'),
  });
  return (
    <main className="min-h-screen bg-[#071d36] p-4 sm:p-6 lg:grid lg:h-screen lg:min-h-0 lg:place-items-center lg:overflow-hidden">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1380px] overflow-hidden rounded-[24px] bg-white shadow-2xl lg:h-[calc(100vh-3rem)] lg:min-h-0 lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative hidden min-h-0 overflow-hidden lg:block">
          <img
            src={showroomImage}
            alt="Premium vehicles in a ReVelo showroom"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071d36]/90 via-[#071d36]/15 to-[#071d36]/40" />
          <div className="absolute left-7 top-7 flex items-center gap-3">
            <img src={reveloLogo} alt="ReVelo" className="h-12 w-12 rounded-xl object-contain" />
            <div>
              <p className="text-xl font-extrabold tracking-tight text-white">ReVelo</p>
              <p className="text-xs font-medium text-slate-200">Vehicle lifecycle platform</p>
            </div>
          </div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              Dealer operating system
            </span>
            <h1 className="mt-3 max-w-md text-3xl font-bold leading-tight xl:text-4xl">
              Every vehicle journey, connected.
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-200">
              Acquire, inspect, refurbish and sell with one secure multi-tenant workspace.
            </p>
            <div className="mt-5 flex gap-7 text-xs">
              <span>
                <b className="block text-lg text-white">4</b> secure roles
              </span>
              <span>
                <b className="block text-lg text-white">1</b> connected lifecycle
              </span>
              <span>
                <b className="block text-lg text-white">100%</b> dealer scoped
              </span>
            </div>
          </div>
        </div>
        <div className="flex min-h-0 items-center justify-center overflow-y-auto bg-white p-6 sm:p-8 lg:p-10">
          <form
            className="w-full max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate();
            }}
          >
            <div className="flex items-center gap-3 lg:hidden">
              <img src={reveloLogo} alt="ReVelo" className="h-14 w-14 object-contain" />
              <div>
                <p className="text-xl font-extrabold text-navy">ReVelo</p>
                <p className="text-xs text-slate-500">Vehicle lifecycle platform</p>
              </div>
            </div>
            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-sky">Secure access</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in to your authorised ReVelo workspace.</p>
            </div>
            <label className="label mt-6 block">
              Email address
              <input
                className="field mt-2 h-11"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label className="label mt-4 block">
              Password
              <input
                type="password"
                autoComplete="current-password"
                className="field mt-2 h-11"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-[#071d36] text-sm font-bold text-white shadow-lg shadow-[#071d36]/20 transition hover:bg-[#0d3459] disabled:opacity-60"
              disabled={login.isPending}
            >
              {login.isPending ? 'Signing in…' : 'Sign in securely'}
            </button>
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={16} className="text-[#2278d4]" />
              Protected with secure session authentication
            </div>
            <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
              ReVelo · Multi-tenant dealership operations
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
const parkingPalette = {
  Available: '#32a66c',
  Occupied: '#2278d4',
  Reserved: '#e7a62c',
  Blocked: '#d45151',
  Maintenance: '#7b8796',
};
function ParkingDashboard() {
  const q = useQuery({
    queryKey: ['parking-dashboard-slots'],
    queryFn: () => api.get('/parking/slots', { params: { limit: 100 } }).then((r) => r.data),
    retry: false,
  });
  const slots = q.data?.items || [];
  const counts = slots.reduce((all, slot) => ({ ...all, [slot.status]: (all[slot.status] || 0) + 1 }), {});
  const total = slots.length;
  const available = counts.Available || 0;
  const occupied = counts.Occupied || 0;
  const reserved = counts.Reserved || 0;
  const operational = Math.max(total - (counts.Blocked || 0) - (counts.Maintenance || 0), 0);
  const rate = total ? Math.round(((occupied + reserved) / total) * 100) : 0;
  const chart = ['Available', 'Occupied', 'Reserved', 'Blocked', 'Maintenance']
    .filter((name) => counts[name])
    .map((name) => ({ name, value: counts[name], color: parkingPalette[name] }));
  const zones = Object.values(
    slots.reduce((all, slot) => {
      const zone = slot.zone || 'Unassigned';
      all[zone] = all[zone] || { name: zone, available: 0, occupied: 0, reserved: 0 };
      if (slot.status === 'Available') all[zone].available++;
      if (slot.status === 'Occupied') all[zone].occupied++;
      if (slot.status === 'Reserved') all[zone].reserved++;
      return all;
    }, {})
  );
  if (q.isLoading) return <div className="card p-6 text-slate-500">Loading live yard data…</div>;
  if (q.isError)
    return (
      <div className="card p-6 text-red-600">
        {q.error?.response?.data?.error?.message || 'Unable to load parking data.'}
      </div>
    );
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071d36] via-[#0a3155] to-[#135584] p-6 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-[22px] border-[#b6dd52]/20" />
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#cceb71]">Live yard operations</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Parking command centre</h1>
            <p className="mt-1 text-sm text-slate-200">
              Real-time slot capacity, vehicle locations, and movement readiness.
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs text-slate-200">Current occupancy</p>
            <p className="text-2xl font-bold">
              {rate}% <span className="text-sm font-medium text-slate-200">utilised</span>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total capacity', total, '#071d36'],
          ['Available now', available, parkingPalette.Available],
          ['Vehicles parked', occupied, parkingPalette.Occupied],
          ['Reserved spaces', reserved, parkingPalette.Reserved],
        ].map(([label, value, color]) => (
          <div className="card p-5" key={label}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">{label}</p>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <p className="mt-3 text-3xl font-bold text-navy">{value}</p>
            <p className="mt-1 text-xs text-slate-500">
              {label === 'Total capacity'
                ? `${operational} operational slots`
                : `of ${total} configured slots`}
            </p>
          </div>
        ))}
      </div>
      <section className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Capacity view</p>
              <h2 className="mt-1 text-lg font-bold text-navy">Slot status distribution</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {total} slots
            </span>
          </div>
          {total ? (
            <>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chart}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="57%"
                      outerRadius="82%"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {chart.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} slots`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {chart.map((item) => (
                  <div className="flex items-center justify-between" key={item.name}>
                    <span className="flex items-center gap-2 text-slate-600">
                      <i className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                      {item.name}
                    </span>
                    <b className="text-navy">{item.value}</b>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-10 text-center text-sm text-slate-500">
              Create parking slots to see the live capacity display.
            </p>
          )}
        </div>
        <div className="card p-6">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Zone capacity</p>
          <h2 className="mt-1 text-lg font-bold text-navy">Availability by zone</h2>
          <div className="mt-5 h-64">
            {zones.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zones} barGap={4}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar
                    dataKey="available"
                    name="Available"
                    fill={parkingPalette.Available}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="occupied"
                    name="Occupied"
                    fill={parkingPalette.Occupied}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="reserved"
                    name="Reserved"
                    fill={parkingPalette.Reserved}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="pt-20 text-center text-sm text-slate-500">No zone data available.</p>
            )}
          </div>
        </div>
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Yard map preview</p>
              <h2 className="mt-1 text-lg font-bold text-navy">Live slot board</h2>
            </div>
            <span className="text-xs text-slate-500">Select Yard Map for controls</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {slots.slice(0, 20).map((slot) => (
              <div
                key={slot._id}
                className="rounded-xl border border-slate-200 p-3"
                style={{ borderTopWidth: 4, borderTopColor: parkingPalette[slot.status] }}
              >
                <p className="text-sm font-bold text-navy">{slot.code}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {slot.zone} · Row {slot.row}
                </p>
                <p className="mt-3 text-xs font-semibold" style={{ color: parkingPalette[slot.status] }}>
                  {slot.status}
                </p>
                <p className="mt-1 truncate text-[11px] text-slate-500">
                  {slot.activeVehicle?.registration || slot.activeVehicle?.vehicleCode || '—'}
                </p>
              </div>
            ))}
          </div>
          {slots.length > 20 && (
            <p className="mt-4 text-sm text-slate-500">
              Showing 20 of {slots.length} slots. Open Yard Map for the full layout.
            </p>
          )}
        </div>
        <div className="card p-6">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Operational attention</p>
          <h2 className="mt-1 text-lg font-bold text-navy">Yard alerts</h2>
          <div className="mt-5 space-y-3">
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <b>{reserved}</b> reserved slot{reserved === 1 ? '' : 's'} awaiting arrival.
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <b>{(counts.Blocked || 0) + (counts.Maintenance || 0)}</b> slot
              {(counts.Blocked || 0) + (counts.Maintenance || 0) === 1 ? '' : 's'} unavailable for allocation.
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              <b>{available}</b> spaces are ready for immediate allocation.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
function PlatformDashboard() {
  const dealers = useQuery({
    queryKey: ['platform-dealers'],
    queryFn: () => api.get('/dealers').then((r) => r.data),
    retry: false,
  });
  const activity = useQuery({
    queryKey: ['platform-activity'],
    queryFn: () => api.get('/activity').then((r) => r.data),
    retry: false,
  });
  const list = dealers.data || [];
  const active = list.filter((d) => d.active).length;
  const pending = list.filter((d) => d.onboardingStatus !== 'Active').length;
  return (
    <>
      <PageHero
        eyebrow="SaaS platform command centre"
        title="Platform Dashboard"
        description="Monitor dealership portfolio health, onboarding progress, subscriptions and privileged platform activity."
      >
        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right">
          <p className="text-xs text-slate-200">Portfolio health</p>
          <p className="text-2xl font-bold">{list.length ? Math.round((active / list.length) * 100) : 0}%</p>
        </div>
      </PageHero>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Dealerships', list.length, '#72b7f2'],
          ['Active tenants', active, '#b6dd52'],
          ['Onboarding queue', pending, '#e7a62c'],
          ['Platform activity', (activity.data || []).length, '#a78bfa'],
        ].map(([label, value, color]) => (
          <div className="card p-5" key={label}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">{label}</p>
              <span className="h-3 w-3 rounded-full" style={{ background: color }} />
            </div>
            <p className="mt-3 text-3xl font-bold text-navy">{value}</p>
            <p className="mt-1 text-xs text-slate-500">Live platform scope</p>
          </div>
        ))}
      </div>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Tenant portfolio</p>
              <h2 className="mt-1 text-xl font-bold text-navy">Dealership health</h2>
            </div>
            <span className="rounded-full bg-[#eef7dc] px-3 py-1 text-xs font-semibold text-[#457412]">
              Live status
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {list.length ? (
              list.slice(0, 6).map((d) => (
                <div className="flex items-center justify-between gap-4 px-6 py-4" key={d._id}>
                  <div>
                    <p className="font-semibold text-navy">{d.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {d.code} · {d.subscription?.plan || 'No plan assigned'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`badge ${d.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                    >
                      {d.active ? d.subscription?.status || 'Active' : 'Suspended'}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">{d.onboardingStatus}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-6 py-14 text-center text-sm text-slate-500">
                No dealership tenants are available yet.
              </p>
            )}
          </div>
        </div>
        <div className="card p-6">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Platform pulse</p>
          <h2 className="mt-1 text-xl font-bold text-navy">Operational readiness</h2>
          <div className="mt-7 space-y-6">
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-navy">Active account health</span>
                <b className="text-navy">
                  {active}/{list.length || 0}
                </b>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#32a66c]"
                  style={{ width: `${list.length ? (active / list.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-navy">Onboarding complete</span>
                <b className="text-navy">
                  {Math.max(list.length - pending, 0)}/{list.length || 0}
                </b>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#2278d4]"
                  style={{ width: `${list.length ? ((list.length - pending) / list.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl bg-[#071d36] p-4 text-white">
              <p className="font-bold">Platform oversight</p>
              <p className="mt-2 text-xs leading-5 text-slate-200">
                Provision dealership tenants, review account status and inspect protected platform activity
                from the navigation.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Protected platform trail</p>
          <h2 className="mt-1 text-xl font-bold text-navy">Recent administration activity</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {(activity.data || []).slice(0, 5).map((event) => (
            <div className="flex gap-3 px-6 py-4" key={event._id}>
              <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#2278d4]" />
              <div>
                <p className="text-sm font-semibold text-navy">
                  {event.action} <span className="font-normal text-slate-500">· {event.entity}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {event.actorName || 'Platform system'} ·{' '}
                  {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Recently'}
                </p>
              </div>
            </div>
          ))}
          {!(activity.data || []).length && (
            <p className="px-6 py-12 text-center text-sm text-slate-500">No platform events recorded yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
function Dashboard({ user }) {
  const q = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
    enabled: user.operationalProfile !== 'Parking Manager' && user.role !== 'Super Admin',
  });
  if (user.role === 'Super Admin') return <PlatformDashboard />;
  if (user.operationalProfile === 'Parking Manager') return <ParkingDashboard />;
  const d = q.data || {};
  const totalSlots = (d.slots || []).reduce((sum, item) => sum + item.count, 0);
  const occupied = (d.slots || [])
    .filter((x) => x._id === 'Occupied' || x._id === 'Reserved')
    .reduce((sum, x) => sum + x.count, 0);
  const readiness = d.vehicles
    ? Math.round((((d.readyForSale || 0) + (d.completedSales || 0)) / d.vehicles) * 100)
    : 0;
  const cards = [
    ['Fleet in scope', d.vehicles || 0, 'All active vehicle records', CarFront, 'blue'],
    [
      'Action required',
      (d.awaitingInspection || 0) + (d.pendingDocuments || 0),
      `${d.awaitingInspection || 0} inspections waiting`,
      AlertTriangle,
      'amber',
    ],
    [
      'Workshop queue',
      d.workInProgress || 0,
      `${d.awaitingQa || 0} quality checks pending`,
      Wrench,
      'violet',
    ],
    [
      'Sales-ready',
      d.readyForSale || 0,
      `${d.activeBuyerEnquiries || 0} active buyer leads`,
      CheckCircle2,
      'green',
    ],
  ];
  const lifecycle = (d.lifecycleBreakdown || [])
    .map((item) => ({ name: item._id || 'Unassigned', value: item.count }))
    .sort((a, b) => b.value - a.value);
  const pipeline = [
    { name: 'Enquiries', value: (d.newSellerEnquiries || 0) + (d.activeBuyerEnquiries || 0) },
    { name: 'Inspect', value: d.awaitingInspection || 0 },
    { name: 'Repair', value: d.workInProgress || 0 },
    { name: 'Ready', value: d.readyForSale || 0 },
    { name: 'Sold', value: d.completedSales || 0 },
  ];
  return (
    <>
      <PageHero
        eyebrow="Dealership command centre"
        title="Dealership overview"
        description={`A real-time view of stock, teams and commercial activity at ${user.dealership?.name || 'your authorised dealership'}.`}
      >
        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right backdrop-blur">
          <p className="text-xs text-slate-200">Readiness score</p>
          <p className="mt-1 flex items-center justify-end gap-1 text-2xl font-bold">
            <TrendingUp size={18} className="text-[#b6dd52]" />
            {readiness}%
          </p>
        </div>
      </PageHero>
      {q.isLoading && (
        <div className="card mt-6 p-6 text-sm text-slate-500">Loading your dealership overview…</div>
      )}
      {q.isError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Unable to load the dealership overview. Please refresh and try again.
        </div>
      )}
      {!q.isLoading && !q.isError && (
        <>
          <div className="dashboard-metrics mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(([label, value, detail, Icon, tone]) => (
              <div className={`metric-card card p-5 dashboard-${tone}`} key={label}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-navy">{value}</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-sky">
                    <Icon size={20} />
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">{detail}</p>
              </div>
            ))}
          </div>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.22fr_.78fr]">
            <div className="chart-card card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Vehicle journey</p>
                  <h2 className="mt-1 text-xl font-bold text-navy">Lifecycle distribution</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Where every vehicle currently sits in your operation.
                  </p>
                </div>
                <span className="chart-total">{d.vehicles || 0} vehicles</span>
              </div>
              <div className="mt-5 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lifecycle} margin={{ top: 8, right: 4, left: -20, bottom: 8 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#68788a' }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-18}
                      textAnchor="end"
                      height={55}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#68788a' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip cursor={{ fill: '#f1f7fc' }} />
                    <Bar dataKey="value" fill="#2278d4" radius={[6, 6, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card p-6">
              <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Yard capacity</p>
              <h2 className="mt-1 text-xl font-bold text-navy">Space at a glance</h2>
              <div className="mt-6 flex items-center gap-5">
                <div className="relative h-28 w-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'In use', value: occupied },
                          { name: 'Available', value: Math.max(totalSlots - occupied, 0) },
                        ]}
                        dataKey="value"
                        innerRadius={35}
                        outerRadius={51}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        <Cell fill="#2278d4" />
                        <Cell fill="#dcecf9" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <b className="text-xl text-navy">
                      {totalSlots ? Math.round((occupied / totalSlots) * 100) : 0}%
                    </b>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">
                    {occupied} of {totalSlots} spaces in use
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Includes occupied and reserved parking bays.
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {(d.slots || []).map((slot) => (
                  <div className="flex items-center justify-between text-sm" key={slot._id}>
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="h-2 w-2 rounded-full bg-sky" />
                      {slot._id}
                    </span>
                    <b className="text-navy">{slot.count}</b>
                  </div>
                ))}
              </div>
              <Link
                to="/parking"
                className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-sky hover:text-blue-800"
              >
                Open yard map <ArrowUpRight size={15} />
              </Link>
            </div>
          </section>
          <section className="mt-6 grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
            <div className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Operational pulse</p>
                  <h2 className="mt-1 text-xl font-bold text-navy">Pipeline health</h2>
                </div>
                <CircleDot size={20} className="text-[#32a66c]" />
              </div>
              <div className="mt-6 space-y-5">
                {pipeline.map((step, index) => (
                  <div key={step.name}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-600">{step.name}</span>
                      <b className="text-navy">{step.value}</b>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2278d4] to-[#72b7f2]"
                        style={{
                          width: `${Math.min(100, d.vehicles ? Math.max(8, (step.value / d.vehicles) * 100) : 0)}%`,
                        }}
                      />
                    </div>
                    {index < pipeline.length - 1 && null}
                  </div>
                ))}
              </div>
            </div>
            <div className="card overflow-hidden">
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Attention queue</p>
                  <h2 className="mt-1 text-xl font-bold text-navy">Active work orders</h2>
                </div>
                <Link to="/work-orders" className="text-sm font-bold text-sky hover:text-blue-800">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {(d.openWorkOrders || []).length ? (
                  d.openWorkOrders.map((order) => (
                    <div className="flex items-center justify-between gap-3 px-6 py-4" key={order._id}>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy">{order.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.workOrderCode} ·{' '}
                          {order.vehicle?.registration || order.vehicle?.vehicleCode || 'Vehicle pending'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="badge bg-amber-50 text-amber-700">{order.status}</span>
                        <p className="mt-1 text-[11px] text-slate-400">{order.priority} priority</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-6 py-12 text-center text-sm text-slate-500">
                    No active workshop work. Your queue is clear.
                  </p>
                )}
              </div>
            </div>
          </section>
          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Team online</p>
              <p className="mt-2 text-2xl font-bold text-navy">{d.activeEmployees || 0}</p>
              <p className="mt-1 text-xs text-slate-500">Active dealership users</p>
            </div>
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">
                Commercial outcomes
              </p>
              <p className="mt-2 text-2xl font-bold text-navy">{d.completedSales || 0} closed</p>
              <p className="mt-1 text-xs text-slate-500">{d.completedPurchases || 0} acquired into stock</p>
            </div>
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Realised profit</p>
              <p className="mt-2 text-2xl font-bold text-navy">
                ₹{Number(d.realisedProfit || 0).toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-xs text-slate-500">Across closed sales</p>
            </div>
          </section>
          <section className="card mt-6 overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Dealer activity</p>
                <h2 className="mt-1 text-xl font-bold text-navy">Latest operational events</h2>
              </div>
              <Link to="/activity" className="text-sm font-bold text-sky hover:text-blue-800">
                Audit trail
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {(d.recentActivity || []).length ? (
                d.recentActivity.map((event) => (
                  <div className="flex gap-3 px-6 py-4" key={event._id}>
                    <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-sky">
                      <Clock3 size={15} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {event.action} <span className="font-normal text-slate-500">· {event.entity}</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {event.actorName || 'Dealership team'} ·{' '}
                        {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-6 py-12 text-center text-sm text-slate-500">
                  Operational activity will appear here as your team works.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
function Dealers() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    address: '',
    city: '',
    plan: 'Starter',
    maxUsers: 10,
    maxVehicles: 250,
    adminName: '',
    adminEmail: '',
  });
  const q = useQuery({ queryKey: ['dealers'], queryFn: () => api.get('/dealers').then((r) => r.data) });
  const create = useMutation({
    mutationFn: () =>
      api.post('/dealers', {
        name: form.name,
        code: form.code,
        contact: { name: form.contactName, email: form.contactEmail, phone: form.phone },
        address: { line1: form.address, city: form.city },
        subscription: {
          plan: form.plan,
          maxUsers: Number(form.maxUsers),
          maxVehicles: Number(form.maxVehicles),
        },
        admin: { name: form.adminName, email: form.adminEmail },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealers'] });
      setForm({
        name: '',
        code: '',
        contactName: '',
        contactEmail: '',
        phone: '',
        address: '',
        city: '',
        plan: 'Starter',
        maxUsers: 10,
        maxVehicles: 250,
        adminName: '',
        adminEmail: '',
      });
      setShow(false);
    },
  });
  const edit = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/dealers/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealers'] });
      setEditing(null);
    },
  });
  const setStatus = useMutation({
    mutationFn: ({ id, active }) => api.patch(`/dealers/${id}/status`, { active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealers'] });
      qc.invalidateQueries({ queryKey: ['admin-dealers'] });
      qc.invalidateQueries({ queryKey: ['platform-admin-users'] });
    },
  });
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/dealers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dealers'] }),
  });
  const beginEdit = (dealer) => {
    setEditing({
      id: dealer._id,
      name: dealer.name || '',
      code: dealer.code || '',
      contactName: dealer.contact?.name || '',
      contactEmail: dealer.contact?.email || '',
      phone: dealer.contact?.phone || '',
      address: dealer.address?.line1 || '',
      city: dealer.address?.city || '',
      plan: dealer.subscription?.plan || 'Starter',
      maxUsers: dealer.subscription?.maxUsers ?? 10,
      maxVehicles: dealer.subscription?.maxVehicles ?? 250,
    });
  };
  const saveEdit = (event) => {
    event.preventDefault();
    edit.mutate({
      id: editing.id,
      payload: {
        name: editing.name,
        code: editing.code,
        contact: {
          name: editing.contactName,
          email: editing.contactEmail,
          phone: editing.phone,
        },
        address: { line1: editing.address, city: editing.city },
        subscription: {
          plan: editing.plan,
          maxUsers: Number(editing.maxUsers),
          maxVehicles: Number(editing.maxVehicles),
        },
      },
    });
  };
  const dealers = q.data || [];
  const activeCount = dealers.filter((dealer) => dealer.active).length;
  const onboardingCount = dealers.filter((dealer) => dealer.onboardingStatus !== 'Active').length;
  const enterpriseCount = dealers.filter((dealer) => dealer.subscription?.plan === 'Enterprise').length;
  return (
    <>
      <PageHero
        eyebrow="Platform administration"
        title="Dealerships"
        description="Provision secure dealership workspaces, manage subscription capacity, and track onboarding."
      >
        <button className="btn-primary" onClick={() => setShow((visible) => !visible)}>
          <Plus size={16} />
          {show ? 'Close form' : 'Create dealership'}
        </button>
      </PageHero>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total dealerships', dealers.length, '#2278d4'],
          ['Active tenants', activeCount, '#32a66c'],
          ['Onboarding', onboardingCount, '#e7a62c'],
          ['Enterprise plans', enterpriseCount, '#8b5cf6'],
        ].map(([label, value, color]) => (
          <div className="card p-5" key={label}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">{label}</p>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <p className="mt-3 text-3xl font-bold text-navy">{q.isLoading ? '—' : value}</p>
            <p className="mt-1 text-xs text-slate-500">Platform portfolio</p>
          </div>
        ))}
      </div>
      {show && (
        <form
          className="card mt-6 grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="md:col-span-2 xl:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">New tenant</p>
            <h2 className="mt-1 text-xl font-bold text-navy">Create dealership workspace</h2>
            <p className="mt-1 text-sm text-slate-500">
              Set up the dealership, subscription limits, and its first administrator.
            </p>
          </div>
          {[
            ['name', 'Dealership name', 'text'],
            ['code', 'Unique dealer code', 'text'],
            ['contactName', 'Primary contact name', 'text'],
            ['contactEmail', 'Contact email', 'email'],
            ['phone', 'Contact phone', 'tel'],
            ['address', 'Address', 'text'],
            ['city', 'City', 'text'],
            ['adminName', 'First admin name', 'text'],
            ['adminEmail', 'First admin email', 'email'],
          ].map(([k, l, type]) => (
            <label className="label" key={k}>
              {l}
              <input
                required
                type={type}
                className="field mt-2"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </label>
          ))}
          <label className="label">
            Plan
            <select
              className="field mt-2"
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
            >
              <option>Starter</option>
              <option>Growth</option>
              <option>Enterprise</option>
            </select>
          </label>
          {[
            ['maxUsers', 'User limit'],
            ['maxVehicles', 'Vehicle limit'],
          ].map(([key, label]) => (
            <label className="label" key={key}>
              {label}
              <input
                className="field mt-2"
                type="number"
                min="1"
                required
                value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
            </label>
          ))}
          {create.error && (
            <p className="text-sm text-red-700 md:col-span-2 xl:col-span-3">
              {create.error.response?.data?.error?.message || 'Unable to create dealership.'}
            </p>
          )}
          <div className="flex gap-3 md:col-span-2 xl:col-span-3">
            <button className="btn-primary" disabled={create.isPending}>
              {create.isPending ? 'Provisioning…' : 'Provision dealership'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShow(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <section className="card mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-navy">Dealership portfolio</h2>
            <p className="mt-1 text-xs text-slate-500">
              Tenant status, subscription plan, and onboarding progress
            </p>
          </div>
          <span className="rounded-full bg-[#eef7dc] px-3 py-1 text-xs font-semibold text-[#457412]">
            {q.isLoading ? 'Loading…' : `${dealers.length} tenants`}
          </span>
        </div>
        {(setStatus.error || remove.error) && (
          <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {(setStatus.error || remove.error).response?.data?.error?.message ||
              'Unable to update dealership.'}
          </p>
        )}
        {q.isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading dealership portfolio…</p>
        ) : q.isError ? (
          <p className="p-6 text-sm text-red-700">
            {q.error?.response?.data?.error?.message || 'Unable to load dealerships.'}
          </p>
        ) : dealers.length ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Dealership</th>
                  <th>Primary contact</th>
                  <th>Subscription</th>
                  <th>Capacity</th>
                  <th>Onboarding</th>
                  <th>Tenant status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dealers.map((dealer) => (
                  <tr key={dealer._id}>
                    <td>
                      <b className="text-navy">{dealer.name}</b>
                      <p className="mt-1 text-xs text-slate-500">{dealer.code}</p>
                    </td>
                    <td>
                      <p>{dealer.contact?.name || '—'}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {dealer.contact?.email || dealer.contact?.phone || 'No contact details'}
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-blue-50 text-blue-700">
                        {dealer.subscription?.plan || 'Starter'}
                      </span>
                    </td>
                    <td>
                      <p>{dealer.subscription?.maxUsers ?? 0} users</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {dealer.subscription?.maxVehicles ?? 0} vehicles
                      </p>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          dealer.onboardingStatus === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {dealer.onboardingStatus || 'Draft'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(dealer.active)}
                        aria-label={`${dealer.active ? 'Deactivate' : 'Activate'} ${dealer.name}`}
                        disabled={setStatus.isPending}
                        onClick={() => {
                          const active = !dealer.active;
                          if (
                            !active &&
                            !window.confirm(
                              `Deactivate ${dealer.name}? This will also deactivate its admin and employee accounts.`
                            )
                          ) return;
                          setStatus.mutate({ id: dealer._id, active });
                        }}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                          dealer.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <span
                          className={`relative h-5 w-9 rounded-full transition ${
                            dealer.active ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                              dealer.active ? 'left-4' : 'left-0.5'
                            }`}
                          />
                        </span>
                        {dealer.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit dealership"
                          aria-label={`Edit ${dealer.name}`}
                          onClick={() => beginEdit(dealer)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          title="Delete dealership"
                          aria-label={`Delete ${dealer.name}`}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete ${dealer.name}? Dealerships with users or operational records cannot be deleted.`
                              )
                            ) remove.mutate(dealer._id);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-10 text-center text-sm text-slate-500">
            No dealerships have been provisioned yet.
          </p>
        )}
      </section>
      {editing &&
        createPortal(
          <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/60 p-4">
            <form
              className="card my-auto grid w-full max-w-3xl gap-4 p-6 sm:grid-cols-2"
              onSubmit={saveEdit}
            >
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">
                  Dealership settings
                </p>
                <h2 className="mt-1 text-xl font-bold text-navy">Edit dealership</h2>
              </div>
              {[
                ['name', 'Dealership name', 'text'],
                ['code', 'Dealer code', 'text'],
                ['contactName', 'Primary contact name', 'text'],
                ['contactEmail', 'Contact email', 'email'],
                ['phone', 'Contact phone', 'tel'],
                ['address', 'Address', 'text'],
                ['city', 'City', 'text'],
                ['maxUsers', 'User limit', 'number'],
                ['maxVehicles', 'Vehicle limit', 'number'],
              ].map(([key, label, type]) => (
                <label className="label" key={key}>
                  {label}
                  <input
                    className="field mt-2"
                    type={type}
                    min={type === 'number' ? 1 : undefined}
                    required
                    value={editing[key]}
                    onChange={(event) =>
                      setEditing({ ...editing, [key]: event.target.value })
                    }
                  />
                </label>
              ))}
              <label className="label">
                Plan
                <select
                  className="field mt-2"
                  value={editing.plan}
                  onChange={(event) => setEditing({ ...editing, plan: event.target.value })}
                >
                  <option>Starter</option>
                  <option>Growth</option>
                  <option>Enterprise</option>
                </select>
              </label>
              {edit.error && (
                <p className="text-sm text-red-700 sm:col-span-2">
                  {edit.error.response?.data?.error?.message || 'Unable to update dealership.'}
                </p>
              )}
              <div className="flex gap-3 sm:col-span-2">
                <button className="btn-primary" disabled={edit.isPending}>
                  {edit.isPending ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </>
  );
}
const display = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object')
    return value.registration || value.name || value.vehicleCode || value.code || '—';
  if (/^\d{4}-\d{2}-\d{2}T/.test(String(value))) return new Date(value).toLocaleString();
  return String(value);
};
function AdminManagement() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', dealership: '' });
  const dealers = useQuery({
    queryKey: ['admin-dealers'],
    queryFn: () => api.get('/dealers').then((r) => r.data),
    retry: false,
  });
  const admins = useQuery({
    queryKey: ['platform-admin-users'],
    queryFn: () => api.get('/users').then((r) => r.data),
    retry: false,
  });
  const create = useMutation({
    mutationFn: () => api.post('/users', { ...form, role: 'Dealer Admin' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-admin-users'] });
      setShow(false);
      setForm({ name: '', email: '', phone: '', password: '', dealership: '' });
    },
  });
  const edit = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/users/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-admin-users'] });
      setEditing(null);
    },
  });
  const setStatus = useMutation({
    mutationFn: ({ id, active }) => api.patch(`/users/${id}`, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-admin-users'] }),
  });
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-admin-users'] }),
  });
  const dealerName = (id) => dealers.data?.find((d) => d._id === id)?.name || 'Unassigned';
  const items = (admins.data || []).filter((user) => user.role === 'Dealer Admin');
  return (
    <>
      <PageHero
        eyebrow="Platform access management"
        title="Dealer Admins"
        description="Provision secure dealership administrator accounts. Each admin is linked to one selected active dealership and receives access only to that tenant."
      >
        <button
          className="rounded-xl bg-[#b6dd52] px-4 py-3 text-sm font-bold text-[#071d36] shadow-lg transition hover:bg-[#c8e878]"
          onClick={() => setShow(!show)}
        >
          {show ? 'Close provisioning' : 'Provision Dealer Admin'}
        </button>
      </PageHero>
      {show && (
        <form
          className="card mt-6 grid gap-4 p-6 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate();
          }}
        >
          <div className="md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">New administrator</p>
            <h2 className="mt-1 text-xl font-bold text-navy">Assign credentials to a dealership</h2>
            <p className="mt-1 text-sm text-slate-500">
              The selected dealership is set by the server and cannot be changed by the new administrator.
            </p>
          </div>
          {[
            ['name', 'Full name', 'text'],
            ['email', 'Work email', 'email'],
            ['phone', 'Phone', 'tel'],
            ['password', 'Temporary password', 'password'],
          ].map(([key, label, type]) => (
            <label className="label" key={key}>
              {label}
              <input
                className="field mt-2"
                type={type}
                required={key !== 'phone'}
                minLength={key === 'password' ? 12 : undefined}
                value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
            </label>
          ))}
          <label className="label">
            Dealership
            <select
              className="field mt-2"
              required
              value={form.dealership}
              onChange={(event) => setForm({ ...form, dealership: event.target.value })}
            >
              <option value="">Select an active dealership</option>
              {dealers.data
                ?.filter((dealer) => dealer.active)
                .map((dealer) => (
                  <option key={dealer._id} value={dealer._id}>
                    {dealer.name} · {dealer.code}
                  </option>
                ))}
            </select>
          </label>
          <div className="md:col-span-2 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Passwords are hashed before persistence. The account can be deactivated or sessions revoked
              later.
            </p>
            <button className="btn-primary" disabled={create.isPending}>
              {create.isPending ? 'Provisioning…' : 'Create Dealer Admin'}
            </button>
          </div>
          {create.error && (
            <p className="md:col-span-2 text-sm text-red-600">
              {create.error.response?.data?.error?.message}
            </p>
          )}
        </form>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Dealer Admins</p>
          <p className="mt-2 text-3xl font-bold text-navy">{items.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Active accounts</p>
          <p className="mt-2 text-3xl font-bold text-navy">{items.filter((user) => user.active).length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Covered dealerships</p>
          <p className="mt-2 text-3xl font-bold text-navy">
            {new Set(items.map((user) => user.dealership)).size}
          </p>
        </div>
      </div>
      <div className="card mt-6 overflow-auto">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">
            Authorised tenant leadership
          </p>
          <h2 className="mt-1 text-xl font-bold text-navy">Dealer Admin registry</h2>
        </div>
        {(setStatus.error || remove.error) && (
          <p className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
            {(setStatus.error || remove.error).response?.data?.error?.message ||
              'Unable to update Dealer Admin.'}
          </p>
        )}
        <table className="table">
          <thead>
            <tr>
              <th>Administrator</th>
              <th>Dealership</th>
              <th>Contact</th>
              <th>Account status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((user) => (
                <tr key={user._id}>
                  <td>
                    <b>{user.name}</b>
                    <p className="mt-1 text-xs text-slate-500">Dealer Admin</p>
                  </td>
                  <td>{dealerName(user.dealership)}</td>
                  <td>
                    {user.email}
                    <p className="mt-1 text-xs text-slate-500">{user.phone || 'No phone provided'}</p>
                  </td>
                  <td>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(user.active)}
                      aria-label={`${user.active ? 'Deactivate' : 'Activate'} ${user.name}`}
                      disabled={
                        setStatus.isPending ||
                        (!user.active &&
                          !dealers.data?.find((dealer) => dealer._id === user.dealership)?.active)
                      }
                      title={
                        !user.active &&
                        !dealers.data?.find((dealer) => dealer._id === user.dealership)?.active
                          ? 'Activate the dealership before this admin account'
                          : undefined
                      }
                      onClick={() => {
                        const active = !user.active;
                        if (
                          !active &&
                          !window.confirm(`Deactivate ${user.name}'s Dealer Admin account?`)
                        ) return;
                        setStatus.mutate({ id: user._id, active });
                      }}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        user.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <span
                        className={`relative h-5 w-9 rounded-full transition ${
                          user.active ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                            user.active ? 'left-4' : 'left-0.5'
                          }`}
                        />
                      </span>
                      {user.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="icon-btn"
                        title="Edit Dealer Admin"
                        aria-label={`Edit ${user.name}`}
                        onClick={() =>
                          setEditing({
                            id: user._id,
                            name: user.name || '',
                            email: user.email || '',
                            phone: user.phone || '',
                          })
                        }
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        title="Delete Dealer Admin"
                        aria-label={`Delete ${user.name}`}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete ${user.name}'s Dealer Admin account? They will no longer be able to sign in.`
                            )
                          ) remove.mutate(user._id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-14 text-center text-slate-500">
                  No Dealer Admin accounts provisioned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editing &&
        createPortal(
          <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/60 p-4">
            <form
              className="card my-auto grid w-full max-w-xl gap-4 p-6 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                edit.mutate({
                  id: editing.id,
                  payload: {
                    name: editing.name,
                    email: editing.email,
                    phone: editing.phone,
                  },
                });
              }}
            >
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">
                  Platform access management
                </p>
                <h2 className="mt-1 text-xl font-bold text-navy">Edit Dealer Admin</h2>
              </div>
              {[
                ['name', 'Full name', 'text'],
                ['email', 'Work email', 'email'],
                ['phone', 'Phone', 'tel'],
              ].map(([key, label, type]) => (
                <label className="label" key={key}>
                  {label}
                  <input
                    className="field mt-2"
                    type={type}
                    required={key !== 'phone'}
                    value={editing[key]}
                    onChange={(event) =>
                      setEditing({ ...editing, [key]: event.target.value })
                    }
                  />
                </label>
              ))}
              {edit.error && (
                <p className="text-sm text-red-700 sm:col-span-2">
                  {edit.error.response?.data?.error?.message || 'Unable to update Dealer Admin.'}
                </p>
              )}
              <div className="flex gap-3 sm:col-span-2">
                <button className="btn-primary" disabled={edit.isPending}>
                  {edit.isPending ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </>
  );
}
function AdminGate() {
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
function PageHero({ eyebrow = 'ReVelo workspace', title, description, children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071d36] via-[#0a3155] to-[#135584] px-6 py-6 text-white shadow-xl md:px-7">
      <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border-[20px] border-[#b6dd52]/15" />
      <div className="absolute right-28 top-8 h-2 w-20 rounded-full bg-[#b6dd52]/50" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#cceb71]">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">{description}</p>
        </div>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
const recordColumns = {
  enquiries: [
    ['enquiryCode', 'Enquiry'],
    ['type', 'Type'],
    ['person', 'Customer'],
    ['vehicle', 'Vehicle'],
    ['status', 'Status'],
    ['createdAt', 'Received'],
  ],
  vehicles: [
    ['vehicleCode', 'Vehicle ID'],
    ['registration', 'Registration'],
    ['make', 'Make'],
    ['model', 'Model'],
    ['lifecycle', 'Lifecycle'],
    ['currentLocation', 'Location'],
  ],
  inspections: [
    ['kind', 'Inspection'],
    ['vehicle', 'Vehicle'],
    ['assignedTo', 'Assigned to'],
    ['status', 'Status'],
    ['dueDate', 'Due date'],
  ],
  'parking/slots': [
    ['code', 'Slot'],
    ['zone', 'Zone'],
    ['row', 'Row'],
    ['type', 'Type'],
    ['status', 'Status'],
    ['activeVehicle', 'Vehicle'],
  ],
  'work-orders': [
    ['workOrderCode', 'Work order'],
    ['title', 'Repair'],
    ['vehicle', 'Vehicle'],
    ['assignedTo', 'Assigned to'],
    ['priority', 'Priority'],
    ['status', 'Status'],
  ],
  documents: [
    ['category', 'Document'],
    ['originalName', 'File'],
    ['vehicle', 'Vehicle'],
    ['status', 'Verification'],
    ['submittedAt', 'Submitted'],
  ],
  sales: [
    ['vehicle', 'Vehicle'],
    ['status', 'Status'],
    ['agreedPrice', 'Agreed price'],
    ['reservedUntil', 'Reserved until'],
  ],
  users: [
    ['name', 'Employee'],
    ['email', 'Email'],
    ['role', 'Primary role'],
    ['operationalProfile', 'Operational profile'],
    ['active', 'Account'],
  ],
};
const quickAdd = {
  users: {
    label: 'Add employee',
    fields: [
      ['name', 'Full name'],
      ['email', 'Work email', 'email'],
      ['password', 'Login password', 'password'],
      ['operationalProfile', 'Employee type', 'employee-type'],
    ],
  },
  vehicles: {
    label: 'Add vehicle',
    fields: [
      ['registration', 'Registration'],
      ['make', 'Make'],
      ['model', 'Model'],
      ['year', 'Year', 'number'],
    ],
  },
  'parking/slots': {
    label: 'Add parking space',
    fields: [
      ['code', 'Space code'],
      ['zone', 'Zone'],
      ['row', 'Row'],
      ['number', 'Space number', 'number'],
      ['type', 'Space type', 'select:parking|inspection|road-test|workshop|delivery'],
      ['status', 'Status', 'select:Available|Reserved|Occupied|Blocked|Maintenance'],
      ['vehicle', 'Vehicle registration', 'vehicle-select'],
    ],
  },
  'work-orders': {
    label: 'Add refurbishment',
    fields: [
      ['vehicle', 'Vehicle registration'],
      ['title', 'Repair title'],
      ['priority', 'Priority', 'select:Low|Medium|High|Critical'],
    ],
  },
  inspections: {
    label: 'Add inspection',
    fields: [
      ['vehicle', 'Vehicle ID'],
      ['assignedTo', 'Employee ID'],
      ['kind', 'Inspection type', 'select:mechanical|structural'],
      ['dueDate', 'Due date & time', 'datetime-local'],
    ],
  },
  enquiries: {
    label: 'Add seller enquiry',
    fields: [
      ['sellerName', 'Seller name'],
      ['registration', 'Vehicle registration'],
      ['make', 'Make'],
      ['model', 'Model'],
      ['askingPrice', 'Asking price', 'number'],
    ],
  },
  sales: {
    label: 'Add sale',
    fields: [
      ['vehicle', 'Vehicle ID'],
      ['targetPrice', 'Target price', 'number'],
    ],
  },
};
function QuickAdd({ endpoint, close, initialValues = {} }) {
  const spec = quickAdd[endpoint];
  const qc = useQueryClient();
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      spec.fields.map(([key]) => [
        key,
        initialValues[key] ?? (endpoint === 'parking/slots' && key === 'status' ? 'Available' : ''),
      ])
    )
  );
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const needsVehicles = ['inspections', 'enquiries', 'work-orders', 'parking/slots'].includes(endpoint);
  const vehicles = useQuery({
    queryKey: ['quick-add-vehicles'],
    queryFn: () => api.get('/vehicles', { params: { limit: 100 } }).then((r) => r.data),
    enabled: needsVehicles,
    retry: false,
  });
  const employees = useQuery({
    queryKey: ['quick-add-employees'],
    queryFn: () => api.get('/users').then((r) => r.data),
    enabled: endpoint === 'inspections',
    retry: false,
  });
  const vehicleRows = vehicles.data?.items || [];
  const employeeRows = employees.data || [];
  const save = useMutation({
    mutationFn: () => {
      const body = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''));
      if (endpoint === 'users') return api.post('/users', { ...body, role: 'Technician & Service Advisor' });
      if (endpoint === 'enquiries')
        return api.post('/enquiries', {
          seller: { name: values.sellerName },
          vehicle: {
            registration: values.registration || undefined,
            make: values.make || undefined,
            model: values.model || undefined,
          },
          askingPrice: values.askingPrice || undefined,
        });
      return api.post(`/${endpoint}`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [endpoint] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      close();
    },
    onError: (e) => setError(e.response?.data?.error?.message || 'Unable to save this record.'),
  });
  return (
    <div className="card mt-6 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">New operational record</p>
          <h2 className="mt-1 text-xl font-bold text-navy">{spec.label}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose existing dealership records where available, or enter new details.
          </p>
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close">
          <X size={17} />
        </button>
      </div>
      <form
        className="mt-5 grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          save.mutate();
        }}
      >
        {needsVehicles && endpoint !== 'parking/slots' && (
          <label className="label">
            Vehicle registration
            {vehicles.isLoading ? (
              <span className="ml-2 font-normal text-slate-400">Loading vehicles…</span>
            ) : null}
            <select
              className="field mt-2"
              required={endpoint !== 'enquiries'}
              value={selectedVehicle}
              onChange={(e) => {
                const selected = vehicleRows.find((vehicle) => vehicle._id === e.target.value);
                setSelectedVehicle(e.target.value);
                if (endpoint === 'inspections' || endpoint === 'work-orders')
                  setValues({ ...values, vehicle: e.target.value });
                else
                  setValues({
                    ...values,
                    registration: selected?.registration || '',
                    make: selected?.make || '',
                    model: selected?.model || '',
                  });
              }}
            >
              <option value="">
                {endpoint === 'enquiries'
                  ? 'New vehicle / enter details below'
                  : 'Select a vehicle registration'}
              </option>
              {vehicleRows.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.registration || 'No registration'} ·{' '}
                  {[vehicle.make, vehicle.model].filter(Boolean).join(' ') || vehicle.vehicleCode}
                </option>
              ))}
            </select>
          </label>
        )}
        {endpoint === 'inspections' && (
          <label className="label">
            Employee
            <select
              required
              className="field mt-2"
              value={values.assignedTo}
              onChange={(e) => setValues({ ...values, assignedTo: e.target.value })}
            >
              <option value="">Select an employee</option>
              {employeeRows
                .filter((employee) => employee.active)
                .map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} · {employee.operationalProfile || employee.role} ({employee._id.slice(-6)}
                    )
                  </option>
                ))}
            </select>
          </label>
        )}
        {spec.fields
          .filter(
            ([key]) =>
              !(
                (endpoint === 'inspections' && (key === 'vehicle' || key === 'assignedTo')) ||
                (endpoint === 'work-orders' && key === 'vehicle') ||
                (endpoint === 'parking/slots' &&
                  key === 'vehicle' &&
                  !['Reserved', 'Occupied'].includes(values.status))
              )
          )
          .map(([key, label, type = 'text']) => (
            <label className="label" key={key}>
              {label}
              {type === 'vehicle-select' ? (
                <select
                  className="field mt-2"
                  required={['Reserved', 'Occupied'].includes(values.status)}
                  value={values.vehicle}
                  onChange={(event) => setValues({ ...values, vehicle: event.target.value })}
                  disabled={vehicles.isLoading || !vehicleRows.length}
                >
                  <option value="">
                    {vehicles.isLoading
                      ? 'Loading vehicles…'
                      : vehicleRows.length
                        ? 'Select vehicle registration'
                        : 'No vehicles available'}
                  </option>
                  {vehicleRows.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.registration || 'No registration'} ·{' '}
                      {[vehicle.make, vehicle.model].filter(Boolean).join(' ') || vehicle.vehicleCode}
                    </option>
                  ))}
                </select>
              ) : type === 'employee-type' ? (
                <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label={label}>
                  {[
                    'Service Advisor',
                    'Senior Technician / Vehicle Inspector',
                    'Parking Manager',
                    'Refurbishment Technician',
                  ].map((profile) => (
                    <button
                      type="button"
                      key={profile}
                      aria-pressed={values[key] === profile}
                      className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
                        values[key] === profile
                          ? 'border-sky bg-sky/10 text-sky shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-sky/50'
                      }`}
                      onClick={() => setValues({ ...values, [key]: profile })}
                    >
                      {profile}
                    </button>
                  ))}
                </div>
              ) : type.startsWith('select:') ? (
                <select
                  className="field mt-2"
                  required
                  value={values[key]}
                  onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                >
                  <option value="">Select…</option>
                  {type
                    .slice(7)
                    .split('|')
                    .map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                </select>
              ) : (
                <>
                  <input
                    className="field mt-2"
                    type={type}
                    required={
                      key === 'password' ||
                      [
                        'name',
                        'email',
                        'registration',
                        'make',
                        'model',
                        'code',
                        'zone',
                        'row',
                        'vehicle',
                        'title',
                        'assignedTo',
                        'kind',
                        'sellerName',
                      ].includes(key)
                    }
                    minLength={key === 'password' ? 12 : undefined}
                    value={values[key]}
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                  />
                  {key === 'password' && (
                    <span className="mt-1 block text-xs font-normal text-slate-500">
                      Use at least 12 characters. The employee can sign in with this email and password.
                    </span>
                  )}
                </>
              )}
            </label>
          ))}
        <div className="flex items-end gap-3">
          <button
            className="btn-primary"
            disabled={save.isPending || (endpoint === 'users' && !values.operationalProfile)}
          >
            {save.isPending ? 'Saving…' : spec.label}
          </button>
          <button type="button" className="btn-secondary" onClick={close}>
            Cancel
          </button>
        </div>
        {error && <p className="self-end text-sm text-red-700">{error}</p>}
        {vehicles.isError && needsVehicles && (
          <p className="self-end text-sm text-red-700">
            {vehicles.error?.response?.data?.error?.message || 'Unable to load vehicle registrations.'}
          </p>
        )}
      </form>
    </div>
  );
}
function DocumentUploadForm({ close }) {
  const qc = useQueryClient();
  const [vehicle, setVehicle] = useState('');
  const [category, setCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const vehicles = useQuery({
    queryKey: ['document-upload-vehicles'],
    queryFn: () => api.get('/vehicles', { params: { limit: 100 } }).then((response) => response.data),
    retry: false,
  });
  const requirements = useQuery({
    queryKey: ['document-requirements'],
    queryFn: () => api.get('/documents/requirements').then((response) => response.data),
    retry: false,
  });
  const selectedRequirement = (requirements.data || []).find((item) => item.category === category);
  const upload = useMutation({
    mutationFn: () => {
      const data = new FormData();
      data.append('vehicle', vehicle);
      data.append('category', category);
      if (expiryDate) data.append('expiryDate', expiryDate);
      data.append('file', file);
      return api.post('/documents', data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      close();
    },
    onError: (uploadError) =>
      setError(uploadError.response?.data?.error?.message || 'Unable to upload this document.'),
  });
  return (
    <div className="card mt-6 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Document management</p>
          <h2 className="mt-1 text-xl font-bold text-navy">Upload vehicle document</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload a PDF, JPEG, or PNG file to the selected vehicle.
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={close} aria-label="Close upload form">
          <X size={17} />
        </button>
      </div>
      <form
        className="mt-5 grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setError('');
          upload.mutate();
        }}
      >
        <label className="label">
          Vehicle registration
          <select
            className="field mt-2"
            required
            value={vehicle}
            onChange={(event) => setVehicle(event.target.value)}
            disabled={vehicles.isLoading || !vehicles.data?.items?.length}
          >
            <option value="">
              {vehicles.isLoading
                ? 'Loading vehicles…'
                : vehicles.data?.items?.length
                  ? 'Select vehicle registration'
                  : 'No vehicles available'}
            </option>
            {(vehicles.data?.items || []).map((item) => (
              <option key={item._id} value={item._id}>
                {item.registration || 'No registration'} ·{' '}
                {[item.make, item.model].filter(Boolean).join(' ') || item.vehicleCode}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          Document category
          <select
            className="field mt-2"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={requirements.isLoading || !requirements.data?.length}
          >
            <option value="">
              {requirements.isLoading
                ? 'Loading document categories…'
                : requirements.data?.length
                  ? 'Select document category'
                  : 'No document categories configured'}
            </option>
            {(requirements.data || []).map((item) => (
              <option key={item._id} value={item.category}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          Expiry date{' '}
          <span className="font-normal text-slate-400">
            {selectedRequirement?.requiresExpiry ? '(required)' : '(optional)'}
          </span>
          <input
            className="field mt-2"
            type="date"
            required={Boolean(selectedRequirement?.requiresExpiry)}
            value={expiryDate}
            onChange={(event) => setExpiryDate(event.target.value)}
          />
        </label>
        <label className="label">
          Document file
          <input
            className="field mt-2"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            required
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">Maximum file size: 10 MB</span>
        </label>
        {(vehicles.isError || requirements.isError || upload.isError) && (
          <p className="text-sm text-red-700 md:col-span-2">
            {error ||
              requirements.error?.response?.data?.error?.message ||
              vehicles.error?.response?.data?.error?.message ||
              'Unable to load document upload options.'}
          </p>
        )}
        {error && !upload.isError && <p className="text-sm text-red-700 md:col-span-2">{error}</p>}
        <div className="flex items-end gap-3 md:col-span-2">
          <button
            className="btn-primary"
            disabled={
              upload.isPending ||
              vehicles.isLoading ||
              requirements.isLoading ||
              !vehicles.data?.items?.length ||
              !requirements.data?.length
            }
          >
            {upload.isPending ? 'Uploading…' : 'Upload document'}
          </button>
          <button type="button" className="btn-secondary" onClick={close}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
function DocumentRegister() {
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const vehicles = useQuery({
    queryKey: ['document-register-vehicles'],
    queryFn: () =>
      api.get('/vehicles', { params: { limit: 100 } }).then((response) => response.data),
    retry: false,
  });
  const documents = useQuery({
    queryKey: ['documents'],
    queryFn: () =>
      api.get('/documents', { params: { limit: 100 } }).then((response) => response.data),
    retry: false,
  });
  const requirements = useQuery({
    queryKey: ['document-requirements'],
    queryFn: () => api.get('/documents/requirements').then((response) => response.data),
    retry: false,
  });
  const vehicleRows = vehicles.data?.items || [];
  const documentRows = documents.data?.items || [];
  const docsByVehicle = documentRows.reduce((all, document) => {
    const vehicleId = document.vehicle?._id || document.vehicle;
    if (!vehicleId) return all;
    (all[vehicleId] ||= []).push(document);
    return all;
  }, {});
  const selectedVehicle = vehicleRows.find((vehicle) => vehicle._id === selectedVehicleId);
  const selectedDocuments = docsByVehicle[selectedVehicleId] || [];
  const submittedCategories = new Set(selectedDocuments.map((document) => document.category));
  const pendingCategories = (requirements.data || []).filter(
    (requirement) => !submittedCategories.has(requirement.category)
  );
  const pageError = vehicles.error || documents.error || requirements.error;
  const errorMessage =
    pageError?.response?.data?.error?.message || 'Unable to load the document register.';
  const fileLink = (document) => `/api/v1/documents/${document._id}/file`;
  return (
    <>
      <PageHero
        eyebrow="Document management"
        title="Documents"
        description="Select a vehicle to review submitted documents, outstanding requirements, and certificates."
      >
        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right">
          <p className="text-xs text-slate-200">Vehicles</p>
          <p className="text-2xl font-bold">{vehicles.data?.total ?? vehicleRows.length}</p>
        </div>
      </PageHero>
      {(vehicles.isLoading || documents.isLoading || requirements.isLoading) && (
        <div className="card mt-6 p-6 text-slate-500">Loading vehicle documents…</div>
      )}
      {pageError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {errorMessage}
        </div>
      )}
      {!vehicles.isLoading && !documents.isLoading && !requirements.isLoading && !pageError && (
        <section className="card mt-6 overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-navy">Vehicle document register</h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a vehicle row to view submitted documents and outstanding requirements.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle registration</th>
                  <th>Vehicle</th>
                  <th>Documents submitted</th>
                  <th>Yet to submit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vehicleRows.length ? (
                  vehicleRows.map((vehicle) => {
                    const vehicleDocuments = docsByVehicle[vehicle._id] || [];
                    const submitted = new Set(vehicleDocuments.map((document) => document.category));
                    const pendingCount = (requirements.data || []).filter(
                      (requirement) => !submitted.has(requirement.category)
                    ).length;
                    return (
                      <tr
                        key={vehicle._id}
                        className="cursor-pointer"
                        tabIndex={0}
                        onClick={() => setSelectedVehicleId(vehicle._id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedVehicleId(vehicle._id);
                          }
                        }}
                      >
                        <td className="font-semibold text-navy">
                          {vehicle.registration || 'No registration'}
                        </td>
                        <td>{[vehicle.make, vehicle.model].filter(Boolean).join(' ') || '—'}</td>
                        <td>{vehicleDocuments.length}</td>
                        <td>{pendingCount}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-secondary px-3 py-1.5 text-xs"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedVehicleId(vehicle._id);
                            }}
                          >
                            View documents
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-slate-500">
                      No vehicles are registered in this dealership.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {selectedVehicle &&
        createPortal(
          <div
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#071d36]/55 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedVehicleId('');
            }}
          >
            <section
              className="card my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="vehicle-document-title"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">
                    Vehicle documents
                  </p>
                  <h2 id="vehicle-document-title" className="mt-1 text-2xl font-bold text-navy">
                    {selectedVehicle.registration || 'No registration'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {[selectedVehicle.make, selectedVehicle.model].filter(Boolean).join(' ')}
                  </p>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setSelectedVehicleId('')}
                  aria-label="Close vehicle documents"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-bold text-navy">Submitted documents</h3>
                {selectedDocuments.length ? (
                  <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {selectedDocuments.map((document) => (
                      <div
                        className="flex flex-wrap items-center justify-between gap-3 p-4"
                        key={document._id}
                      >
                        <div>
                          <p className="font-semibold text-navy">{document.category}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {document.originalName || 'Uploaded document'} · {document.status}
                            {document.submittedAt
                              ? ` · ${new Date(document.submittedAt).toLocaleDateString()}`
                              : ''}
                          </p>
                        </div>
                        <a
                          className="btn-secondary px-3 py-1.5 text-xs"
                          href={fileLink(document)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View certificate
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    No documents have been submitted for this vehicle.
                  </p>
                )}
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-bold text-navy">Yet to submit</h3>
                {pendingCategories.length ? (
                  <ul className="mt-3 space-y-2">
                    {pendingCategories.map((requirement) => (
                      <li
                        className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm"
                        key={requirement._id}
                      >
                        <span className="font-medium text-slate-700">{requirement.name}</span>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          Not submitted
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                    All configured document requirements have been submitted.
                  </p>
                )}
              </div>
            </section>
          </div>,
          document.body
        )}
    </>
  );
}
function RecordPage({ title, endpoint }) {
  const [adding, setAdding] = useState(null);
  const add = quickAdd[endpoint];
  const canUploadDocument = endpoint === 'documents';
  return (
    <>
      {(add || canUploadDocument) && (
        <div className="mb-4 flex justify-end">
          <button className="btn-primary" onClick={() => setAdding({})}>
            <Plus size={16} />
            {canUploadDocument ? 'Upload document' : add.label}
          </button>
        </div>
      )}
      {adding !== null && canUploadDocument && (
        <DocumentUploadForm key="document-upload" close={() => setAdding(null)} />
      )}
      {adding !== null && !canUploadDocument &&
        (adding.zone ? (
          createPortal(
            <div
              className="fixed inset-0 z-50 grid place-items-center bg-[#071d36]/55 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label="Add parking space"
            >
              <div className="w-full max-w-3xl">
                <QuickAdd
                  key={JSON.stringify(adding)}
                  endpoint={endpoint}
                  initialValues={adding}
                  close={() => setAdding(null)}
                />
              </div>
            </div>,
            document.body
          )
        ) : (
          <QuickAdd
            key={JSON.stringify(adding)}
            endpoint={endpoint}
            initialValues={adding}
            close={() => setAdding(null)}
          />
        ))}
      {canUploadDocument ? (
        <DocumentRegister />
      ) : (
        <Records title={title} endpoint={endpoint} onAddSpace={setAdding} />
      )}
    </>
  );
}
function AcquisitionPage() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [action, setAction] = useState('');
  const [editing, setEditing] = useState(null);
  const [editError, setEditError] = useState('');
  const [workflowError, setWorkflowError] = useState('');
  const [form, setForm] = useState({
    vehicle: '',
    proposedPrice: '',
    refurbishmentEstimate: '0',
    transactionCosts: '0',
    holdingCosts: '0',
    expectedResale: '',
  });
  const acquisitions = useQuery({
    queryKey: ['acquisitions'],
    queryFn: () => api.get('/acquisitions', { params: { limit: 100 } }).then((response) => response.data),
    retry: false,
  });
  const vehicles = useQuery({
    queryKey: ['acquisition-vehicles'],
    queryFn: () => api.get('/vehicles', { params: { limit: 100 } }).then((response) => response.data),
    retry: false,
  });
  const detail = useQuery({
    queryKey: ['acquisition', selectedId],
    queryFn: () => api.get(`/acquisitions/${selectedId}`).then((response) => response.data),
    enabled: Boolean(selectedId),
    retry: false,
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['acquisitions'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    if (selectedId) qc.invalidateQueries({ queryKey: ['acquisition', selectedId] });
  };
  const create = useMutation({
    mutationFn: () =>
      api.post('/acquisitions', {
        ...form,
        proposedPrice: Number(form.proposedPrice),
        refurbishmentEstimate: Number(form.refurbishmentEstimate),
        transactionCosts: Number(form.transactionCosts),
        holdingCosts: Number(form.holdingCosts),
        expectedResale: Number(form.expectedResale),
      }),
    onSuccess: () => {
      refresh();
      setAdding(false);
      setForm({
        vehicle: '',
        proposedPrice: '',
        refurbishmentEstimate: '0',
        transactionCosts: '0',
        holdingCosts: '0',
        expectedResale: '',
      });
    },
  });
  const editValuation = useMutation({
    mutationFn: () =>
      api.post(`/acquisitions/${editing._id}/valuation`, {
        proposedPrice: Number(editing.proposedPrice),
        refurbishmentEstimate: Number(editing.refurbishmentEstimate),
        transactionCosts: Number(editing.transactionCosts),
        holdingCosts: Number(editing.holdingCosts),
        expectedResale: Number(editing.expectedResale),
        reason: editing.reason,
      }),
    onSuccess: () => {
      refresh();
      setEditing(null);
      setEditError('');
    },
    onError: (error) =>
      setEditError(error.response?.data?.error?.message || 'Unable to update valuation.'),
  });
  const removeAcquisition = useMutation({
    mutationFn: (id) => api.delete(`/acquisitions/${id}`),
    onSuccess: refresh,
    onError: (error) =>
      setWorkflowError(error.response?.data?.error?.message || 'Unable to delete acquisition.'),
  });
  const runAction = useMutation({
    mutationFn: ({ kind, payload }) => {
      const current = detail.data?.acquisition;
      if (!current) throw new Error('Acquisition details are unavailable.');
      if (kind === 'decision')
        return api.post(`/acquisitions/${current._id}/decision`, payload);
      if (kind === 'offer') return api.post(`/acquisitions/${current._id}/offers`, payload);
      if (kind === 'respond') {
        const offer = detail.data.offers?.find((item) => item.status === 'Sent');
        if (!offer) throw new Error('There is no pending seller offer to respond to.');
        return api.post(`/acquisition-offers/${offer._id}/respond`, payload);
      }
      return api.post(`/acquisitions/${current._id}/purchase`, payload);
    },
    onSuccess: () => {
      refresh();
      setAction('');
    },
    onError: (error) =>
      setWorkflowError(error.response?.data?.error?.message || 'Unable to update the acquisition.'),
  });
  const rows = acquisitions.data?.items || [];
  const acquiredVehicleIds = new Set(rows.map((item) => item.vehicle?._id || item.vehicle));
  const availableVehicles = (vehicles.data?.items || []).filter(
    (vehicle) => !acquiredVehicleIds.has(vehicle._id)
  );
  const current = detail.data?.acquisition;
  const pendingOffer = detail.data?.offers?.find((offer) => offer.status === 'Sent');
  const errorMessage = (error, fallback) =>
    error?.response?.data?.error?.message || error?.message || fallback;
  return (
    <>
      <PageHero
        eyebrow="Vehicle acquisition"
        title="Acquisitions"
        description="Create valuations, review seller offers, and record purchases before sending vehicles to refurbishment."
      >
        <button className="btn-primary" onClick={() => setAdding((value) => !value)}>
          <Plus size={16} />
          New acquisition
        </button>
      </PageHero>
      {adding && (
        <form
          className="card mt-6 grid gap-4 p-6 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate();
          }}
        >
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-navy">Create acquisition valuation</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a vehicle and enter the proposed purchase and resale values.
            </p>
          </div>
          <label className="label">
            Vehicle registration
            <select
              className="field mt-2"
              required
              value={form.vehicle}
              onChange={(event) => setForm({ ...form, vehicle: event.target.value })}
              disabled={vehicles.isLoading || !availableVehicles.length}
            >
              <option value="">
                {vehicles.isLoading
                  ? 'Loading vehicles…'
                  : availableVehicles.length
                    ? 'Select vehicle registration'
                    : 'No eligible vehicles available'}
              </option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.registration || 'No registration'} ·{' '}
                  {[vehicle.make, vehicle.model].filter(Boolean).join(' ') || vehicle.vehicleCode}
                </option>
              ))}
            </select>
          </label>
          {[
            ['proposedPrice', 'Proposed purchase price', true],
            ['expectedResale', 'Expected resale price', true],
            ['refurbishmentEstimate', 'Estimated refurbishment cost'],
            ['transactionCosts', 'Transaction costs'],
            ['holdingCosts', 'Holding costs'],
          ].map(([key, label, required]) => (
            <label className="label" key={key}>
              {label}
              <input
                className="field mt-2"
                type="number"
                min="0"
                step="0.01"
                required={Boolean(required)}
                value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
            </label>
          ))}
          {(vehicles.isError || create.isError) && (
            <p className="text-sm text-red-700 md:col-span-2">
              {errorMessage(
                create.error || vehicles.error,
                'Unable to load vehicles or create the acquisition.'
              )}
            </p>
          )}
          <div className="flex gap-3 md:col-span-2">
            <button className="btn-primary" disabled={create.isPending || !availableVehicles.length}>
              {create.isPending ? 'Saving…' : 'Create valuation'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-navy">Acquisition register</h2>
          <p className="mt-1 text-sm text-slate-500">
            {acquisitions.data?.total ?? rows.length} vehicle{(acquisitions.data?.total ?? rows.length) === 1 ? '' : 's'} in the acquisition workflow
          </p>
        </div>
        {workflowError && (
          <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {workflowError}
          </p>
        )}
        {acquisitions.isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading acquisitions…</p>
        ) : acquisitions.isError ? (
          <p className="p-6 text-sm text-red-700">
            {errorMessage(acquisitions.error, 'Unable to load acquisitions.')}
          </p>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Proposed</th>
                  <th className="px-5 py-3">Expected resale</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((item) => (
                  <tr key={item._id}>
                    <td className="px-5 py-4 font-semibold text-navy">
                      {item.vehicle?.registration || item.vehicle?.vehicleCode || 'Vehicle'}
                    </td>
                    <td className="px-5 py-4">{item.proposedPrice?.toLocaleString() ?? '—'}</td>
                    <td className="px-5 py-4">{item.expectedResale?.toLocaleString() ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5 text-xs"
                          onClick={() => {
                            setSelectedId(item._id);
                            setAction('');
                            setWorkflowError('');
                            runAction.reset();
                          }}
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5 text-xs"
                          disabled={
                            ![
                              'Valuation Requested',
                              'On Hold',
                              'Reinspection Requested',
                              'Revised Valuation Requested',
                              'Approved for Negotiation',
                            ].includes(item.status)
                          }
                          title={
                            [
                              'Valuation Requested',
                              'On Hold',
                              'Reinspection Requested',
                              'Revised Valuation Requested',
                              'Approved for Negotiation',
                            ].includes(item.status)
                              ? 'Edit valuation'
                              : 'Valuation editing is unavailable after an offer or purchase begins'
                          }
                          onClick={() => {
                            setEditError('');
                            setEditing({
                              _id: item._id,
                              proposedPrice: String(item.proposedPrice ?? ''),
                              refurbishmentEstimate: String(item.refurbishmentEstimate ?? 0),
                              transactionCosts: String(item.transactionCosts ?? 0),
                              holdingCosts: String(item.holdingCosts ?? 0),
                              expectedResale: String(item.expectedResale ?? ''),
                              reason: '',
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5 text-xs text-red-700"
                          disabled={
                            removeAcquisition.isPending ||
                            ['Offer Accepted', 'Purchase Pending', 'Purchased'].includes(item.status)
                          }
                          title={
                            ['Offer Accepted', 'Purchase Pending', 'Purchased'].includes(item.status)
                              ? 'Accepted or completed purchases cannot be deleted'
                              : 'Delete acquisition'
                          }
                          onClick={() => {
                            setWorkflowError('');
                            if (
                              window.confirm(
                                'Delete this acquisition? This cannot be undone.'
                              )
                            )
                              removeAcquisition.mutate(item._id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            No acquisitions yet. Create a valuation to begin the purchase workflow.
          </p>
        )}
      </section>
      {editing &&
        createPortal(
          <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#071d36]/55 p-4 backdrop-blur-sm">
            <form
              className="card my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6"
              role="dialog"
              aria-modal="true"
              onSubmit={(event) => {
                event.preventDefault();
                setEditError('');
                editValuation.mutate();
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">
                    Edit acquisition
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-navy">Update valuation</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Saving creates a new valuation snapshot in the acquisition history.
                  </p>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setEditing(null)}
                  aria-label="Close valuation editor"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  ['proposedPrice', 'Proposed purchase price'],
                  ['expectedResale', 'Expected resale price'],
                  ['refurbishmentEstimate', 'Estimated refurbishment cost'],
                  ['transactionCosts', 'Transaction costs'],
                  ['holdingCosts', 'Holding costs'],
                ].map(([key, label]) => (
                  <label className="label" key={key}>
                    {label}
                    <input
                      className="field mt-2"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={editing[key]}
                      onChange={(event) =>
                        setEditing({ ...editing, [key]: event.target.value })
                      }
                    />
                  </label>
                ))}
                <label className="label md:col-span-2">
                  Reason for valuation update
                  <textarea
                    className="field mt-2 min-h-24"
                    required
                    minLength={3}
                    value={editing.reason}
                    onChange={(event) =>
                      setEditing({ ...editing, reason: event.target.value })
                    }
                  />
                </label>
              </div>
              {editError && <p className="mt-4 text-sm text-red-700">{editError}</p>}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button className="btn-primary" disabled={editValuation.isPending}>
                  {editValuation.isPending ? 'Saving…' : 'Save valuation'}
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
      {selectedId && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#071d36]/55 p-4 backdrop-blur-sm">
          <section className="card my-auto w-full max-w-2xl p-6" role="dialog" aria-modal="true">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Acquisition workflow</p>
                <h2 className="mt-1 text-2xl font-bold text-navy">
                  {current?.vehicle?.registration || current?.vehicle?.vehicleCode || 'Acquisition details'}
                </h2>
                {current && <p className="mt-1 text-sm text-slate-500">Status: {current.status}</p>}
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  setSelectedId('');
                  setAction('');
                  runAction.reset();
                }}
                aria-label="Close acquisition"
              >
                <X size={17} />
              </button>
            </div>
            {detail.isLoading ? (
              <p className="mt-6 text-sm text-slate-500">Loading acquisition details…</p>
            ) : detail.isError ? (
              <p className="mt-6 text-sm text-red-700">
                {errorMessage(detail.error, 'Unable to load acquisition details.')}
              </p>
            ) : current ? (
              <>
                <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <p>Proposed price: <strong>{current.proposedPrice?.toLocaleString()}</strong></p>
                  <p>Expected resale: <strong>{current.expectedResale?.toLocaleString()}</strong></p>
                  {current.agreedPrice != null && (
                    <p>Agreed price: <strong>{current.agreedPrice.toLocaleString()}</strong></p>
                  )}
                  {detail.data.eligibility && (
                    <p>
                      Document eligibility:{' '}
                      <strong>{detail.data.eligibility.documentEligible ? 'Complete' : 'Incomplete'}</strong>
                    </p>
                  )}
                  {detail.data.eligibility?.missingDocuments?.length > 0 && (
                    <p className="text-red-700 sm:col-span-2">
                      Missing: {detail.data.eligibility.missingDocuments.join(', ')}
                    </p>
                  )}
                </div>
                <div className="mt-5 space-y-4">
                  {['Valuation Requested', 'On Hold', 'Reinspection Requested', 'Revised Valuation Requested'].includes(current.status) && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ['approve', 'Approve for negotiation'],
                          ['hold', 'Put on hold'],
                          ['reinspection', 'Request reinspection'],
                          ['revalue', 'Request revised valuation'],
                          ['reject', 'Reject'],
                        ].map(([kind, label]) => (
                          <button
                            type="button"
                            className="btn-secondary px-3 py-2 text-xs"
                            key={kind}
                            onClick={() => {
                              setAction(kind);
                              runAction.reset();
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {['approve', 'hold', 'reinspection', 'revalue', 'reject'].includes(action) && (
                        <form
                          className="grid gap-3 sm:grid-cols-[1fr_auto]"
                          onSubmit={(event) => {
                            event.preventDefault();
                            runAction.mutate({
                              kind: 'decision',
                              payload: { action, reason: event.currentTarget.reason.value },
                            });
                          }}
                        >
                          <input className="field" name="reason" required minLength={3} placeholder="Decision reason" />
                          <button className="btn-primary" disabled={runAction.isPending}>
                            Confirm
                          </button>
                        </form>
                      )}
                    </>
                  )}
                  {current.status === 'Approved for Negotiation' && (
                    <>
                      <button type="button" className="btn-secondary" onClick={() => setAction('offer')}>
                        Create seller offer
                      </button>
                      {action === 'offer' && (
                        <form
                          className="grid gap-3 sm:grid-cols-[1fr_auto]"
                          onSubmit={(event) => {
                            event.preventDefault();
                            runAction.mutate({
                              kind: 'offer',
                              payload: { amount: Number(event.currentTarget.amount.value) },
                            });
                          }}
                        >
                          <label className="label">
                            Offer amount
                            <input className="field mt-2" name="amount" type="number" min="0" step="0.01" required />
                          </label>
                          <button className="btn-primary self-end" disabled={runAction.isPending}>Send offer</button>
                        </form>
                      )}
                      {pendingOffer && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-sm font-semibold">Pending offer: {pendingOffer.amount.toLocaleString()}</p>
                          <p className="mt-1 text-xs text-slate-600">Record the seller’s response to continue.</p>
                          <div className="mt-3 flex gap-2">
                            {[true, false].map((accepted) => (
                              <button
                                type="button"
                                className="btn-secondary px-3 py-2 text-xs"
                                key={String(accepted)}
                                onClick={() => runAction.mutate({ kind: 'respond', payload: { accepted } })}
                                disabled={runAction.isPending}
                              >
                                {accepted ? 'Seller accepted' : 'Seller rejected'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {current.status === 'Offer Accepted' && (
                    <>
                      <button type="button" className="btn-secondary" onClick={() => setAction('purchase')}>
                        Record purchase
                      </button>
                      {action === 'purchase' && (
                        <form
                          className="grid gap-3 sm:grid-cols-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            runAction.mutate({
                              kind: 'purchase',
                              payload: {
                                paymentReference: event.currentTarget.paymentReference.value,
                                paymentAmount: Number(event.currentTarget.paymentAmount.value),
                                purchaseAgreementConfirmed: event.currentTarget.purchaseAgreementConfirmed.checked,
                                financeClearanceConfirmed: event.currentTarget.financeClearanceConfirmed.checked,
                                idempotencyKey: crypto.randomUUID(),
                              },
                            });
                          }}
                        >
                          <label className="label">
                            Payment reference
                            <input className="field mt-2" name="paymentReference" required minLength={2} />
                          </label>
                          <label className="label">
                            Payment amount
                            <input
                              className="field mt-2"
                              name="paymentAmount"
                              type="number"
                              min="0"
                              step="0.01"
                              defaultValue={current.agreedPrice ?? current.proposedPrice}
                              required
                            />
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" name="purchaseAgreementConfirmed" required />
                            Purchase agreement confirmed
                          </label>
                          {current.financeClearanceRequired && (
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                              <input type="checkbox" name="financeClearanceConfirmed" required />
                              Finance clearance confirmed
                            </label>
                          )}
                          <button className="btn-primary sm:col-span-2" disabled={runAction.isPending}>
                            Complete purchase
                          </button>
                        </form>
                      )}
                    </>
                  )}
                  {current.status === 'Purchased' && (
                    <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                      Purchase recorded{current.purchaseDate ? ` on ${new Date(current.purchaseDate).toLocaleDateString()}` : ''}.
                      This vehicle is now eligible for refurbishment work orders.
                    </p>
                  )}
                  {runAction.isError && (
                    <p className="text-sm text-red-700">
                      {errorMessage(runAction.error, 'Unable to update the acquisition.')}
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </section>
        </div>
      )}
    </>
  );
}
const recordEditing = {
  users: {
    resource: 'users',
    fields: [
      ['name', 'Full name'],
      ['email', 'Email', 'email'],
      ['phone', 'Phone'],
      [
        'operationalProfile',
        'Operational profile',
        'select:Service Advisor|Senior Technician / Vehicle Inspector|Parking Manager|Refurbishment Technician',
      ],
      ['active', 'Active', 'checkbox'],
    ],
  },
  vehicles: {
    resource: 'vehicles',
    fields: [
      ['registration', 'Registration'],
      ['make', 'Make'],
      ['model', 'Model'],
      ['year', 'Year', 'number'],
      ['fuelType', 'Fuel type'],
      ['transmission', 'Transmission'],
      ['odometer', 'Odometer', 'number'],
      ['lifecycle', 'Lifecycle'],
    ],
  },
  enquiries: {
    resource: 'enquiries',
    fields: [
      ['status', 'Status'],
      ['askingPrice', 'Asking price', 'number'],
      ['source', 'Source'],
      ['followUp', 'Follow-up', 'datetime-local'],
      ['nextAction', 'Next action'],
      ['notes', 'Notes', 'textarea'],
    ],
  },
  inspections: {
    resource: 'inspections',
    fields: [
      ['dueDate', 'Due date & time', 'datetime-local'],
      ['assignedTo', 'Assigned employee ID'],
      ['status', 'Status', 'select:Assigned|In Progress|Submitted|Reviewed|Reinspection Required'],
    ],
  },
  'parking/slots': {
    resource: 'parking-slots',
    fields: [
      ['code', 'Space code'],
      ['zone', 'Zone'],
      ['row', 'Row'],
      ['number', 'Space number', 'number'],
      ['type', 'Type'],
      ['status', 'Status', 'select:Available|Reserved|Occupied|Blocked|Maintenance'],
      ['vehicle', 'Vehicle registration', 'vehicle-select'],
      ['enabled', 'Enabled', 'checkbox'],
    ],
  },
  'work-orders': {
    resource: 'work-orders',
    fields: [
      ['title', 'Title'],
      ['description', 'Description', 'textarea'],
      ['priority', 'Priority'],
      ['assignedTo', 'Assigned employee ID'],
      ['status', 'Status'],
      ['notes', 'Notes', 'textarea'],
    ],
  },
  sales: {
    resource: 'sales',
    fields: [
      ['targetPrice', 'Target price', 'number'],
      ['agreedPrice', 'Agreed price', 'number'],
      ['status', 'Status'],
      ['reservedUntil', 'Reserved until', 'datetime-local'],
    ],
  },
};
function RecordEditor({ config, row, close, saved }) {
  const vehicles = useQuery({
    queryKey: ['parking-slot-editor-vehicles'],
    queryFn: () => api.get('/vehicles', { params: { limit: 100 } }).then((response) => response.data),
    enabled: config.resource === 'parking-slots',
    retry: false,
  });
  const employees = useQuery({
    queryKey: ['editor-employees'],
    queryFn: () => api.get('/users').then((response) => response.data),
    enabled: config.resource === 'inspections',
    retry: false,
  });
  const initial = Object.fromEntries(
    config.fields.map(([key, , type]) => [
      key,
      type === 'checkbox'
        ? Boolean(row[key])
        : key === 'vehicle'
          ? (row.activeVehicle?._id || row.activeVehicle?.id || row.reservationVehicle?._id ||
            row.reservationVehicle?.id || '')
        : type === 'datetime-local' && row[key]
          ? new Date(row[key]).toISOString().slice(0, 16)
          : key === 'assignedTo' && typeof row[key] === 'object'
            ? row[key]?._id || row[key]?.id || ''
            : (row[key] ?? ''),
    ])
  );
  const [form, setForm] = useState(initial);
  const update = useMutation({
    mutationFn: () =>
      config.resource === 'parking-slots'
        ? api.patch(`/parking/slots/${row._id}`, form)
        : api.patch(`/records/${config.resource}/${row._id}`, form),
    onSuccess: () => {
      saved();
      close();
    },
  });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#071d36]/55 p-4 backdrop-blur-sm">
      <form
        className="card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6"
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate();
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Edit record</p>
            <h2 className="mt-1 text-2xl font-bold text-navy">Update authorised details</h2>
            <p className="mt-1 text-sm text-slate-500">Changes are saved to this dealership only.</p>
          </div>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close editor">
            <X size={17} />
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {config.fields
            .filter(
              ([key]) =>
                !(
                  config.resource === 'parking-slots' &&
                  key === 'vehicle' &&
                  !['Reserved', 'Occupied'].includes(form.status)
                )
            )
            .map(([key, label, type = 'text']) => (
              <label className={`label ${type === 'textarea' ? 'md:col-span-2' : ''}`} key={key}>
                {label}
                {type === 'vehicle-select' ? (
                <select
                  className="field mt-2"
                  required={['Reserved', 'Occupied'].includes(form.status)}
                  value={form[key]}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                  disabled={vehicles.isLoading || !vehicles.data?.items?.length}
                >
                  <option value="">
                    {vehicles.isLoading
                      ? 'Loading vehicles…'
                      : vehicles.data?.items?.length
                        ? 'Select vehicle registration'
                        : 'No vehicles available'}
                  </option>
                  {(vehicles.data?.items || []).map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.registration || 'No registration'} ·{' '}
                      {[vehicle.make, vehicle.model].filter(Boolean).join(' ') || vehicle.vehicleCode}
                    </option>
                  ))}
                </select>
                ) : type === 'textarea' ? (
                <textarea
                  className="field mt-2 min-h-24"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
                ) : type === 'checkbox' ? (
                <span className="mt-3 flex items-center gap-2 text-sm font-normal">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  />{' '}
                  Enabled
                </span>
                ) : key === 'assignedTo' && config.resource === 'inspections' ? (
                <select
                  className="field mt-2"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                >
                  <option value="">Select an employee</option>
                  {(employees.data || [])
                    .filter((employee) => employee.active)
                    .map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name} · {employee.operationalProfile || employee.role} (
                        {employee._id.slice(-6)})
                      </option>
                    ))}
                </select>
                ) : type.startsWith('select:') ? (
                <select
                  className="field mt-2"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                >
                  {type
                    .slice(7)
                    .split('|')
                    .map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                </select>
                ) : (
                <input
                  className="field mt-2"
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
                )}
              </label>
            ))}
        </div>
        {vehicles.isError && config.resource === 'parking-slots' && (
          <p className="mt-4 text-sm text-red-700">
            {vehicles.error?.response?.data?.error?.message || 'Unable to load vehicle registrations.'}
          </p>
        )}
        {update.isError && (
          <p className="mt-4 text-sm text-red-700">
            {update.error?.response?.data?.error?.message || 'Unable to save changes.'}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={close}>
            Cancel
          </button>
          <button className="btn-primary" disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
function RecordActions({ endpoint, row }) {
  const qc = useQueryClient();
  const config = recordEditing[endpoint];
  const [editing, setEditing] = useState(false);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: [endpoint] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
  const remove = useMutation({
    mutationFn: () => api.delete(`/records/${config.resource}/${row._id}`),
    onSuccess: refresh,
  });
  if (!config) return null;
  const destroy = () => {
    if (window.confirm('Delete this record permanently? This cannot be undone.')) remove.mutate();
  };
  return (
    <>
      <div className="flex items-center gap-2">
        <button className="icon-btn" title="Edit" onClick={() => setEditing(true)}>
          <Pencil size={15} />
        </button>
        <button
          className="icon-btn icon-btn-danger"
          title="Delete"
          onClick={destroy}
          disabled={remove.isPending}
        >
          <Trash2 size={15} />
        </button>
      </div>
      {editing && createPortal(<RecordEditor config={config} row={row} close={() => setEditing(false)} saved={refresh} />, document.body)}
    </>
  );
}
function ParkingReleaseButton({ row }) {
  const qc = useQueryClient();
  const [releaseError, setReleaseError] = useState('');
  const release = useMutation({
    mutationFn: ({ vehicle, reason }) => api.post('/parking/release', { vehicle, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parking/slots'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error) =>
      setReleaseError(error.response?.data?.error?.message || 'Unable to release this vehicle.'),
  });
  const releaseVehicle = () => {
    const registration = row.activeVehicle?.registration || 'this vehicle';
    if (!window.confirm(`Release ${registration} from ${row.code}? The slot will become available.`))
      return;
    const reason = window.prompt('Reason for releasing this vehicle:', 'Vehicle departed parking yard');
    if (!reason?.trim()) return;
    setReleaseError('');
    release.mutate({
      vehicle: row.activeVehicle?._id || row.activeVehicle?.id,
      reason: reason.trim(),
    });
  };
  if (
    row.status !== 'Occupied' ||
    !(row.activeVehicle?._id || row.activeVehicle?.id)
  ) return null;
  return (
    <div className="mt-3 border-t border-current/10 pt-3">
      <button
        type="button"
        className="btn-secondary w-full justify-center border-red-200 bg-white/80 px-3 py-2 text-xs font-semibold text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
        title="Release this vehicle and make the space available"
        onClick={releaseVehicle}
        disabled={release.isPending}
      >
        {release.isPending ? 'Releasing vehicle…' : 'Release vehicle'}
      </button>
      {releaseError && (
        <p role="alert" className="mt-2 text-xs leading-5 text-red-700">
          {releaseError}
        </p>
      )}
    </div>
  );
}
function ParkingYardBoard({ title, rows, loading, error, onAddSpace }) {
  const groups = Object.values(
    rows.reduce((all, slot) => {
      const key = `${slot.zone || 'Unassigned'} · Row ${slot.row || '—'}`;
      (all[key] ||= { name: key, zone: slot.zone || '', row: slot.row || '', slots: [] }).slots.push(slot);
      return all;
    }, {})
  );
  const colors = {
    Available: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    Occupied: 'border-blue-300 bg-blue-50 text-blue-800',
    Reserved: 'border-amber-300 bg-amber-50 text-amber-800',
    Blocked: 'border-red-300 bg-red-50 text-red-800',
    Maintenance: 'border-slate-300 bg-slate-100 text-slate-700',
  };
  const occupied = rows.filter((slot) => ['Occupied', 'Reserved'].includes(slot.status)).length;
  return (
    <>
      <PageHero
        eyebrow="Live yard operations"
        title={title}
        description="Visualise every parking space by zone and row. Select a space to manage its authorised details."
      >
        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right">
          <p className="text-xs text-slate-200">Spaces configured</p>
          <p className="text-2xl font-bold">{rows.length}</p>
        </div>
      </PageHero>
      {loading && <div className="card mt-6 p-6 text-slate-500">Loading live parking spaces…</div>}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error.response?.data?.error?.message || 'Unable to load parking spaces.'}
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Total capacity</p>
              <p className="mt-2 text-3xl font-bold text-navy">{rows.length}</p>
            </div>
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">In use / reserved</p>
              <p className="mt-2 text-3xl font-bold text-navy">{occupied}</p>
            </div>
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Available now</p>
              <p className="mt-2 text-3xl font-bold text-navy">
                {rows.filter((slot) => slot.status === 'Available').length}
              </p>
            </div>
          </div>
          <section className="card mt-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">
                  Interactive yard board
                </p>
                <h2 className="mt-1 text-xl font-bold text-navy">Parking spaces by location</h2>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                {Object.entries(colors).map(([status, style]) => (
                  <span key={status} className={`rounded-full border px-2 py-1 font-semibold ${style}`}>
                    {status}
                  </span>
                ))}
              </div>
            </div>
            {groups.length ? (
              <div className="mt-6 space-y-6">
                {groups.map((group) => (
                  <div key={group.name}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-navy">{group.name}</h3>
                      {group.zone && (
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5 text-xs"
                          aria-label={`Add a space to ${group.name}`}
                          onClick={() => {
                            const nextNumber =
                              Math.max(0, ...group.slots.map((slot) => Number(slot.number) || 0)) + 1;
                            const zonePart =
                              group.zone.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 10) || 'ZONE';
                            const rowPart =
                              group.row.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 8) || 'ROW';
                            const code = `${zonePart}-${rowPart}-${nextNumber}`.slice(0, 30);
                            onAddSpace({
                              zone: group.zone,
                              row: group.row,
                              number: String(nextNumber),
                              code,
                            });
                          }}
                        >
                          <Plus size={14} />
                          Add space
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
                      {group.slots
                        .sort((a, b) => (a.number || 0) - (b.number || 0))
                        .map((slot) => (
                          <div
                            className={`parking-seat-card rounded-2xl border-2 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${colors[slot.status] || colors.Maintenance}`}
                            key={slot._id}
                          >
                            <div className="flex min-w-0 items-start justify-between gap-2">
                              <div>
                                <p className="break-words font-bold">{slot.code}</p>
                                <p className="mt-1 break-words text-[11px] opacity-75">
                                  Space {slot.number || '—'} · {slot.type}
                                </p>
                              </div>
                              <RecordActions endpoint="parking/slots" row={slot} />
                            </div>
                            <p className="mt-3 text-xs font-bold uppercase tracking-wide">{slot.status}</p>
                            <p className="mt-1 break-all text-[11px] opacity-75">
                              {slot.activeVehicle?.registration ||
                                slot.reservationVehicle?.registration ||
                                'No vehicle assigned'}
                            </p>
                            <ParkingReleaseButton row={slot} />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-14 text-center text-sm text-slate-500">
                Add parking spaces to build your yard board.
              </p>
            )}
          </section>
        </>
      )}
    </>
  );
}
function Records({ title, endpoint, onAddSpace }) {
  const q = useQuery({
    queryKey: [endpoint],
    queryFn: () =>
      api
        .get(`/${endpoint}`, {
          params: endpoint === 'parking/slots' ? { limit: 100 } : undefined,
        })
        .then((r) => r.data),
    retry: false,
  });
  const rows = Array.isArray(q.data) ? q.data : q.data?.items || [];
  const columns = recordEditing[endpoint]?.fields.map(([key, label]) => [key, label]) ||
    recordColumns[endpoint] || [
      ['createdAt', 'Created'],
      ['status', 'Status'],
    ];
  const active = rows.filter((row) =>
    ['Open', 'Assigned', 'In Progress', 'Occupied', 'Reserved', 'Active'].includes(row.status)
  ).length;
  if (endpoint === 'parking/slots')
    return (
      <ParkingYardBoard
        title={title}
        rows={rows}
        loading={q.isLoading}
        error={q.error}
        onAddSpace={onAddSpace}
      />
    );
  return (
    <>
      <PageHero
        eyebrow="Operational register"
        title={title}
        description="Review live dealership records, current workflow states, and authorised operational context."
      >
        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right backdrop-blur">
          <p className="text-xs text-slate-200">Records shown</p>
          <p className="text-2xl font-bold">{q.data?.total ?? rows.length}</p>
        </div>
      </PageHero>
      {q.isLoading && <div className="card mt-6 p-6 text-slate-500">Loading live records…</div>}
      {q.isError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {q.error?.response?.data?.error?.message || 'Unable to load records.'}
        </div>
      )}
      {!q.isLoading && !q.isError && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="card p-4">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Total records</p>
              <p className="mt-2 text-2xl font-bold text-navy">{q.data?.total ?? rows.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Active now</p>
              <p className="mt-2 text-2xl font-bold text-navy">{active}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Latest update</p>
              <p className="mt-2 text-base font-bold text-navy">
                {rows[0]?.updatedAt ? new Date(rows[0].updatedAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
          <div className="card mt-6 overflow-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-navy">Authorised records</h2>
                <p className="mt-1 text-xs text-slate-500">Live data from your secured workspace</p>
              </div>
              <span className="rounded-full bg-[#eef7dc] px-3 py-1 text-xs font-semibold text-[#457412]">
                Live register
              </span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  {columns.map(([, label]) => (
                    <th key={label}>{label}</th>
                  ))}
                  {recordEditing[endpoint] && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((row, index) => (
                    <tr key={row._id || index}>
                      {columns.map(([key]) => (
                        <td key={key}>
                          <span
                            className={
                              key === 'status' || key === 'lifecycle'
                                ? 'badge bg-slate-100 text-slate-700'
                                : ''
                            }
                          >
                            {endpoint === 'inspections' &&
                            key === 'assignedTo' &&
                            typeof row[key] === 'object'
                              ? `${row[key].name || 'Employee'} · ${row[key].operationalProfile || row[key].role || 'Employee'}`
                              : display(row[key])}
                          </span>
                        </td>
                      ))}
                      {recordEditing[endpoint] && (
                        <td>
                          <RecordActions endpoint={endpoint} row={row} />
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + (recordEditing[endpoint] ? 1 : 0)}
                      className="py-14 text-center text-slate-500"
                    >
                      <p className="font-semibold text-navy">No records yet</p>
                      <p className="mt-1 text-sm">
                        New authorised records will appear here as workflow activity begins.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {q.data?.pages > 1 && (
              <p className="border-t px-5 py-3 text-sm text-slate-500">
                Page {q.data.page} of {q.data.pages} · {q.data.total} records
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
function Activity() {
  const q = useQuery({
    queryKey: ['activity'],
    queryFn: () => api.get('/activity').then((r) => r.data),
    retry: false,
  });
  const events = q.data || [];
  return (
    <>
      <PageHero
        eyebrow="Protected audit trail"
        title="Activity history"
        description="Review a chronological record of authorised actions and significant operational changes."
      >
        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right">
          <p className="text-xs text-slate-200">Recent events</p>
          <p className="text-2xl font-bold">{events.length}</p>
        </div>
      </PageHero>
      <div className="card mt-6 overflow-auto">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-navy">Recent activity</h2>
          <p className="mt-1 text-xs text-slate-500">Append-only operational and security history</p>
        </div>
        {q.isLoading ? (
          <p className="p-6 text-slate-500">Loading activity…</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Module</th>
                <th>Record</th>
              </tr>
            </thead>
            <tbody>
              {events.length ? (
                events.map((a) => (
                  <tr key={a._id}>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>
                    <td>
                      <span className="badge bg-blue-50 text-sky">{a.action}</span>
                    </td>
                    <td>{a.entity}</td>
                    <td className="font-mono text-xs">{a.entityId}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    No authorised activity is available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
function ProfileOverview({ user }) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const roleDetails =
    user.role === 'Super Admin'
      ? {
          eyebrow: 'Platform identity',
          title: 'Platform administrator',
          description: 'You manage dealership tenants, subscriptions, onboarding, and platform security.',
          color: '#b6dd52',
          modules: [
            'Dealer provisioning',
            'Platform activity',
            'Subscription oversight',
            'Security settings',
          ],
        }
      : user.role === 'Dealer Admin'
        ? {
            eyebrow: 'Dealership leadership',
            title: 'Dealership administrator',
            description:
              'You oversee the full vehicle lifecycle and operational teams within your dealership.',
            color: '#72b7f2',
            modules: [
              'Vehicle operations',
              'Employee management',
              'Commercial approvals',
              'Dealership reporting',
            ],
          }
        : user.role === 'Buyer & Seller'
          ? {
              eyebrow: 'External portal access',
              title: user.partyType || 'Customer account',
              description:
                'Your portal is restricted to your authorised enquiries, appointments, documents, and offers.',
              color: '#b6dd52',
              modules: ['My enquiries', 'My appointments', 'My documents', 'Offers & progress'],
            }
          : {
              eyebrow: 'Operational identity',
              title: user.operationalProfile || 'Operational employee',
              description:
                'Your workspace is shaped by your assigned responsibility and dealership permissions.',
              color: '#72b7f2',
              modules:
                user.operationalProfile === 'Parking Manager'
                  ? ['Yard map', 'Vehicle locations', 'Reservations', 'Movement history']
                  : user.operationalProfile === 'Refurbishment Technician'
                    ? ['Assigned repairs', 'Parts & labour', 'Completion evidence', 'Rework history']
                    : ['My assignments', 'Inspection queue', 'Report history', 'Vehicle context'],
            };
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071d36] via-[#0a3155] to-[#135584] p-6 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[18px] border-white/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-2xl border-2 border-white/30 bg-white/10 text-2xl font-extrabold text-white shadow-lg">
              {initials}
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[.18em]"
                style={{ color: roleDetails.color }}
              >
                {roleDetails.eyebrow}
              </p>
              <h1 className="mt-1 text-3xl font-bold">{user.name}</h1>
              <p className="mt-1 text-sm text-slate-200">{roleDetails.title}</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs text-slate-200">Account status</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-bold">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b6dd52]" />
              Active & protected
            </p>
          </div>
        </div>
      </div>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="card p-6">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-sky">Workspace access</p>
          <h2 className="mt-1 text-xl font-bold text-navy">Your role, focused</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{roleDetails.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {roleDetails.modules.map((module, index) => (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4" key={module}>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#071d36] text-sm font-bold text-[#b6dd52]">
                  0{index + 1}
                </span>
                <span className="text-sm font-semibold text-navy">{module}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-sky">Account information</p>
          <h2 className="mt-1 text-xl font-bold text-navy">Profile details</h2>
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-sky">
                <Mail size={18} />
              </span>
              <div>
                <p className="text-xs text-slate-500">Email address</p>
                <p className="text-sm font-semibold text-navy">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-50 text-emerald-700">
                <ShieldCheck size={18} />
              </span>
              <div>
                <p className="text-xs text-slate-500">Primary role</p>
                <p className="text-sm font-semibold text-navy">{user.role}</p>
              </div>
            </div>
            {user.operationalProfile && (
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <Users size={18} />
                </span>
                <div>
                  <p className="text-xs text-slate-500">Operational profile</p>
                  <p className="text-sm font-semibold text-navy">{user.operationalProfile}</p>
                </div>
              </div>
            )}
            {user.partyType && (
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                  <Users size={18} />
                </span>
                <div>
                  <p className="text-xs text-slate-500">Portal relationship</p>
                  <p className="text-sm font-semibold text-navy">{user.partyType}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Workspace scope</p>
          <p className="mt-3 text-lg font-bold text-navy">
            {user.dealership?.name ||
              (user.role === 'Super Admin' ? 'All platform tenants' : 'Authorised dealer relationship')}
          </p>
          <p className="mt-2 text-sm text-slate-500">Access is enforced from your secure session.</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Security posture</p>
          <p className="mt-3 text-lg font-bold text-navy">Session protected</p>
          <p className="mt-2 text-sm text-slate-500">Role and responsibility checks apply to every action.</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Activity visibility</p>
          <p className="mt-3 flex items-center gap-2 text-lg font-bold text-navy">
            <CalendarDays size={19} className="text-sky" />
            Role-aware history
          </p>
          <p className="mt-2 text-sm text-slate-500">Review the activity permitted for your account.</p>
        </div>
      </section>
    </>
  );
}
function AppHeader({ user, logout }) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const workspace =
    user.dealership?.name || (user.role === 'Super Admin' ? 'Platform administration' : 'Secure workspace');
  return (
    <header className="topbar relative flex min-h-[72px] items-center justify-between overflow-hidden border-b-4 border-[#d6aa29] bg-[#071d36] px-5 shadow-lg md:px-8">
      <div className="pointer-events-none absolute -left-12 top-0 h-32 w-56 -skew-x-12 bg-gradient-to-r from-[#d6aa29]/20 to-transparent" />
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#f4cf54]">
          ReVelo control centre
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-white">{workspace}</p>
          <span className="hidden rounded-full border border-[#f4cf54]/40 bg-[#f4cf54]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#ffe785] sm:inline">
            {user.operationalProfile || user.role}
          </span>
        </div>
      </div>
      <div className="relative flex items-center gap-2 sm:gap-3">
        <button
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#d6ee55] ring-2 ring-[#071d36]" />
        </button>
        <div className="hidden h-8 w-px bg-white/15 sm:block" />
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#ffe785] to-[#c99317] text-[11px] font-extrabold text-[#071d36]">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="max-w-36 truncate text-xs font-semibold text-white">{user.name}</p>
            <p className="max-w-36 truncate text-[10px] text-slate-300">{user.email}</p>
          </div>
          <ChevronDown size={15} className="hidden text-[#f4cf54] sm:block" />
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:border-red-300/60 hover:bg-red-500/20"
          title="Sign out"
          aria-label="Sign out"
          onClick={logout}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
function Shell() {
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
  const record = (t, e) => <RecordPage title={t} endpoint={e} />;
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
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admins" element={<AdminGate />} />
      <Route path="/*" element={<Shell />} />
    </Routes>
  );
}

function ProfileSettingsLegacy({ user }) {
  const qc = useQueryClient();
  const [profile, setProfile] = useState({ name: user.name || '', phone: user.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileNotice, setProfileNotice] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const saveProfile = useMutation({
    mutationFn: () => api.patch('/profile', profile),
    onSuccess: () => {
      setProfileNotice('Profile details saved.');
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['admin-route-me'] });
    },
    onError: (error) =>
      setProfileNotice(error.response?.data?.error?.message || 'Could not save profile details.'),
  });
  const changePassword = useMutation({
    mutationFn: () =>
      api.post('/profile/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    onSuccess: () => {
      setPasswordNotice('Password updated. Other active sessions have been signed out.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error) =>
      setPasswordNotice(error.response?.data?.error?.message || 'Could not update password.'),
  });
  const submitPassword = (event) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordNotice('New password and confirmation must match.');
      return;
    }
    setPasswordNotice('');
    changePassword.mutate();
  };
  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-2">
      <form
        className="card p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setProfileNotice('');
          saveProfile.mutate();
        }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Account details</p>
          <h2 className="mt-1 text-xl font-bold text-navy">Update profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep your personal details current across your authorised workspace.
          </p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="label">
            Full name
            <input
              className="field mt-2"
              value={profile.name}
              onChange={(event) => setProfile({ ...profile, name: event.target.value })}
              required
            />
          </label>
          <label className="label">
            Phone number
            <input
              className="field mt-2"
              type="tel"
              value={profile.phone}
              onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
            />
          </label>
          <label className="label sm:col-span-2">
            Email address
            <input
              className="field mt-2 cursor-not-allowed bg-slate-50 text-slate-500"
              value={user.email}
              disabled
            />
            <span className="mt-1 block text-xs font-normal text-slate-400">
              Email and role are managed by your authorised administrator.
            </span>
          </label>
        </div>
        {profileNotice && (
          <p
            className={`mt-4 rounded-lg px-3 py-2 text-sm ${saveProfile.isError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}
          >
            {profileNotice}
          </p>
        )}
        <button className="btn-primary mt-5" disabled={saveProfile.isPending}>
          {saveProfile.isPending ? 'Saving…' : 'Save profile changes'}
        </button>
      </form>
      <form className="card p-6" onSubmit={submitPassword}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Security controls</p>
          <h2 className="mt-1 text-xl font-bold text-navy">Update password</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use a unique password of at least 12 characters to protect your account.
          </p>
        </div>
        <div className="mt-5 grid gap-4">
          <label className="label">
            Current password
            <input
              className="field mt-2"
              type="password"
              autoComplete="current-password"
              value={passwords.currentPassword}
              onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
              required
            />
          </label>
          <label className="label">
            New password
            <input
              className="field mt-2"
              type="password"
              autoComplete="new-password"
              minLength="12"
              value={passwords.newPassword}
              onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
              required
            />
          </label>
          <label className="label">
            Confirm new password
            <input
              className="field mt-2"
              type="password"
              autoComplete="new-password"
              minLength="12"
              value={passwords.confirmPassword}
              onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })}
              required
            />
          </label>
        </div>
        {passwordNotice && (
          <p
            className={`mt-4 rounded-lg px-3 py-2 text-sm ${changePassword.isError || passwordNotice.includes('match') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}
          >
            {passwordNotice}
          </p>
        )}
        <button className="btn-primary mt-5" disabled={changePassword.isPending}>
          {changePassword.isPending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  );
}
function Profile({ user }) {
  const SettingsPanel = ProfileSettingsPanel || ProfileSettingsLegacy;
  return (
    <>
      <ProfileOverview user={user} />
      <SettingsPanel user={user} />
    </>
  );
}
