import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowUpRight, CarFront, CheckCircle2, CircleDot, Clock3, TrendingUp, Wrench } from 'lucide-react';
import { api } from '../lib/api.js';
import { ParkingDashboard } from '../components/dashboard/ParkingDashboard.jsx';
import { PlatformDashboard } from '../components/dashboard/PlatformDashboard.jsx';
import { PageHero } from '../components/layout/PageHero.jsx';

export function Dashboard({ user }) {
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
