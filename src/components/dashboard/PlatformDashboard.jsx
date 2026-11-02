import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { PageHero } from '../layout/PageHero.jsx';

export function PlatformDashboard() {
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
