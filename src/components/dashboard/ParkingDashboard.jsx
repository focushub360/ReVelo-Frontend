import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../lib/api.js';

export const parkingPalette = {
  Available: '#32a66c',
  Occupied: '#2278d4',
  Reserved: '#e7a62c',
  Blocked: '#d45151',
  Maintenance: '#7b8796',
};

export function ParkingDashboard() {
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
