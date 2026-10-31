import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { quickAdd } from '../../pages/records/recordConfig.js';

export function QuickAdd({ endpoint, close, initialValues = {} }) {
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
  const [error, setError] = useState({ endpoint: '', message: '' });
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [vehicleImages, setVehicleImages] = useState([]);
  const needsVehicles = ['inspections', 'enquiries', 'work-orders', 'parking/slots'].includes(endpoint);
  const eligibleWorkOrderVehicles = useQuery({
    queryKey: ['work-order-eligible-vehicles'],
    queryFn: () => api.get('/work-orders/eligible-vehicles').then((response) => response.data),
    enabled: endpoint === 'work-orders',
    retry: false,
  });
  const vehicles = useQuery({
    queryKey: ['quick-add-vehicles'],
    queryFn: () => api.get('/vehicles', { params: { limit: 100 } }).then((r) => r.data),
    enabled: needsVehicles && endpoint !== 'work-orders',
    retry: false,
  });
  const employees = useQuery({
    queryKey: ['quick-add-employees'],
    queryFn: () => api.get('/users').then((r) => r.data),
    enabled: endpoint === 'inspections',
    retry: false,
  });
  const vehicleRows =
    endpoint === 'work-orders'
      ? eligibleWorkOrderVehicles.data || []
      : vehicles.data?.items || [];
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
      if (endpoint === 'vehicles') {
        const data = new FormData();
        Object.entries(body).forEach(([key, value]) => data.append(key, value));
        vehicleImages.forEach((image) => data.append('images', image));
        return api.post('/vehicles', data);
      }
      return api.post(`/${endpoint}`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [endpoint] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      close();
    },
    onError: (e) =>
      setError({
        endpoint,
        message: e.response?.data?.error?.message || 'Unable to save this record.',
      }),
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
          setError({ endpoint: '', message: '' });
          save.mutate();
        }}
      >
        {needsVehicles && endpoint !== 'parking/slots' && (
          <label className="label">
            Vehicle registration
            {(endpoint === 'work-orders'
              ? eligibleWorkOrderVehicles.isLoading
              : vehicles.isLoading) ? (
              <span className="ml-2 font-normal text-slate-400">Loading vehicles…</span>
            ) : null}
            <select
              className="field mt-2"
              required={endpoint !== 'enquiries'}
              value={selectedVehicle}
              disabled={
                endpoint === 'work-orders'
                  ? eligibleWorkOrderVehicles.isLoading || !vehicleRows.length
                  : vehicles.isLoading
              }
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
                  : endpoint === 'work-orders' && !eligibleWorkOrderVehicles.isLoading && !vehicleRows.length
                    ? 'No purchased vehicles available'
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
        {endpoint === 'vehicles' && (
          <label className="label md:col-span-2">
            Vehicle images
            <input
              className="field mt-2"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              multiple
              onChange={(event) => setVehicleImages(Array.from(event.target.files || []))}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Add multiple JPEG or PNG images, up to 20 per upload. You can add more from the vehicle details
              view. Each image must be 10 MB or smaller.
            </span>
            {vehicleImages.length > 0 && (
              <span className="mt-1 block text-xs text-slate-600">
                {vehicleImages.length} image{vehicleImages.length === 1 ? '' : 's'} selected
              </span>
            )}
          </label>
        )}
        <div className="flex items-end gap-3">
          <button
            className="btn-primary"
            disabled={
              save.isPending ||
              (endpoint === 'users' && !values.operationalProfile) ||
              (endpoint === 'work-orders' &&
                (eligibleWorkOrderVehicles.isLoading ||
                  eligibleWorkOrderVehicles.isError ||
                  !vehicleRows.length))
            }
          >
            {save.isPending ? 'Saving…' : spec.label}
          </button>
          <button type="button" className="btn-secondary" onClick={close}>
            Cancel
          </button>
        </div>
        {error.endpoint === endpoint && error.message && (
          <p className="self-end text-sm text-red-700">{error.message}</p>
        )}
        {vehicles.isError && needsVehicles && endpoint !== 'work-orders' && (
          <p className="self-end text-sm text-red-700">
            {vehicles.error?.response?.data?.error?.message || 'Unable to load vehicle registrations.'}
          </p>
        )}
        {eligibleWorkOrderVehicles.isError && endpoint === 'work-orders' && (
          <p className="self-end text-sm text-red-700">
            {eligibleWorkOrderVehicles.error?.response?.data?.error?.message ||
              'Unable to load purchased vehicle registrations.'}
          </p>
        )}
      </form>
    </div>
  );
}
