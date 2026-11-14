import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowUpRight, BadgeIndianRupee, CarFront, CheckCircle2, CircleDot, Clock3, MapPin, TrendingUp, UsersRound, Wrench } from 'lucide-react';
import { api } from '../lib/api.js';
import { ParkingDashboard } from '../components/dashboard/ParkingDashboard.jsx';
import { PlatformDashboard } from '../components/dashboard/PlatformDashboard.jsx';
import { LifecycleTracker } from '../components/dashboard/LifecycleTracker.jsx';
import dealerHeroImage from '../assets/revelo-hero-drive-v3.png';
import '../styles/Dashboard.css';

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
    <div className="operations-dashboard dealer-operations-dashboard">
      <section className="dealer-dashboard-hero" style={{ '--dealer-hero-image': `url("${dealerHeroImage}")` }}>
        <div className="dealer-hero-copy">
          <p className="dealer-hero-eyebrow"><span /> DEALERSHIP OPERATIONS <i /> LIVE OVERVIEW</p>
          <h1>Every vehicle.<br /><span>Every move.</span></h1>
          <p className="dealer-hero-description">
            Your live view of stock, service and sales at <strong>{user.dealership?.name || 'your dealership'}.</strong>
          </p>
          <div className="dealer-hero-meta">
            <span><MapPin size={14} /> Dealership floor</span>
            <span><CarFront size={14} /> {d.vehicles || 0} vehicles in your fleet</span>
          </div>
        </div>
        <div className="dealer-hero-score">
          <p className="dealer-hero-score-label">RETAIL READINESS</p>
          <div className="dealer-readiness-dial" style={{ '--readiness': `${readiness}%` }}>
            <div className="dealer-readiness-center">
              <strong>{readiness}<small>%</small></strong>
              <span>READY TO RETAIL</span>
            </div>
          </div>
          <p className="dealer-hero-score-note">
            <TrendingUp size={14} /> Fleet health at a glance
          </p>
        </div>
        <div className="dealer-hero-index" aria-hidden="true">RV / 01</div>
      </section>
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
          <div className="dashboard-metrics mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(([label, value, detail, Icon, tone]) => (
              <div className={`metric-card card p-5 dashboard-${tone}`} key={label}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-navy">{value}</p>
                  </div>
                  <span className={`dashboard-metric-icon dashboard-metric-${tone}`}>
                    <Icon size={20} />
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">{detail}</p>
              </div>
            ))}
          </div>
          <section className="dealer-dashboard-section dealer-dashboard-overview-grid mt-5 grid gap-5 xl:grid-cols-[1.22fr_.78fr]">
            <div className="chart-card card dealer-dashboard-panel p-6">
              <div className="dealer-panel-heading flex items-start justify-between">
                <div>
                  <p className="dealer-panel-kicker">01 / Vehicle journey</p>
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
            <div className="card dealer-dashboard-panel dealer-yard-panel p-6">
              <div className="dealer-panel-heading">
                <p className="dealer-panel-kicker">02 / Yard status</p>
                <h2 className="mt-1 text-xl font-bold text-navy">Space at a glance</h2>
              </div>
              <div className="dealer-yard-summary mt-6 flex items-center gap-5">
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
              <div className="dealer-yard-counts mt-6 space-y-3">
                {(d.slots || []).map((slot) => (
                  <div className="flex items-center justify-between text-sm" key={slot._id}>
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`dealer-yard-dot dealer-yard-dot-${slot._id.toLowerCase().replaceAll(' ', '-')}`} />
                      {slot._id}
                    </span>
                    <b className="text-navy">{slot.count}</b>
                  </div>
                ))}
              </div>
              <Link
                to="/parking"
                className="dealer-panel-link mt-5 inline-flex items-center gap-1 text-sm font-bold text-sky hover:text-blue-800"
              >
                Open yard map <ArrowUpRight size={15} />
              </Link>
            </div>
          </section>
          <section className="dealer-dashboard-section dealer-dashboard-work-grid mt-5 grid gap-5 xl:grid-cols-[.95fr_1.05fr]">
            <div className="card dealer-dashboard-panel dealer-pipeline-panel p-6">
              <div className="dealer-panel-heading flex items-start justify-between">
                <div>
                  <p className="dealer-panel-kicker">03 / Operational pulse</p>
                  <h2 className="mt-1 text-xl font-bold text-navy">Pipeline health</h2>
                </div>
                <span className="dealer-pipeline-live"><CircleDot size={16} /> LIVE</span>
              </div>
              <div className="dealer-pipeline-steps mt-6">
                {pipeline.map((step, index) => (
                  <div className="dealer-pipeline-step" key={step.name} data-step={index}>
                    <div className="dealer-pipeline-step-heading">
                      <span className="dealer-pipeline-index">0{index + 1}</span>
                      <span className="font-medium text-slate-600">{step.name}</span>
                      <b className="text-navy">{step.value}</b>
                    </div>
                    <div className="dealer-pipeline-track">
                      <div
                        className="dealer-pipeline-fill"
                        style={{ width: `${Math.min(100, d.vehicles ? Math.max(8, (step.value / d.vehicles) * 100) : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card dealer-dashboard-panel dealer-workorders-panel overflow-hidden">
              <div className="dealer-panel-heading flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <p className="dealer-panel-kicker">04 / Workshop</p>
                  <h2 className="mt-1 text-xl font-bold text-navy">Active work orders</h2>
                </div>
                <Link to="/work-orders" className="dealer-panel-link text-sm font-bold text-sky hover:text-blue-800">
                  View workshop <ArrowUpRight size={15} />
                </Link>
              </div>
              <div className="dealer-workorder-list divide-y divide-slate-100">
                {(d.openWorkOrders || []).length ? (
                  d.openWorkOrders.map((order) => (
                    <div className="dealer-workorder-row flex items-center justify-between gap-3 px-6 py-4" key={order._id}>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy">{order.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          <span className="dealer-workorder-code">{order.workOrderCode}</span>
                          <span className="dealer-workorder-divider"> · </span>
                          <CarFront className="dealer-workorder-car" size={13} />
                          {order.vehicle?.registration || order.vehicle?.vehicleCode || 'Vehicle pending'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="dealer-workorder-status">{order.status}</span>
                        <p className="mt-1 text-[11px] text-slate-400">{order.priority} priority</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dealer-workorder-empty">
                    <span><Wrench size={20} /></span>
                    <div>
                      <strong>Workshop clear</strong>
                      <p>No active work orders need attention.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
          <div className="dealer-dashboard-section mt-5"><LifecycleTracker breakdown={d.lifecycleBreakdown || []} /></div>
          <section className="dealer-dashboard-section dealer-commercial-strip mt-5 grid gap-4 lg:grid-cols-3">
            <div className="card dealer-commercial-card dealer-commercial-team p-5">
              <span className="dealer-commercial-icon"><UsersRound size={18} /></span>
              <div className="dealer-commercial-copy">
                <p className="dealer-commercial-label">Team on the floor</p>
                <p className="dealer-commercial-value">{d.activeEmployees || 0}</p>
                <p className="dealer-commercial-detail">Active dealership users</p>
              </div>
            </div>
            <div className="card dealer-commercial-card dealer-commercial-sales p-5">
              <span className="dealer-commercial-icon"><CarFront size={18} /></span>
              <div className="dealer-commercial-copy">
                <p className="dealer-commercial-label">Commercial outcomes</p>
                <p className="dealer-commercial-value">{d.completedSales || 0}<small> closed</small></p>
                <p className="dealer-commercial-detail">{d.completedPurchases || 0} vehicles acquired into stock</p>
              </div>
            </div>
            <div className="card dealer-commercial-card dealer-commercial-profit p-5">
              <span className="dealer-commercial-icon"><BadgeIndianRupee size={18} /></span>
              <div className="dealer-commercial-copy">
                <p className="dealer-commercial-label">Realised profit</p>
                <p className="dealer-commercial-value">₹{Number(d.realisedProfit || 0).toLocaleString('en-IN')}</p>
                <p className="dealer-commercial-detail">Across closed sales</p>
              </div>
            </div>
          </section>
          <section className="dealer-dashboard-section card dealer-activity-panel mt-5 overflow-hidden">
            <div className="dealer-panel-heading flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="dealer-panel-kicker">05 / The daily log</p>
                <h2 className="mt-1 text-xl font-bold text-navy">Latest operational events</h2>
              </div>
              <Link to="/activity" className="dealer-panel-link text-sm font-bold text-sky hover:text-blue-800">
                Full activity <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="dealer-activity-list divide-y divide-slate-100">
              {(d.recentActivity || []).length ? (
                d.recentActivity.map((event) => (
                  <div className="dealer-activity-row flex gap-3 px-6 py-4" key={event._id}>
                    <span className="dealer-activity-icon mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-sky">
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
    </div>
  );
}
