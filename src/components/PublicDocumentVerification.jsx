import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, LockKeyhole, Plus, Upload } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import reveloLogo from '../assets/revelo-logo.png';

const emptyOwner = () => ({ name: '', phone: '', address: '' });

export default function PublicDocumentVerification() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const queryClient = useQueryClient();
  const [uploads, setUploads] = useState({});
  const [details, setDetails] = useState({ hasLoan: false, loanProvider: '', loanReference: '', outstandingAmount: '', previousOwners: [emptyOwner()] });
  const [loadedDetails, setLoadedDetails] = useState(false);
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);
  const request = useQuery({ queryKey: ['public-verification', token], queryFn: () => api.get(`/public/verification/${token}`).then((response) => response.data), enabled: Boolean(token), retry: false });
  const upload = useMutation({
    mutationFn: ({ category, file, expiryDate }) => {
      const data = new FormData();
      data.append('category', category); data.append('file', file); data.append('consent', 'true');
      if (expiryDate) data.append('expiryDate', expiryDate);
      return api.post(`/public/verification/${token}/documents`, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['public-verification', token] }),
  });
  const saveDetails = useMutation({
    mutationFn: () => api.put(`/public/verification/${token}/details`, { ...details, outstandingAmount: details.outstandingAmount === '' ? null : Number(details.outstandingAmount) }),
    onSuccess: () => { setDetailsSubmitted(true); queryClient.invalidateQueries({ queryKey: ['public-verification', token] }); },
  });
  useEffect(() => {
    if (request.data?.request?.declaration && !loadedDetails) {
      const saved = request.data.request.declaration;
      setDetails({ hasLoan: Boolean(saved.hasLoan), loanProvider: saved.loanProvider || '', loanReference: saved.loanReference || '', outstandingAmount: saved.outstandingAmount ?? '', previousOwners: saved.previousOwners?.length ? saved.previousOwners : [emptyOwner()] });
      setDetailsSubmitted(Boolean(saved.submittedAt));
      setLoadedDetails(true);
    }
  }, [request.data, loadedDetails]);
  useEffect(() => {
    if (!detailsSubmitted) return;
    const saveButton = [...document.querySelectorAll('button.btn-primary')].find((button) => button.textContent.includes('Save details securely'));
    if (saveButton) { saveButton.disabled = true; saveButton.textContent = 'Details submitted'; }
  }, [detailsSubmitted]);
  const requirements = request.data?.request?.requirements || [];
  const documents = request.data?.documents || [];
  const latestDocuments = new Map();
  documents.forEach((document) => { if (!latestDocuments.has(document.category)) latestDocuments.set(document.category, document); });
  const updateUpload = (category, key, value) => setUploads((current) => ({ ...current, [category]: { ...current[category], [key]: value } }));
  const updateOwner = (index, key, value) => { setDetailsSubmitted(false); setDetails((current) => ({ ...current, previousOwners: current.previousOwners.map((owner, ownerIndex) => ownerIndex === index ? { ...owner, [key]: value } : owner) })); };
  if (request.isLoading) return <Page><section className="mt-10 rounded-2xl bg-white p-8 shadow-sm text-slate-500">Opening your secure verification request…</section></Page>;
  if (request.isError || !token) return <Page><section className="mt-10 rounded-2xl bg-white p-8 shadow-sm"><h1 className="text-2xl font-bold text-[#10253b]">This link is unavailable</h1><p className="mt-3 text-slate-600">The verification link may be invalid or expired. Please contact the ReVelo team that sent the email.</p></section></Page>;
  return <Page>
    <section className="mt-10 rounded-2xl bg-[#0a1d31] p-7 text-white sm:p-9"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#d6f15d]">Secure verification</p><h1 className="mt-3 text-3xl font-bold">Upload each requested proof.</h1><p className="mt-4 max-w-xl leading-7 text-slate-300">Your documents are stored privately and used only to verify this vehicle enquiry. Aadhaar is requested here—not on the public form—for this reason.</p><p className="mt-5 flex items-center gap-2 text-sm text-[#d6f15d]"><LockKeyhole size={16}/> Link expires {new Date(request.data.request.expiresAt).toLocaleDateString()}</p></section>
    <section className="mt-6 rounded-2xl bg-white p-7 shadow-sm"><h2 className="text-xl font-bold text-[#10253b]">Your documents</h2><p className="mt-2 text-sm text-slate-500">Upload each item in its own section. PDF, JPEG, or PNG; maximum 10 MB per file.</p><div className="mt-5 grid gap-4">{requirements.map((requirement) => { const previous = latestDocuments.get(requirement.category); return <DocumentCard key={requirement.category} requirement={requirement} submitted={Boolean(previous && previous.status !== 'Mismatch')} correctionReason={previous?.status === 'Mismatch' ? previous.reviewReason : ''} value={uploads[requirement.category] || {}} onChange={(key, value) => updateUpload(requirement.category, key, value)} onUpload={() => upload.mutate({ category: requirement.category, ...(uploads[requirement.category] || {}) })} uploading={upload.isPending && upload.variables?.category === requirement.category} error={upload.isError && upload.variables?.category === requirement.category ? upload.error.response?.data?.error?.message || 'Upload failed. Please try again.' : ''}/>; })}</div></section>
    <section className="mt-6 rounded-2xl bg-white p-7 shadow-sm"><h2 className="text-xl font-bold text-[#10253b]">Loan and previous-owner details</h2><p className="mt-2 text-sm text-slate-500">These details are optional unless they apply to this vehicle.</p><div className="mt-6"><p className="label">Does this vehicle have an active loan or hypothecation?</p><div className="mt-2 flex gap-5 text-sm font-medium text-slate-700"><label><input className="mr-2" type="radio" checked={details.hasLoan} onChange={() => setDetails((current) => ({ ...current, hasLoan: true }))}/>Yes</label><label><input className="mr-2" type="radio" checked={!details.hasLoan} onChange={() => setDetails((current) => ({ ...current, hasLoan: false }))}/>No</label></div></div>{details.hasLoan && <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Loan provider / bank" value={details.loanProvider} onChange={(value) => setDetails((current) => ({ ...current, loanProvider: value }))}/><Field label="Loan account or reference number" value={details.loanReference} onChange={(value) => setDetails((current) => ({ ...current, loanReference: value }))}/><Field label="Outstanding amount (if known)" type="number" value={details.outstandingAmount} onChange={(value) => setDetails((current) => ({ ...current, outstandingAmount: value }))}/></div>}<div className="mt-8 border-t border-slate-100 pt-6"><div className="flex items-center justify-between gap-4"><div><p className="font-bold text-[#10253b]">Previous owner details</p><p className="mt-1 text-sm text-slate-500">Optional. Add details only for owners before the current registered seller.</p></div><button type="button" className="btn-secondary" onClick={() => setDetails((current) => ({ ...current, previousOwners: [...current.previousOwners, emptyOwner()] }))}><Plus size={16}/> Add owner</button></div>{details.previousOwners.map((owner, index) => <div className="mt-5 rounded-xl bg-slate-50 p-4" key={index}><p className="mb-3 text-sm font-bold text-[#10253b]">Previous owner {index + 1}</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" value={owner.name} onChange={(value) => updateOwner(index, 'name', value)}/><Field label="Mobile number" type="tel" value={owner.phone} onChange={(value) => updateOwner(index, 'phone', value)}/><Field className="sm:col-span-2" label="Address" value={owner.address} onChange={(value) => updateOwner(index, 'address', value)}/></div></div>)}</div>{saveDetails.isError && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{saveDetails.error.response?.data?.error?.message || 'Details could not be saved.'}</p>}{saveDetails.isSuccess && <p className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Details saved securely.</p>}<button className="btn-primary mt-6 px-5 py-3" disabled={saveDetails.isPending} onClick={() => saveDetails.mutate()}>{saveDetails.isPending ? 'Saving…' : 'Save details securely'}</button></section>
  </Page>;
}

function Page({ children }) { return <main className="min-h-screen bg-[#f7f7f2] px-5 py-8 sm:px-8"><div className="mx-auto max-w-3xl"><header className="flex items-center gap-3"><img src={reveloLogo} alt="ReVelo" className="h-11 w-11 object-contain"/><span className="text-xl font-bold text-[#10253b]">ReVelo</span></header>{children}</div></main>; }
function Field({ label, type = 'text', value, onChange, className = '' }) { return <label className={`label block ${className}`}>{label}<input className="field mt-2" type={type} value={value} onChange={(event) => onChange(event.target.value)}/></label>; }
function DocumentCard({ requirement, submitted, correctionReason, value, onChange, onUpload, uploading, error }) { return <article className="rounded-xl border border-slate-200 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-[#10253b]">{requirement.category}</h3><p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">{requirement.description}</p></div>{submitted ? <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700"><CheckCircle2 size={17}/> Submitted</span> : <span className={`text-sm font-medium ${correctionReason ? 'text-red-700' : requirement.required === false ? 'text-slate-500' : 'text-amber-700'}`}>{correctionReason ? 'Correction needed' : requirement.required === false ? 'Only if applicable' : 'Required'}</span>}</div>{correctionReason && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"><b>What needs correction:</b> {correctionReason}</p>}{!submitted && <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_190px_auto]"><label className="label block">Choose {requirement.category}<input className="field mt-2" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => onChange('file', event.target.files?.[0] || null)}/></label>{requirement.requiresExpiry ? <label className="label block">Expiry date<input className="field mt-2" type="date" value={value.expiryDate || ''} onChange={(event) => onChange('expiryDate', event.target.value)}/></label> : <div/>}<button className="btn-primary self-end px-4 py-3" type="button" disabled={!value.file || uploading} onClick={onUpload}>{uploading ? 'Uploading…' : correctionReason ? <>Replace document</> : <><Upload size={16}/> Upload</>}</button></div>}{error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}</article>; }
