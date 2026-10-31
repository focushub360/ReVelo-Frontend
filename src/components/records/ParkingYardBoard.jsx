import { Plus } from 'lucide-react';
import { PageHero } from '../layout/PageHero.jsx';
import { RecordActions } from './RecordActions.jsx';
import { ParkingReleaseButton } from './ParkingReleaseButton.jsx';

export function ParkingYardBoard({ title, rows, loading, error, onAddSpace }) {
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
