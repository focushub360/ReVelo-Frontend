import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

const blankLocation = () => ({ label: '', dealership: '', active: true });
const blankField = () => ({ key: `custom_${Date.now()}`, label: '', type: 'text', required: false, options: [], system: false });

export default function PublicLeadSettings() {
  const queryClient = useQueryClient();
  const settings = useQuery({
    queryKey: ['public-lead-settings'],
    queryFn: () => api.get('/public-lead-settings').then((response) => response.data),
    retry: false,
  });
  const [locations, setLocations] = useState([]);
  const [fields, setFields] = useState([]);
  useEffect(() => { if (settings.data) { setLocations(settings.data.locations || []); setFields(settings.data.fields || []); } }, [settings.data]);
  const save = useMutation({
    mutationFn: () => api.put('/public-lead-settings', { locations, fields }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['public-lead-settings'] }),
  });
  const update = (index, key, value) => setLocations((items) => items.map((item, i) => i === index ? { ...item, [key]: value } : item));
  const updateField = (index, key, value) => setFields((items) => items.map((item, i) => i === index ? { ...item, [key]: value } : item));
  const dealerships = settings.data?.dealerships || [];
  return <>
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071d36] via-[#0a3155] to-[#135584] px-6 py-6 text-white shadow-xl md:px-7">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#cceb71]">Public lead controls</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Sell-your-car locations</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">Choose which locations appear on the public form and privately route each one to the correct dealership. The public site never shows the dealership name.</p>
    </div>
    {settings.isLoading && <div className="card mt-6 p-6 text-slate-500">Loading location settings…</div>}
    {settings.isError && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{settings.error?.response?.data?.error?.message || 'Unable to load public lead settings.'}</div>}
    {!settings.isLoading && !settings.isError && <section className="card mt-6 overflow-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-navy">Dropdown locations</h2><p className="mt-1 text-xs text-slate-500">Add only locations that are ready to receive customer enquiries.</p></div><button className="btn-secondary" onClick={() => setLocations((items) => [...items, blankLocation()])}><Plus size={16} /> Add location</button></div>
      <div className="min-w-[720px] p-5"><div className="grid grid-cols-[minmax(180px,1fr)_minmax(260px,1.4fr)_100px_42px] gap-3 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500"><span>Public label</span><span>Route to dealership</span><span>Visible</span><span /></div>{locations.map((location, index) => <div className="grid grid-cols-[minmax(180px,1fr)_minmax(260px,1.4fr)_100px_42px] items-center gap-3 border-b border-slate-100 py-3" key={location._id || `new-${index}`}><input className="field" placeholder="Example: Bengaluru South" value={location.label} onChange={(event) => update(index, 'label', event.target.value)} /><select className="field" value={location.dealership} onChange={(event) => update(index, 'dealership', event.target.value)}><option value="">Select dealership…</option>{dealerships.map((dealer) => <option key={dealer._id} value={dealer._id} disabled={!dealer.active || dealer.subscription?.status !== 'Active'}>{dealer.name} · {dealer.address?.city || 'No city'}{!dealer.active || dealer.subscription?.status !== 'Active' ? ' (inactive)' : ''}</option>)}</select><label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={location.active} onChange={(event) => update(index, 'active', event.target.checked)} /> Live</label><button className="icon-btn text-red-600" onClick={() => setLocations((items) => items.filter((_, i) => i !== index))} aria-label={`Remove ${location.label || 'location'}`}><Trash2 size={17} /></button></div>)}{!locations.length && <p className="py-10 text-center text-sm text-slate-500">No locations are public yet. Add a location to enable the customer form.</p>}</div>
      <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-4"><p className="text-xs text-slate-500">A location must use an active dealership. Changes take effect on the public form after saving.</p><button className="btn-primary" disabled={save.isPending || locations.some((location) => !location.label.trim() || !location.dealership)} onClick={() => save.mutate()}>{save.isPending ? 'Saving…' : 'Save public locations'}</button></div>
      {save.isError && <p className="px-5 pb-4 text-sm text-red-700">{save.error?.response?.data?.error?.message || 'Unable to save the public locations.'}</p>}
      {save.isSuccess && <p className="px-5 pb-4 text-sm text-emerald-700">Public locations saved.</p>}
    </section>}
    {!settings.isLoading && !settings.isError && <section className="card mt-6 overflow-auto"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-navy">Customer form fields</h2><p className="mt-1 text-xs text-slate-500">Remove optional default questions or add your own. Locked fields are necessary to create a valid seller enquiry.</p></div><button className="btn-secondary" onClick={() => setFields((items) => [...items, blankField()])}><Plus size={16} /> Add field</button></div><div className="min-w-[900px] p-5"><div className="grid grid-cols-[1.2fr_120px_90px_1.2fr_42px] gap-3 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500"><span>Question</span><span>Type</span><span>Required</span><span>Dropdown options</span><span /></div>{fields.map((field, index) => <div className="grid grid-cols-[1.2fr_120px_90px_1.2fr_42px] items-center gap-3 border-b border-slate-100 py-3" key={field._id || field.key}><div><input className="field" value={field.label} disabled={field.system} onChange={(event) => updateField(index, 'label', event.target.value)} placeholder="Question label"/>{!field.system && <input className="mt-1 w-full text-xs text-slate-400" value={field.key} onChange={(event) => updateField(index, 'key', event.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} aria-label="Field key"/>}{field.system && <small className="mt-1 block text-xs text-slate-400">Required system field</small>}</div><select className="field" value={field.type} disabled={field.system} onChange={(event) => updateField(index, 'type', event.target.value)}>{['text','email','tel','number','date','textarea','select','boolean'].map((type) => <option key={type} value={type}>{type}</option>)}</select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={field.required} disabled={field.system} onChange={(event) => updateField(index, 'required', event.target.checked)}/> Required</label><input className="field" disabled={field.type !== 'select'} placeholder="Option 1, Option 2" value={(field.options || []).join(', ')} onChange={(event) => updateField(index, 'options', event.target.value.split(',').map((value) => value.trim()).filter(Boolean))}/><button className="icon-btn text-red-600 disabled:cursor-not-allowed disabled:opacity-30" disabled={field.system} onClick={() => setFields((items) => items.filter((_, i) => i !== index))} aria-label={`Remove ${field.label || 'field'}`}><Trash2 size={17}/></button></div>)}{!fields.length && <p className="py-10 text-center text-sm text-slate-500">Add form fields before publishing the public form.</p>}</div><div className="flex justify-end border-t border-slate-100 px-5 py-4"><button className="btn-primary" disabled={save.isPending || locations.some((location) => !location.label.trim() || !location.dealership) || fields.some((field) => !field.label.trim() || !field.key.trim() || (field.type === 'select' && !field.options.length))} onClick={() => save.mutate()}>{save.isPending ? 'Saving…' : 'Save form configuration'}</button></div></section>}
  </>;
}
