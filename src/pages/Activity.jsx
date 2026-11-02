import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { PageHero } from '../components/layout/PageHero.jsx';

export function Activity({ user }) {
  const [handover, setHandover] = useState(null);
  const q = useQuery({
    queryKey: ['activity'],
    queryFn: () => api.get('/activity').then((r) => r.data),
    retry: false,
  });
  const events = q.data || [];
  const isRefurbishmentTechnician = user?.operationalProfile === 'Refurbishment Technician';
  const technicianJobs = useQuery({ queryKey: ['work-orders'], queryFn: () => api.get('/work-orders', { params: { limit: 100 } }).then((r) => r.data), enabled: user?.operationalProfile === 'Refurbishment Technician', retry: false });
  return (
    <>
      <PageHero
        eyebrow={isRefurbishmentTechnician ? 'Refurbishment handover register' : 'Protected audit trail'}
        title={isRefurbishmentTechnician ? 'My completed handovers' : 'Activity history'}
        description={isRefurbishmentTechnician ? 'Your submitted completion handovers for manager review and selling-slot allocation.' : 'Review a chronological record of authorised actions and significant operational changes.'}
      >
        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right">
          <p className="text-xs text-slate-200">Recent events</p>
          <p className="text-2xl font-bold">{events.length}</p>
        </div>
      </PageHero>
      {user?.operationalProfile === 'Refurbishment Technician' && <div className="mt-6 flex justify-end"><button className="btn-primary" onClick={() => setHandover(true)}>Complete refurbishment handover</button></div>}
      <div className="card mt-6 overflow-auto">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-navy">{isRefurbishmentTechnician ? 'Submitted refurbishment handovers' : 'Recent activity'}</h2>
          <p className="mt-1 text-xs text-slate-500">{isRefurbishmentTechnician ? 'Only completed-work handovers are shown here.' : 'Append-only operational and security history'}</p>
        </div>
        {q.isLoading ? (
          <p className="p-6 text-slate-500">Loading activity…</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{isRefurbishmentTechnician ? 'Submitted date' : 'When'}</th>
                <th>Action</th>
                <th>Module</th>
                {!isRefurbishmentTechnician && <th>Record</th>}
                {isRefurbishmentTechnician && <th>Submitted work overview</th>}
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
                    {!isRefurbishmentTechnician && <td className="font-mono text-xs">{a.entityId}</td>}
                    {isRefurbishmentTechnician && <td className="max-w-md text-sm text-slate-600">{a.data?.workCompleted || a.data?.title || 'Completed refurbishment handover submitted for manager review.'}</td>}
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={isRefurbishmentTechnician ? 4 : 4} className="py-12 text-center text-slate-500">
                    {isRefurbishmentTechnician ? 'No refurbishment handovers have been submitted yet.' : 'No authorised activity is available yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {handover && <CompletionModal jobs={technicianJobs.data?.items || []} close={() => setHandover(null)} />}
    </>
  );
}
function CompletionModal({ jobs, close }) { const qc = useQueryClient(); const [id, setId] = useState(''); const [workCompleted, setWorkCompleted] = useState(''); const [completionNotes, setCompletionNotes] = useState(''); const complete = useMutation({ mutationFn: () => api.post(`/work-orders/${id}/complete-handover`, { workCompleted, completionNotes, readyForManager: true }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['work-orders'] }); qc.invalidateQueries({ queryKey: ['activity'] }); close(); } }); const eligible = jobs.filter((job) => ['Manager Approved', 'In Progress'].includes(job.status)); return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"><form className="card w-full max-w-2xl p-6" onSubmit={(e) => { e.preventDefault(); complete.mutate(); }}><h2 className="text-xl font-bold text-navy">Complete refurbishment handover</h2><p className="mt-1 text-sm text-slate-500">Record what was completed. The manager will review it and move the vehicle from its current inspection/workshop slot to a selling slot.</p><label className="label mt-5">Assigned vehicle / work order<select className="field mt-2" required value={id} onChange={(e) => setId(e.target.value)}><option value="">Select approved job…</option>{eligible.map((job) => <option value={job._id} key={job._id}>{job.vehicle?.registration || 'Vehicle'} · {job.title}</option>)}</select></label><label className="label mt-4">Work completed<textarea required className="field mt-2 min-h-24" value={workCompleted} onChange={(e) => setWorkCompleted(e.target.value)} placeholder="List completed repair, replacement, paint, polishing, service, and testing work."/></label><label className="label mt-4">Completion notes / handover condition<textarea required className="field mt-2 min-h-24" value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} placeholder="State final condition, pending items (if any), and whether the vehicle is ready for manager pickup."/></label><div className="mt-5 flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={close}>Cancel</button><button className="btn-primary" disabled={complete.isPending || !eligible.length}>{complete.isPending ? 'Submitting…' : 'Submit ready-for-manager handover'}</button></div>{complete.isError && <p className="mt-3 text-sm text-red-700">{complete.error.response?.data?.error?.message || 'Unable to submit handover.'}</p>}</form></div>; }
