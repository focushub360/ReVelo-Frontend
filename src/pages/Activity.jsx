import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHero } from '../components/layout/PageHero.jsx';

export function Activity() {
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
