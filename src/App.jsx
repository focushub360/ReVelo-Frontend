import { useState } from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  CarFront,
  ClipboardList,
  FileCheck,
  MapPin,
  Wrench,
  ShoppingCart,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { api, setCsrf } from './lib/api';
import { LoadingState, EmptyState, ErrorState } from './components/ui.jsx';
import StatusBadge from './components/ui/StatusBadge.jsx';
import Header from './components/layout/PageHeader.jsx';
const nav = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/enquiries', 'Enquiries', ClipboardList],
  ['/vehicles', 'Vehicles', CarFront],
  ['/documents', 'Documents', FileCheck],
  ['/inspections', 'Inspections', ShieldCheck],
  ['/parking', 'Parking & Yard', MapPin],
  ['/acquisitions', 'Acquisitions', CarFront],
  ['/work-orders', 'Refurbishment', Wrench],
  ['/sales', 'Sales', ShoppingCart],
  ['/users', 'Users & permissions', UsersRound],
];
const status = (s) => <StatusBadge status={s} />;
function Login() {
  const [form, setForm] = useState({ email: 'super.admin@revelo.test', password: 'ChangeMe123!' }),
    [error, setError] = useState('');
  const go = useNavigate();
  const m = useMutation({
    mutationFn: () => api.post('/auth/login', form),
    onSuccess: (r) => {
      setCsrf(r.data.csrfToken);
      go('/dashboard');
    },
    onError: (e) => setError(e.response?.data?.error?.message || 'Unable to sign in'),
  });
  return (
    <main className="grid min-h-screen place-items-center bg-navy p-5">
      <form
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy">ReVelo</h1>
          <p className="mt-1 text-slate-500">Dealership operations, connected.</p>
        </div>
        <label className="label">Email</label>
        <input
          className="field mb-4"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label className="label">Password</label>
        <input
          type="password"
          className="field"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button className="btn-primary mt-6 w-full" disabled={m.isPending}>
          {m.isPending ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-4 text-xs text-slate-500">
          Development seed credentials are shown for local setup only.
        </p>
      </form>
    </main>
  );
}
function Shell() {
  const [user, setUser] = useState(null),
    [open, setOpen] = useState(false),
    go = useNavigate();
  const q = useQuery({
    queryKey: ['me'],
    queryFn: () =>
      api.get('/auth/me').then((r) => {
        setCsrf(r.data.csrfToken);
        setUser(r.data.user);
        return r.data;
      }),
    retry: false,
  });
  if (q.isLoading) return <div className="p-8">Loading ReVelo…</div>;
  if (q.isError) return <Navigate to="/login" />;
  const logout = async () => {
    await api.post('/auth/logout');
    setCsrf('');
    go('/login');
  };
  return (
    <div className="min-h-screen md:flex">
      <aside
        className={`${open ? 'block' : 'hidden'} fixed inset-y-0 z-30 w-64 bg-navy p-4 md:static md:block`}
      >
        <div className="mb-8 px-3 text-2xl font-bold text-white">ReVelo</div>
        <nav className="space-y-1">
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav ${isActive ? 'nav-active' : ''}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            <Menu />
          </button>
          <div className="hidden text-sm text-slate-500 md:block">Automotive lifecycle management</div>
          <div className="flex items-center gap-3">
            <span className="text-sm">
              <b>{user?.name}</b>
              <span className="ml-2 text-slate-500">{user?.role}</span>
            </span>
            <button title="Sign out" onClick={logout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="p-5 md:p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/:id" element={<Vehicle />} />
            <Route
              path="/documents"
              element={<Records title="Document verification" endpoint="documents" />}
            />
            <Route path="/inspections" element={<Records title="Inspections" endpoint="inspections" />} />
            <Route path="/parking" element={<Parking />} />
            <Route
              path="/work-orders"
              element={<Records title="Refurbishment work orders" endpoint="work-orders" />}
            />
            <Route path="/sales" element={<Records title="Sales & delivery" endpoint="sales" />} />
            <Route path="/users" element={<UserAdmin />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </section>
    </div>
  );
}
function Dashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
  });
  if (isLoading) return <LoadingState label="Loading operations dashboard…" />;
  if (isError) return <ErrorState retry={refetch} />;
  const cards = [
    ['Total vehicles', data.vehicles],
    ['New seller enquiries', data.newSellerEnquiries],
    ['Documents pending', data.pendingDocuments],
    ['Work in progress', data.workInProgress],
    ['Awaiting QA', data.awaitingQa],
    ['Ready for sale', data.readyForSale],
    ['Active buyer enquiries', data.activeBuyerEnquiries],
    ['Completed sales', data.completedSales],
    ['Realised profit', data.realisedProfit],
  ];
  return (
    <>
      <Header
        title="Operations dashboard"
        description="Live operational and commercial visibility from persisted dealership records."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([a, b]) => (
          <div className="card p-5" key={a}>
            <p className="text-sm text-slate-500">{a}</p>
            <p className="mt-2 text-3xl font-bold text-navy">{b ?? 0}</p>
          </div>
        ))}
      </div>
      <div className="card mt-6 p-5">
        <h2 className="font-semibold text-navy">Parking capacity</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {data.slots.length ? (
            data.slots.map((x) => (
              <div className="rounded-lg bg-slate-50 p-3" key={x._id}>
                <b>{x._id}</b>
                <span className="ml-2 text-slate-500">{x.count} slots</span>
              </div>
            ))
          ) : (
            <EmptyState
              title="No parking slots configured"
              description="Create a parking slot in Parking & Yard."
            />
          )}
        </div>
      </div>
    </>
  );
}
function Enquiries() {
  const qc = useQueryClient(),
    [form, setForm] = useState(false),
    [selected, setSelected] = useState(null),
    [filters, setFilters] = useState({ search: '', status: '' }),
    [data, setData] = useState({
      name: '',
      phone: '',
      email: '',
      registration: '',
      vin: '',
      chassis: '',
      engine: '',
      make: '',
      model: '',
      variant: '',
      year: '',
      fuelType: '',
      transmission: '',
      odometer: '',
      askingPrice: '',
      source: 'Walk-in',
      declaredAccidentHistory: '',
      serviceHistory: '',
      initialCondition: '',
      followUp: '',
      nextAction: '',
      notes: '',
    });
  const q = useQuery({
    queryKey: ['enquiries', filters],
    queryFn: () => api.get('/enquiries', { params: filters }).then((r) => r.data),
  });
  const detail = useQuery({
    queryKey: ['enquiry', selected],
    queryFn: () => api.get(`/enquiries/${selected}`).then((r) => r.data),
    enabled: !!selected,
  });
  const m = useMutation({
    mutationFn: () =>
      api.post('/enquiries', {
        seller: { name: data.name, phone: data.phone, email: data.email || undefined },
        vehicle: {
          registration: data.registration,
          vin: data.vin,
          chassis: data.chassis,
          engine: data.engine,
          make: data.make,
          model: data.model,
          variant: data.variant,
          year: data.year || undefined,
          fuelType: data.fuelType,
          transmission: data.transmission,
          odometer: data.odometer || undefined,
        },
        askingPrice: data.askingPrice || undefined,
        source: data.source,
        declaredAccidentHistory: data.declaredAccidentHistory,
        serviceHistory: data.serviceHistory,
        initialCondition: data.initialCondition,
        followUp: data.followUp || undefined,
        nextAction: data.nextAction,
        notes: data.notes,
      }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['enquiries'] });
      setForm(false);
      if (r.data.possibleDuplicate)
        alert(
          'Possible matching vehicle found. The enquiry was linked without merging any historical records.'
        );
    },
  });
  const update = useMutation({
    mutationFn: (payload) => api.patch(`/enquiries/${selected}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enquiries'] });
      qc.invalidateQueries({ queryKey: ['enquiry', selected] });
    },
  });
  const fields = [
    ['name', 'Seller name'],
    ['phone', 'Phone'],
    ['email', 'Email'],
    ['registration', 'Registration'],
    ['vin', 'VIN'],
    ['chassis', 'Chassis'],
    ['engine', 'Engine number'],
    ['make', 'Make'],
    ['model', 'Model'],
    ['variant', 'Variant'],
    ['year', 'Year'],
    ['fuelType', 'Fuel type'],
    ['transmission', 'Transmission'],
    ['odometer', 'Odometer'],
    ['askingPrice', 'Asking price'],
    ['source', 'Source'],
    ['followUp', 'Follow-up date'],
    ['nextAction', 'Next action'],
  ];
  return (
    <>
      <Header
        title="Seller enquiries"
        description="Independent acquisition attempts linked only to reliably matched vehicle masters."
      >
        <button className="btn-primary" onClick={() => setForm(!form)}>
          <Plus size={16} /> New enquiry
        </button>
      </Header>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="field w-64"
          placeholder="Search vehicle or enquiry"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="field w-40"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          {['Open', 'Contacted', 'On Hold', 'Rejected', 'Closed'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      {form && (
        <form
          className="card mb-5 grid gap-3 p-5 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            m.mutate();
          }}
        >
          {fields.map(([k, l]) => (
            <label key={k} className="label">
              {l}
              <input
                required={k === 'name'}
                type={k === 'followUp' ? 'date' : 'text'}
                className="field mt-1"
                value={data[k]}
                onChange={(e) => setData({ ...data, [k]: e.target.value })}
              />
            </label>
          ))}
          {[
            ['declaredAccidentHistory', 'Declared accident history'],
            ['serviceHistory', 'Service history'],
            ['initialCondition', 'Initial condition'],
            ['notes', 'Notes'],
          ].map(([k, l]) => (
            <label className="label md:col-span-3" key={k}>
              {l}
              <textarea
                className="field mt-1"
                value={data[k]}
                onChange={(e) => setData({ ...data, [k]: e.target.value })}
              />
            </label>
          ))}
          <div className="flex items-end">
            <button className="btn-primary" disabled={m.isPending}>
              Create enquiry
            </button>
          </div>
          {m.error && <p className="text-red-600">{m.error.response?.data?.error?.message}</p>}
        </form>
      )}
      <div className="card overflow-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Seller</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {q.data?.items.map((x) => (
              <tr className="cursor-pointer hover:bg-slate-50" onClick={() => setSelected(x._id)} key={x._id}>
                <td>{x.enquiryCode}</td>
                <td>{x.person?.name}</td>
                <td>{x.vehicle?.registration || x.vehicle?.vehicleCode}</td>
                <td>{status(x.status)}</td>
                <td>{x.followUp ? new Date(x.followUp).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!q.data?.items.length && (
          <p className="p-8 text-center text-slate-500">No enquiries match these filters.</p>
        )}
      </div>
      {detail.data && (
        <div className="card mt-5 p-5">
          <div className="flex justify-between">
            <div>
              <h2 className="font-semibold text-navy">
                {detail.data.enquiry.enquiryCode} · {detail.data.enquiry.person?.name}
              </h2>
              <p className="text-sm text-slate-500">
                Vehicle: {detail.data.enquiry.vehicle?.vehicleCode} · {detail.data.related.length} linked
                enquiry records
              </p>
            </div>
            {status(detail.data.enquiry.status)}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <select
              className="field"
              value={detail.data.enquiry.status}
              onChange={(e) =>
                update.mutate({ status: e.target.value, reason: 'Updated from enquiry detail' })
              }
            >
              {['Open', 'Contacted', 'On Hold', 'Rejected', 'Closed'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <input
              type="date"
              className="field"
              value={detail.data.enquiry.followUp?.slice(0, 10) || ''}
              onChange={(e) => update.mutate({ followUp: e.target.value || null })}
            />
            <input
              className="field"
              placeholder="Add activity note"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  api.post(`/enquiries/${selected}/notes`, { note: e.currentTarget.value }).then(() => {
                    e.currentTarget.value = '';
                    detail.refetch();
                  });
                }
              }}
            />
          </div>
          <div className="mt-5">
            <h3 className="font-semibold text-navy">Activity history</h3>
            {detail.data.enquiry.history.map((h, i) => (
              <p key={i} className="mt-2 border-l-2 border-sky pl-3 text-sm">
                {h.message}
                <span className="ml-2 text-slate-400">{new Date(h.at).toLocaleString()}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
function Vehicles() {
  const q = useQuery({ queryKey: ['vehicles'], queryFn: () => api.get('/vehicles').then((r) => r.data) });
  const go = useNavigate();
  return (
    <>
      <Header
        title="Vehicle master"
        description="A permanent identity record with an auditable operational history."
      />
      <div className="card overflow-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Registration</th>
              <th>Vehicle</th>
              <th>Lifecycle</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {q.data?.items.map((x) => (
              <tr
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => go(`/vehicles/${x._id}`)}
                key={x._id}
              >
                <td>{x.vehicleCode}</td>
                <td>{x.registration || '—'}</td>
                <td>{[x.make, x.model, x.variant].filter(Boolean).join(' ') || 'Unspecified'}</td>
                <td>{status(x.lifecycle)}</td>
                <td>{x.currentLocation?.code || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function Vehicle() {
  const { id } = useParams();
  const q = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => api.get(`/vehicles/${id}`).then((r) => r.data),
  });
  if (q.isLoading) return <div>Loading vehicle…</div>;
  if (q.isError) return <div className="text-red-600">Vehicle could not be loaded.</div>;
  const d = q.data;
  return (
    <>
      <Header
        title={d.vehicle.registration || d.vehicle.vehicleCode}
        description={`${d.vehicle.make || ''} ${d.vehicle.model || ''}`}
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="font-semibold text-navy">Current status</h2>
          <div className="mt-3">{status(d.vehicle.lifecycle)}</div>
          <p className="mt-3 text-sm text-slate-500">
            Location: {d.vehicle.currentLocation?.code || 'Not assigned'}
          </p>
        </div>
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-navy">Lifecycle records</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <p>
              Seller enquiries <b>{d.enquiries.length}</b>
            </p>
            <p>
              Documents <b>{d.docs.length}</b>
            </p>
            <p>
              Inspections <b>{d.inspections.length}</b>
            </p>
            <p>
              Work orders <b>{d.orders.length}</b>
            </p>
            <p>
              Parking movements <b>{d.moves.length}</b>
            </p>
            <p>
              Sales attempts <b>{d.sales.length}</b>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
function Records({ title, endpoint }) {
  const q = useQuery({
    queryKey: [endpoint],
    queryFn: () => api.get(`/${endpoint}`).then((r) => r.data),
    enabled: !['documents', 'inspections'].includes(endpoint),
  });
  if (endpoint === 'documents') return <Documents />;
  if (endpoint === 'inspections') return <Inspections />;
  return (
    <>
      <Header title={title} description="Operational records are sourced from the secured ReVelo API." />
      <div className="card overflow-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Record</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {q.data?.items.map((x) => (
              <tr key={x._id}>
                <td>{x.title || x.category || x._id.slice(-7)}</td>
                <td>{x.vehicle?.registration || x.vehicle?.vehicleCode || '—'}</td>
                <td>{status(x.status)}</td>
                <td>{new Date(x.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!q.data?.items.length && <p className="p-8 text-center text-slate-500">No records available.</p>}
      </div>
    </>
  );
}
function Inspections() {
  const qc = useQueryClient(),
    [selected, setSelected] = useState(null),
    [assignment, setAssignment] = useState({ vehicle: '', assignedTo: '', kind: 'mechanical', dueDate: '' });
  const q = useQuery({
    queryKey: ['inspections'],
    queryFn: () => api.get('/inspections').then((r) => r.data),
  });
  const detail = useQuery({
    queryKey: ['inspection', selected],
    queryFn: () => api.get(`/inspections/${selected}`).then((r) => r.data),
    enabled: !!selected,
  });
  const assign = useMutation({
    mutationFn: () => api.post('/inspections', assignment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspections'] });
      setAssignment({ vehicle: '', assignedTo: '', kind: 'mechanical', dueDate: '' });
    },
  });
  const save = useMutation({
    mutationFn: (payload) => api.patch(`/inspections/${selected}`, payload),
    onSuccess: () => detail.refetch(),
  });
  const submit = useMutation({
    mutationFn: () => api.post(`/inspections/${selected}/submit`),
    onSuccess: () => detail.refetch(),
  });
  const review = useMutation({
    mutationFn: (approved) => api.post(`/inspections/${selected}/review`, { approved }),
    onSuccess: () => detail.refetch(),
  });
  return (
    <>
      <Header
        title="Inspection assignments"
        description="Structured technical reports with manual diagnostic observations—no diagnostic hardware integration is implied."
      />
      <form
        className="card mb-5 grid gap-3 p-5 md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          assign.mutate();
        }}
      >
        {[
          ['vehicle', 'Vehicle ID'],
          ['assignedTo', 'Inspector user ID'],
          ['dueDate', 'Due date'],
        ].map(([key, label]) => (
          <label className="label" key={key}>
            {label}
            <input
              className="field mt-1"
              type={key === 'dueDate' ? 'date' : 'text'}
              required={key !== 'dueDate'}
              value={assignment[key]}
              onChange={(e) => setAssignment({ ...assignment, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="label">
          Assessment
          <select
            className="field mt-1"
            value={assignment.kind}
            onChange={(e) => setAssignment({ ...assignment, kind: e.target.value })}
          >
            <option value="mechanical">Service Advisor · Mechanical</option>
            <option value="structural">Senior Technician · Body & structural</option>
          </select>
        </label>
        <div className="flex items-end">
          <button className="btn-primary">Assign inspection</button>
        </div>
      </form>
      <div className="card overflow-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Assessment</th>
              <th>Assigned inspector</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {q.data?.items.map((r) => (
              <tr className="cursor-pointer hover:bg-slate-50" onClick={() => setSelected(r._id)} key={r._id}>
                <td>{r.vehicle?.registration || r.vehicle?.vehicleCode}</td>
                <td>{r.kind}</td>
                <td>{r.assignedTo?.name || '—'}</td>
                <td>{status(r.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail.data && (
        <InspectionEditor report={detail.data.report} save={save} submit={submit} review={review} />
      )}
    </>
  );
}
function InspectionEditor({ report, save, submit, review }) {
  const [findings, setFindings] = useState(report.findings);
  const update = (i, key, value) =>
    setFindings(findings.map((f, index) => (index === i ? { ...f, [key]: value } : f)));
  return (
    <div className="card mt-5 p-5">
      <div className="flex justify-between">
        <div>
          <h2 className="font-semibold text-navy">
            {report.kind} assessment · revision {report.revision}
          </h2>
          <p className="text-sm text-slate-500">Assigned {new Date(report.assignedAt).toLocaleString()}</p>
        </div>
        {status(report.status)}
      </div>
      <div className="mt-4 space-y-3">
        {findings.map((f, i) => (
          <div className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-4" key={f._id || i}>
            <b className="text-sm">{f.title}</b>
            <select className="field" value={f.result} onChange={(e) => update(i, 'result', e.target.value)}>
              {['Not Inspected', 'Pass', 'Advisory', 'Fail', 'Critical'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select
              className="field"
              value={f.severity || ''}
              onChange={(e) => update(i, 'severity', e.target.value)}
            >
              <option value="">Severity</option>
              {['Low', 'Medium', 'High', 'Critical'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <input
              className="field"
              placeholder="Findings / recommended action"
              value={f.notes || ''}
              onChange={(e) => update(i, 'notes', e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-outline" onClick={() => save.mutate({ status: 'In Progress', findings })}>
          Save draft
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            save.mutate({ findings });
            submit.mutate();
          }}
        >
          Submit for review
        </button>
        <button className="btn-outline" onClick={() => review.mutate(true)}>
          Approve review
        </button>
        <button className="btn-outline" onClick={() => review.mutate(false)}>
          Require reinspection
        </button>
      </div>
    </div>
  );
}
function Documents() {
  const qc = useQueryClient(),
    [vehicle, setVehicle] = useState(''),
    [category, setCategory] = useState('Registration Certificate'),
    [file, setFile] = useState(null),
    [reason, setReason] = useState('');
  const q = useQuery({
    queryKey: ['vehicle-documents', vehicle],
    queryFn: () => api.get(`/vehicles/${vehicle}/documents`).then((r) => r.data),
    enabled: !!vehicle,
  });
  const upload = useMutation({
    mutationFn: () => {
      const body = new FormData();
      body.append('vehicle', vehicle);
      body.append('category', category);
      body.append('consentRecorded', 'true');
      body.append('file', file);
      return api.post('/documents', body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicle-documents', vehicle] });
      setFile(null);
    },
  });
  const review = useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/documents/${id}/review`, {
        status,
        reason: reason || undefined,
        verificationSource: 'Manual compliance review',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-documents', vehicle] }),
  });
  return (
    <>
      <Header
        title="Documents & verification"
        description="Private documents are manually reviewed; no external identity or registry checks are implied."
      />
      <div className="card mb-5 grid gap-3 p-5 md:grid-cols-3">
        <label className="label">
          Vehicle ID
          <input
            className="field mt-1"
            value={vehicle}
            placeholder="MongoDB Vehicle ID"
            onChange={(e) => setVehicle(e.target.value)}
          />
        </label>
        <label className="label">
          Category
          <input className="field mt-1" value={category} onChange={(e) => setCategory(e.target.value)} />
        </label>
        <label className="label">
          Private file
          <input
            className="field mt-1"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <div className="md:col-span-3">
          <button
            className="btn-primary"
            disabled={!vehicle || !file || upload.isPending}
            onClick={() => upload.mutate()}
          >
            Upload for verification
          </button>
          {upload.error && (
            <p className="mt-2 text-sm text-red-600">{upload.error.response?.data?.error?.message}</p>
          )}
        </div>
      </div>
      {q.isLoading && <LoadingState label="Loading compliance record…" />}
      {q.data && (
        <>
          <div className="card mb-5 p-4">
            <b>Acquisition document eligibility: </b>
            {q.data.completeness.eligible ? (
              <span className="text-emerald-700">Eligible</span>
            ) : (
              <span className="text-amber-700">
                Missing: {q.data.completeness.missing.join(', ') || 'none configured'}
              </span>
            )}
          </div>
          <div className="card overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Submission</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {q.data.documents.map((d) => (
                  <tr key={d._id}>
                    <td>
                      {d.category}
                      <p className="text-xs text-slate-500">{d.originalName}</p>
                    </td>
                    <td>{new Date(d.submittedAt).toLocaleDateString()}</td>
                    <td>{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : '—'}</td>
                    <td>{status(d.status)}</td>
                    <td>
                      <a
                        className="mr-2 text-sky underline"
                        href={`/api/v1/documents/${d._id}/file`}
                        target="_blank"
                      >
                        Open
                      </a>
                      <select
                        className="rounded border p-1 text-xs"
                        defaultValue=""
                        onChange={(e) =>
                          e.target.value && review.mutate({ id: d._id, status: e.target.value })
                        }
                      >
                        <option value="">Review…</option>
                        {['Under Review', 'Verified', 'Mismatch', 'Rejected', 'On Hold'].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <label className="label mt-3">
            Reason for mismatch, rejection, or hold
            <input className="field mt-1" value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
        </>
      )}
    </>
  );
}
function Parking() {
  const qc = useQueryClient(),
    [filter, setFilter] = useState(''),
    [selected, setSelected] = useState(null),
    [f, setF] = useState({ code: '', zone: 'Main', row: 'A', number: '', type: 'parking' }),
    q = useQuery({
      queryKey: ['slots', filter],
      queryFn: () =>
        api.get('/parking/slots', { params: { search: filter, limit: 100 } }).then((r) => r.data),
    });
  const create = useMutation({
    mutationFn: () => api.post('/parking/slots', { ...f, number: f.number || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['slots'] });
      setF({ ...f, code: '', number: '' });
    },
  });
  const action = useMutation({
    mutationFn: ({ path, body }) => api.post(`/parking/${path}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slots'] }),
  });
  const counts = (q.data?.items || []).reduce((a, s) => ({ ...a, [s.status]: (a[s.status] || 0) + 1 }), {});
  return (
    <>
      <Header
        title="Parking & yard"
        description="Live slot availability and physical movements are persisted; this grid is never a static illustration."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {['Available', 'Reserved', 'Occupied', 'Blocked', 'Maintenance'].map((x) => (
          <span key={x} className="badge bg-slate-100 text-slate-700">
            {x}: {counts[x] || 0}
          </span>
        ))}
        <input
          className="field ml-auto w-56"
          placeholder="Search zone, row, or slot"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <form
        className="card mb-5 grid gap-3 p-4 md:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        {['code', 'zone', 'row', 'number'].map((k) => (
          <input
            key={k}
            required={k !== 'number'}
            placeholder={k[0].toUpperCase() + k.slice(1)}
            className="field"
            value={f[k]}
            onChange={(e) => setF({ ...f, [k]: e.target.value })}
          />
        ))}
        <select className="field" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          {['parking', 'inspection', 'road-test', 'workshop', 'delivery'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <button className="btn-primary">Add location</button>
      </form>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {q.data?.items.map((x) => (
          <button
            className={`card p-4 text-left hover:ring-2 hover:ring-sky ${x.status === 'Occupied' ? 'border-sky' : x.status === 'Maintenance' ? 'border-amber-300' : ''}`}
            onClick={() => setSelected(x)}
            key={x._id}
          >
            <b>{x.code}</b>
            <p className="my-1 text-xs text-slate-500">
              {x.zone} · {x.row} · {x.type}
            </p>
            {status(x.status)}
            <p className="mt-2 text-xs">
              {x.activeVehicle?.registration ||
                x.activeVehicle?.vehicleCode ||
                x.reservationVehicle?.vehicleCode ||
                ''}
            </p>
            {x.occupiedAt && (
              <p className="mt-1 text-xs text-slate-400">Since {new Date(x.occupiedAt).toLocaleString()}</p>
            )}
          </button>
        ))}
      </div>
      {selected && <ParkingActions slot={selected} action={action} close={() => setSelected(null)} />}
    </>
  );
}
function ParkingActions({ slot, action, close }) {
  const [vehicle, setVehicle] = useState(''),
    [reason, setReason] = useState('');
  const run = (path, body) => action.mutate({ path, body: { ...body, reason } });
  return (
    <div className="card mt-5 p-5">
      <div className="flex justify-between">
        <h2 className="font-semibold text-navy">
          {slot.code} · {slot.status}
        </h2>
        <button className="btn-outline" onClick={close}>
          Close
        </button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <input
          className="field"
          placeholder="Vehicle ID"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
        />
        <input
          className="field"
          placeholder="Movement reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-2">
          {slot.status === 'Available' && (
            <>
              <button className="btn-outline" onClick={() => run('reserve', { vehicle, slot: slot._id })}>
                Reserve
              </button>
              <button className="btn-primary" onClick={() => run('confirm', { vehicle, slot: slot._id })}>
                Confirm occupancy
              </button>
            </>
          )}
          {slot.status === 'Reserved' && (
            <button className="btn-primary" onClick={() => run('confirm', { vehicle, slot: slot._id })}>
              Confirm occupancy
            </button>
          )}
          {slot.status === 'Occupied' && (
            <button
              className="btn-outline"
              onClick={() => run('release', { vehicle: slot.activeVehicle?._id || vehicle })}
            >
              Release
            </button>
          )}
        </div>
      </div>
      {action.error && (
        <p className="mt-3 text-sm text-red-600">{action.error.response?.data?.error?.message}</p>
      )}
    </div>
  );
}
const roles = [
  'Super Admin',
  'Dealer Admin / Branch Manager',
  'Acquisition Executive',
  'Documentation & Compliance Officer',
  'Service Advisor',
  'Senior Technician / Vehicle Inspector',
  'Yard / Parking Manager',
  'Workshop / Refurbishment Technician',
  'Sales Executive',
  'Accounts / Finance Officer',
];
function UserAdmin() {
  const qc = useQueryClient(),
    [show, setShow] = useState(false),
    [form, setForm] = useState({ name: '', email: '', password: '', role: roles[2] });
  const q = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
    retry: false,
  });
  const create = useMutation({
    mutationFn: () => api.post('/users', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setShow(false);
    },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
  const revoke = useMutation({
    mutationFn: (id) => api.post(`/users/${id}/revoke-sessions`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
  if (q.isLoading) return <LoadingState label="Loading user accounts…" />;
  if (q.isError)
    return <ErrorState message="You may not have permission to manage users." retry={q.refetch} />;
  return (
    <>
      <Header
        title="Users & permissions"
        description="Role assignment, account activation, and server-enforced access control."
      >
        <button className="btn-primary" onClick={() => setShow(!show)}>
          <Plus size={16} /> Add user
        </button>
      </Header>
      {show && (
        <form
          className="card mb-5 grid gap-3 p-5 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          {[
            ['name', 'Full name'],
            ['email', 'Work email'],
            ['password', 'Temporary password'],
          ].map(([key, label]) => (
            <label className="label" key={key}>
              {label}
              <input
                className="field mt-1"
                type={key === 'password' ? 'password' : 'text'}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
                minLength={key === 'password' ? 12 : 2}
              />
            </label>
          ))}
          <label className="label">
            Role
            <select
              className="field mt-1"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button className="btn-primary" disabled={create.isPending}>
              Create account
            </button>
          </div>
          {create.error && (
            <p className="text-sm text-red-600">{create.error.response?.data?.error?.message}</p>
          )}
        </form>
      )}
      <div className="card overflow-auto">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Account</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {q.data.map((u) => (
              <tr key={u._id}>
                <td>
                  <b>{u.name}</b>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td>
                  <select
                    className="rounded border border-slate-200 p-1 text-xs"
                    value={u.role}
                    onChange={(e) => update.mutate({ id: u._id, data: { role: e.target.value } })}
                  >
                    {roles.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td>{status(u.active ? 'Active' : 'Inactive')}</td>
                <td className="space-x-2">
                  <button
                    className="btn-outline"
                    onClick={() => update.mutate({ id: u._id, data: { active: !u.active } })}
                  >
                    {u.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn-outline" onClick={() => revoke.mutate(u._id)}>
                    Revoke sessions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<Shell />} />
    </Routes>
  );
}
