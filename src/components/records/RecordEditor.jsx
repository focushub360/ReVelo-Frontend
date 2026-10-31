import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '../../lib/api.js';

export function RecordEditor({ config, row, close, saved }) {
  const vehicles = useQuery({
    queryKey: ['record-editor-vehicles'],
    queryFn: () => api.get('/vehicles', { params: { limit: 100 } }).then((response) => response.data),
    enabled: ['enquiries', 'parking-slots'].includes(config.resource),
    retry: false,
  });
  const employees = useQuery({
    queryKey: ['editor-employees'],
    queryFn: () => api.get('/users').then((response) => response.data),
    enabled: config.resource === 'inspections',
    retry: false,
  });
  const loadedVehicles = vehicles.data?.items || [];
  const vehicleOptions =
    config.resource === 'enquiries' &&
    row.vehicle?._id &&
    !loadedVehicles.some((vehicle) => vehicle._id === row.vehicle._id)
      ? [row.vehicle, ...loadedVehicles]
      : loadedVehicles;
  const initial = {
    ...Object.fromEntries(
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
    ),
    ...(config.resource === 'enquiries'
      ? { vehicle: row.vehicle?._id || row.vehicle?.id || '' }
      : {}),
  };
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
          {config.resource === 'enquiries' && (
            <label className="label">
              Vehicle enquiry raised for
              <select
                className="field mt-2"
                required
                value={form.vehicle}
                onChange={(event) => setForm({ ...form, vehicle: event.target.value })}
                disabled={vehicles.isLoading || !vehicles.data?.items?.length}
              >
                <option value="">
                  {vehicles.isLoading
                    ? 'Loading vehicles…'
                    : vehicles.data?.items?.length
                      ? 'Select vehicle registration'
                      : 'No vehicles available'}
                </option>
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.registration || 'No registration'} ·{' '}
                    {[vehicle.make, vehicle.model, vehicle.variant].filter(Boolean).join(' ') ||
                      vehicle.vehicleCode}
                  </option>
                ))}
              </select>
            </label>
          )}
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
        {vehicles.isError && ['enquiries', 'parking-slots'].includes(config.resource) && (
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
