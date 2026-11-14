import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import reveloLogo from '../assets/revelo-logo.png';

const contactKeys = new Set(['name', 'phone', 'email', 'line1', 'locality', 'city', 'state', 'postalCode']);
const vehicleKeys = new Set(['registration', 'make', 'model', 'year', 'fuelType', 'transmission', 'odometer', 'expectedPrice']);
const steps = [{ title: 'You & location', copy: 'Where the vehicle is and how the nearby team can contact you.' }, { title: 'Vehicle details', copy: 'The core records needed to identify your car.' }, { title: 'Ownership & declaration', copy: 'Ownership, condition, and any additional questions.' }];

export default function PublicSellerForm() {
  const config = useQuery({ queryKey: ['public-sell-form'], queryFn: () => api.get('/public/sell-locations').then((response) => response.data), retry: false });
  const [step, setStep] = useState(0); const [locationId, setLocationId] = useState(''); const [answers, setAnswers] = useState({}); const [consent, setConsent] = useState(false); const [website, setWebsite] = useState(''); const [notice, setNotice] = useState(null); const [submission, setSubmission] = useState(null);
  const submissionStarted = useRef(false);
  const noticeTimer = useRef(null);
  const showNotice = (message, type = 'error') => {
    setNotice({ message, type });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 2000);
  };
  useEffect(() => { document.title = 'Sell Your Used Car | ReVelo'; return () => { document.title = 'ReVelo'; }; }, []);
  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);
  const fields = config.data?.fields || []; const locations = config.data?.locations || [];
  const groups = useMemo(() => [fields.filter((field) => contactKeys.has(field.key)), fields.filter((field) => vehicleKeys.has(field.key)), fields.filter((field) => !contactKeys.has(field.key) && !vehicleKeys.has(field.key))], [fields]);
  const submit = useMutation({ mutationFn: () => api.post('/public/seller-enquiries', { locationId, answers, consentToContact: consent, website }), onSuccess: ({ data }) => { setSubmission(data); showNotice('Your enquiry has been submitted.', 'success'); }, onError: (requestError) => showNotice(requestError.response?.data?.error?.message || 'We could not submit your enquiry. Please try again.'), onSettled: () => { submissionStarted.current = false; } });
  const update = (key, value) => setAnswers((current) => ({ ...current, [key]: value }));
  const validateStep = () => {
    if (step === 0 && !locationId) { showNotice('Choose your nearest location to continue.'); return false; }
    const invalidField = groups[step].find((field) => validateField(field, answers[field.key]));
    if (invalidField) { showNotice(validateField(invalidField, answers[invalidField.key])); return false; }
    return true;
  };
  const next = () => { if (!validateStep()) return; setStep((current) => Math.min(current + 1, 2)); };
  const finish = (event) => { event.preventDefault(); if (submissionStarted.current || submit.isPending || submission) return; if (!validateStep()) return; if (!consent) return showNotice('Please confirm your consent before submitting.'); submissionStarted.current = true; submit.mutate(); };
  if (submission) return <><ThankYou submission={submission}/><Snackbar notice={notice} onClose={() => setNotice(null)}/></>;
  return (
    <main className="min-h-screen bg-[#f7f7f2]">
      <header className="bg-[#0a1d31] px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/sell-your-car" className="flex items-center gap-3 text-white">
            <img src={reveloLogo} alt="ReVelo" className="h-10 w-10 object-contain" />
            <b className="text-xl">ReVelo</b>
          </Link>
          <span className="text-sm text-slate-300">Sell your car</span>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#547437]">Seller enquiry</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#10253b] sm:text-4xl">
            A few details, one step at a time.
          </h1>
        </div>
        <Progress current={step} />
        {config.isLoading && <div className="mt-8 rounded-2xl bg-white p-8 text-slate-500 shadow-sm">Loading form…</div>}
        {config.isError && <div className="mt-8 rounded-2xl bg-red-50 p-8 text-red-700">The form is temporarily unavailable. Please try again later.</div>}
        {!config.isLoading && !config.isError && (
          <form noValidate className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-9" onSubmit={finish}>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#547437]">Step {step + 1} of 3</p>
            <h2 className="mt-2 text-2xl font-bold text-[#10253b]">{steps[step].title}</h2>
            <p className="mt-2 text-slate-600">{steps[step].copy}</p>
            {step === 0 && <LocationPicker locations={locations} locationId={locationId} setLocationId={setLocationId} />}
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {groups[step].map((field) => (
                <DynamicField key={field._id || field.key} field={field} value={answers[field.key]} onChange={update} />
              ))}
            </div>
            {step === 2 && (
              <div className="mt-7 rounded-xl bg-[#f4f7ec] p-5">
                <p className="flex items-center gap-2 font-bold text-[#10253b]"><LockKeyhole size={17} /> Proof is requested later</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Do not upload Aadhaar, RC, or other sensitive documents here. The assigned team will request proof through a secure private step.
                </p>
                <label className="mt-5 flex gap-3 text-sm leading-6 text-slate-700">
                  <input className="mt-1 h-4 w-4" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>I confirm these details are accurate to the best of my knowledge and consent to ReVelo contacting me.</span>
                </label>
              </div>
            )}
            <input className="hidden" tabIndex="-1" autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              {step ? (
                <button className="inline-flex items-center gap-2 text-sm font-bold text-slate-600" type="button" onClick={() => setStep((current) => current - 1)}>
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <Link className="inline-flex items-center gap-2 text-sm font-bold text-slate-600" to="/sell-your-car">
                  <ArrowLeft size={16} /> Back to overview
                </Link>
              )}
              {step < 2 ? (
                <button className="btn-primary px-5 py-3" type="button" onClick={next}>Continue <ArrowRight size={17} /></button>
              ) : (
                <button className="btn-primary px-5 py-3" disabled={submit.isPending || !locations.length}>
                  {submit.isPending ? 'Submitting…' : <>Submit enquiry <ArrowRight size={17} /></>}
                </button>
              )}
            </div>
          </form>
        )}
      </section>
      <Snackbar notice={notice} onClose={() => setNotice(null)} />
    </main>
  );
}
function Progress({ current }) { return <div className="grid grid-cols-3 gap-2">{steps.map((item, index) => <div key={item.title}><div className={`h-1.5 rounded-full ${index <= current ? 'bg-[#8cad65]' : 'bg-slate-200'}`}/><p className={`mt-2 text-xs font-bold ${index === current ? 'text-[#10253b]' : 'text-slate-400'}`}>{item.title}</p></div>)}</div>; }
function LocationPicker({ locations, locationId, setLocationId }) { const selected = locations.find((location) => location.id === locationId); return <div className="mt-7 rounded-xl bg-[#f4f7ec] p-5"><label className="label block">Nearest ReVelo location<select className="field mt-2" value={locationId} onChange={(event) => setLocationId(event.target.value)}><option value="">Select a location</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.label}</option>)}</select></label><p className="mt-3 text-sm text-slate-600">{selected ? `Your enquiry will be privately routed to the team serving ${selected.label}.` : 'Choose the location nearest to where the vehicle can be inspected.'}</p>{!locations.length && <p className="mt-3 text-sm text-amber-700">No public location is currently available.</p>}</div>; }
function validateField(field, value) {
  const text = String(value ?? '').trim();
  if (field.required && !text) return `${field.label} is required.`;
  if (!text) return '';
  if (field.key === 'email' || field.type === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text) ? '' : 'Enter a valid email address.';
  }
  if (field.type === 'tel' || /phone|mobile/i.test(field.key)) {
    const digits = text.replace(/\D/g, '');
    return /^\+?[0-9\s()-]+$/.test(text) && digits.length >= 7 && digits.length <= 15 ? '' : 'Enter a valid phone number with 7 to 15 digits.';
  }
  if (field.key === 'postalCode' && !/^\d{6}$/.test(text)) return 'Enter a valid 6-digit pincode.';
  if (field.key === 'registration' && !/[a-z0-9]/i.test(text)) return 'Enter a valid vehicle registration number.';
  if (field.type === 'number') {
    const number = Number(text);
    if (!Number.isFinite(number)) return `Enter a valid ${field.label.toLowerCase()}.`;
    if (['odometer', 'expectedPrice'].includes(field.key) && number < 0) return `${field.label} cannot be negative.`;
    if (field.key === 'year' && (!Number.isInteger(number) || number < 1900 || number > new Date().getFullYear() + 1)) return 'Enter a valid vehicle year.';
  }
  if (field.type === 'date' && Number.isNaN(Date.parse(text))) return `Enter a valid ${field.label.toLowerCase()}.`;
  if (field.type === 'select' && !(field.options || []).includes(text)) return `Choose a valid option for ${field.label.toLowerCase()}.`;
  return '';
}
function DynamicField({ field, value, onChange }) { const common = { className: 'field mt-2', required: field.required, value: value ?? '', onChange: (event) => onChange(field.key, event.target.value) }; return <label className={`label block ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>{field.label}{field.required && <span className="ml-1 text-red-500">*</span>}{field.type === 'textarea' ? <textarea {...common} className="field mt-2 min-h-28"/> : field.type === 'select' ? <select {...common}><option value="">Select…</option>{(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}</select> : field.type === 'boolean' ? <select className="field mt-2" required={field.required} value={value === undefined ? '' : String(value)} onChange={(event) => onChange(field.key, event.target.value === '' ? '' : event.target.value === 'true')}><option value="">Select…</option><option value="true">Yes</option><option value="false">No</option></select> : <input {...common} type={field.type}/>}</label>; }
function ThankYou({ submission }) { return <main className="grid min-h-screen place-items-center bg-[#f7f7f2] p-5"><section className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600"/><p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Enquiry received</p><h1 className="mt-2 text-3xl font-bold text-[#10253b]">Thanks — we have your details.</h1><p className="mt-4 text-slate-600">{submission.message}</p><div className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 text-left text-sm"><p><span className="text-slate-500">Seller ID</span><br/><b>{submission.sellerReference}</b></p><p><span className="text-slate-500">Enquiry reference</span><br/><b>{submission.enquiryReference}</b></p></div><Link className="btn-secondary mt-6" to="/sell-your-car">Back to overview</Link></section></main>; }
function Snackbar({ notice, onClose }) { if (!notice) return null; const success = notice.type === 'success'; const Icon = success ? CheckCircle2 : AlertCircle; return <div role={success ? 'status' : 'alert'} aria-live={success ? 'polite' : 'assertive'} className={`fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2.5rem)] max-w-lg -translate-x-1/2 items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-xl sm:left-auto sm:right-5 sm:w-auto sm:translate-x-0 ${success ? 'bg-emerald-700' : 'bg-red-700'}`}><Icon size={18}/><span className="flex-1">{notice.message}</span><button className="rounded p-1 hover:bg-white/10" aria-label="Dismiss notification" onClick={onClose}><X size={16}/></button></div>; }
