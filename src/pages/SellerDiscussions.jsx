import { cloneElement, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, CheckCircle2, ClipboardCheck, MessageSquare, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHero } from '../components/layout/PageHero.jsx';

const MEETING_KINDS = ['Price Discussion', 'Document Collection', 'Purchase Discussion'];
const blankSchedule = { kind: 'Price Discussion', scheduledAt: '', location: '', agenda: '' };
const dateTime = (value) => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled';
const vehicleName = (item) => [item.vehicle?.registration, item.vehicle?.make, item.vehicle?.model].filter(Boolean).join(' · ') || 'Vehicle details pending';

export function SellerDiscussions() {
  const client = useQueryClient();
  const [scheduleCase, setScheduleCase] = useState(null);
  const [recordCase, setRecordCase] = useState(null);
  const cases = useQuery({ queryKey: ['seller-discussions'], queryFn: () => api.get('/seller-discussions').then((r) => r.data), retry: false });
  const refresh = () => client.invalidateQueries({ queryKey: ['seller-discussions'] });
  return <div className="manager-discussions space-y-6">
    <PageHero eyebrow="Manager seller workflow" title="Seller Discussions" description="Plan up to three seller meetings, record every offer clearly, collect purchase documents, and close the case only when the seller decision is final.">
      <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right"><p className="text-xs text-slate-200">Active seller cases</p><p className="text-2xl font-bold">{cases.data?.filter((item) => !['Accepted', 'Closed', 'Declined'].includes(item.sellerOutcome)).length || 0}</p></div>
    </PageHero>
    <section className="card overflow-hidden">
      <div className="discussion-list-header"><div><p className="section-kicker">Seller acquisition pipeline</p><h2>Discussion schedule and history</h2><p>A clear three-step trail from valuation through documents to the final purchase conversation.</p></div><div className="discussion-key"><span><i className="done"/> Completed</span><span><i className="planned"/> Scheduled</span><span><i className="pending"/> Waiting</span></div></div>
      {cases.isLoading ? <p className="p-8 text-slate-500">Loading seller cases…</p> : <div className="overflow-x-auto"><table className="table seller-case-table min-w-[1080px]"><thead><tr><th>Seller and vehicle</th><th>Case stage</th><th>Three-step meeting trail</th><th>Next action</th><th>Outcome</th><th className="text-right">Manage</th></tr></thead><tbody>
        {cases.data?.length ? cases.data.map((item) => <CaseRow key={item._id} item={item} schedule={() => setScheduleCase(item)} record={() => setRecordCase(item)} />) : <tr><td colSpan="6" className="p-10 text-center text-slate-500">No technical cases are ready for seller discussion yet.</td></tr>}
      </tbody></table></div>}
    </section>
    {scheduleCase && <ScheduleModal item={scheduleCase} close={() => setScheduleCase(null)} saved={() => { setScheduleCase(null); refresh(); }} />}
    {recordCase && <RecordModal item={recordCase} close={() => setRecordCase(null)} saved={() => { setRecordCase(null); refresh(); }} />}
  </div>;
}

function CaseRow({ item, schedule, record }) {
  const meetings = item.sellerMeetings || [];
  const next = meetings.filter((meeting) => meeting.status === 'Scheduled').sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];
  const finalised = ['Accepted', 'Closed', 'Declined'].includes(item.sellerOutcome);
  const stages = MEETING_KINDS.map((kind) => meetings.find((meeting) => meeting.kind === kind));
  return <tr><td><div className="seller-identity"><span className="seller-avatar">{(item.enquiry?.person?.name || 'S').slice(0, 1).toUpperCase()}</span><div><p className="font-bold text-navy">{item.enquiry?.person?.name || 'Seller'}</p><p>{vehicleName(item)}</p><p>{item.enquiry?.person?.phone || 'No phone'} · {item.enquiry?.person?.email || 'No email'}</p></div></div></td>
    <td><Status text={item.status || 'Valuation Requested'} /></td>
    <td><div className="meeting-rail">{stages.map((stage, index) => <div className={`meeting-stage ${stage?.status === 'Completed' ? 'is-complete' : stage?.status === 'Scheduled' ? 'is-scheduled' : ''}`} key={MEETING_KINDS[index]}><span className="stage-dot">{stage?.status === 'Completed' ? '✓' : index + 1}</span><div><strong>{MEETING_KINDS[index]}</strong><small>{stage ? `${dateTime(stage.scheduledAt)} · ${stage.status}` : 'Not scheduled'}</small></div></div>)}</div></td>
    <td><div className="next-action"><p>{next?.kind || 'First meeting needed'}</p><span>{next ? dateTime(next.scheduledAt) : 'Schedule a price discussion'}</span></div></td>
    <td><Status text={item.sellerOutcome === 'Accepted' ? 'Accepted — ready for purchase' : item.sellerOutcome || 'Open'} tone={['Accepted', 'Closed'].includes(item.sellerOutcome) ? 'green' : item.sellerOutcome === 'Declined' ? 'red' : 'blue'} /></td>
    <td className="text-right"><div className="flex justify-end gap-2">{!finalised && meetings.filter((m) => m.status === 'Scheduled').length < 3 && <button className="btn-secondary px-3 py-2 text-xs" onClick={schedule}><CalendarPlus size={15}/> Schedule</button>}{next && !finalised && <button className="btn-primary px-3 py-2 text-xs" onClick={record}><ClipboardCheck size={15}/> Record</button>}</div></td>
  </tr>;
}

function ScheduleModal({ item, close, saved }) {
  const [form, setForm] = useState(blankSchedule);
  const [error, setError] = useState('');
  const save = useMutation({ mutationFn: () => api.post(`/acquisitions/${item._id}/seller-meetings`, { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() }), onSuccess: saved, onError: (e) => setError(e.response?.data?.error?.message || 'Unable to schedule the seller meeting.') });
  return <Modal title="Schedule seller discussion" subtitle={`${item.enquiry?.person?.name || 'Seller'} · ${vehicleName(item)}`} close={close}><form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setError(''); save.mutate(); }}>
    <div className="rounded-xl bg-sky/5 p-4 text-sm text-slate-600"><MessageSquare className="mb-2 text-sky" size={20}/><strong className="text-navy">Seller email notification</strong><p className="mt-1">The seller receives the meeting type, date, time, location, and agenda after this is scheduled.</p></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Meeting purpose"><select required value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>{MEETING_KINDS.map((kind) => <option key={kind}>{kind}</option>)}</select></Field><Field label="Date and time"><input required type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}/></Field></div>
    <Field label="Meeting location"><input required placeholder="Showroom, parking yard, or customer address" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}/></Field>
    <Field label="Agenda"><textarea required rows="3" placeholder="Example: Discuss technician report and seller expected price." value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })}/></Field>
    {error && <p className="text-sm font-semibold text-red-600">{error}</p>}<div className="flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={close}>Cancel</button><button className="btn-primary" disabled={save.isPending}>{save.isPending ? 'Scheduling…' : 'Schedule and email seller'}</button></div>
  </form></Modal>;
}

function RecordModal({ item, close, saved }) {
  const meeting = (item.sellerMeetings || []).filter((m) => m.status === 'Scheduled').sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];
  const [form, setForm] = useState({ sellerExpected: '', managerOffer: '', counterOffer: '', documentStatus: 'Not discussed', decision: 'Continue discussion', notes: '', sellerOutcome: item.sellerOutcome || 'Open', nextKind: '', nextAt: '', nextLocation: '', nextAgenda: '' });
  const [error, setError] = useState('');
  const complete = useMutation({ mutationFn: () => api.patch(`/acquisitions/${item._id}/seller-meetings/${meeting._id}`, { outcome: `Seller expected price: ${form.sellerExpected || 'Not stated'} | Manager offer: ${form.managerOffer || 'Not stated'} | Seller counter-offer: ${form.counterOffer || 'Not stated'} | Documents: ${form.documentStatus} | Decision: ${form.decision} | Notes: ${form.notes || 'None'}`, sellerOutcome: form.sellerOutcome, ...(form.sellerOutcome === 'Accepted' ? { agreedPrice: Number(form.managerOffer) } : {}), ...(form.nextKind ? { nextMeeting: { kind: form.nextKind, scheduledAt: new Date(form.nextAt).toISOString(), location: form.nextLocation, agenda: form.nextAgenda } } : {}) }), onSuccess: saved, onError: (e) => setError(e.response?.data?.error?.message || 'Unable to save this meeting record.') });
  if (!meeting) return null;
  const purchase = meeting.kind === 'Purchase Discussion';
  return <Modal title={`Record ${meeting.kind}`} subtitle={`${dateTime(meeting.scheduledAt)} · ${item.enquiry?.person?.name || 'Seller'}`} close={close}><form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setError(''); if (form.nextKind && (!form.nextAt || !form.nextLocation || !form.nextAgenda)) return setError('Complete all fields for the next scheduled meeting.'); if (form.sellerOutcome === 'Accepted' && (meeting.kind !== 'Purchase Discussion' || !Number(form.managerOffer))) return setError('Only a completed Purchase Discussion can move to Purchase Decisions, and it needs the agreed manager offer.'); complete.mutate(); }}>
    <section className="rounded-xl border border-slate-200 p-4"><h3 className="font-bold text-navy">Price and discussion record</h3><div className="mt-4 grid gap-4 sm:grid-cols-3"><Field label="Seller expected price"><input inputMode="numeric" placeholder="₹" value={form.sellerExpected} onChange={(e) => setForm({ ...form, sellerExpected: e.target.value })}/></Field><Field label="Manager offer"><input inputMode="numeric" placeholder="₹" value={form.managerOffer} onChange={(e) => setForm({ ...form, managerOffer: e.target.value })}/></Field><Field label="Seller counter-offer"><input inputMode="numeric" placeholder="₹" value={form.counterOffer} onChange={(e) => setForm({ ...form, counterOffer: e.target.value })}/></Field></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Document collection status"><select value={form.documentStatus} onChange={(e) => setForm({ ...form, documentStatus: e.target.value })}><option>Not discussed</option><option>Seller will bring documents</option><option>Partially collected</option><option>All required documents collected</option><option>Document mismatch found</option></select></Field><Field label="Discussion decision"><select value={form.decision} onChange={(e) => setForm({ ...form, decision: e.target.value })}><option>Continue discussion</option><option>Proceed to document collection</option><option>Proceed to purchase discussion</option><option>Seller accepted</option><option>Seller declined</option></select></Field></div></section>
    {purchase && <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"><h3 className="flex items-center gap-2 font-bold text-emerald-800"><CheckCircle2 size={18}/> Final purchase checklist</h3><p className="mt-1 text-sm text-emerald-800">Review these before marking a vehicle as purchased. The actual files remain in the secured seller-document record.</p><div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">{['Original RC / smart card', 'Seller photo ID and address proof', 'Valid insurance policy', 'Loan NOC and Form 35, if applicable', 'Signed purchase agreement', 'Payment confirmation / transfer reference'].map((text) => <label className="flex items-center gap-2" key={text}><input type="checkbox"/> {text}</label>)}</div></section>}
    <Field label="Discussion notes"><textarea required rows="4" placeholder="Record the exact points discussed, condition, agreed next step, or reason for decline." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}/></Field>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Seller case outcome"><select value={form.sellerOutcome} onChange={(e) => setForm({ ...form, sellerOutcome: e.target.value })}><option value="Open">Open — follow up required</option>{purchase && <option value="Accepted">Seller accepted — move to Purchase Decisions</option>}<option value="Declined">Seller declined</option></select></Field><Field label="Next meeting (optional)"><select value={form.nextKind} onChange={(e) => setForm({ ...form, nextKind: e.target.value })} disabled={form.sellerOutcome !== 'Open'}><option value="">No next meeting</option>{MEETING_KINDS.map((kind) => <option key={kind}>{kind}</option>)}</select></Field></div>
    {form.nextKind && <div className="rounded-xl bg-slate-50 p-4"><p className="mb-3 font-bold text-navy">Schedule the next seller meeting</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Date and time"><input required type="datetime-local" value={form.nextAt} onChange={(e) => setForm({ ...form, nextAt: e.target.value })}/></Field><Field label="Location"><input required value={form.nextLocation} onChange={(e) => setForm({ ...form, nextLocation: e.target.value })}/></Field></div><div className="mt-4"><Field label="Agenda"><input required value={form.nextAgenda} onChange={(e) => setForm({ ...form, nextAgenda: e.target.value })}/></Field></div></div>}
    {error && <p className="text-sm font-semibold text-red-600">{error}</p>}<div className="flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={close}>Cancel</button><button className="btn-primary" disabled={complete.isPending}>{complete.isPending ? 'Saving…' : 'Save meeting record'}</button></div>
  </form></Modal>;
}

function Modal({ title, subtitle, close, children }) { return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"><section className="mx-auto my-5 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"><header className="flex items-start justify-between bg-gradient-to-r from-navy to-[#135584] px-6 py-5 text-white"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#cceb71]">Manager seller workflow</p><h2 className="mt-1 text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-slate-200">{subtitle}</p></div><button type="button" className="rounded-lg bg-white/15 p-2" onClick={close}><X size={20}/></button></header><div className="p-6">{children}</div></section></div>; }
function Field({ label, children }) { return <label className="block text-sm font-bold text-slate-700"><span className="mb-2 block">{label}</span>{cloneElement(children, { className: `${children.props.className || ''} field` })}</label>; }
function Status({ text, tone = '' }) { const colour = tone === 'green' ? 'bg-emerald-50 text-emerald-700' : tone === 'red' ? 'bg-red-50 text-red-700' : tone === 'blue' ? 'bg-sky/10 text-sky' : 'bg-slate-100 text-slate-700'; return <span className={`badge ${colour}`}>{text}</span>; }
