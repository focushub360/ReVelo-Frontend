import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, LocateFixed, MapPin, Phone, RefreshCw, X } from 'lucide-react';
import { api } from '../../lib/api.js';

const checks = [
  ['ownerIdentityMatched', 'Seller identity matched in person'], ['rcMatched', 'RC / registration details matched'],
  ['chassisMatched', 'Chassis number matched'], ['engineMatched', 'Engine number matched'],
  ['keysReceived', 'All keys received and counted'], ['odometerRecorded', 'Odometer reading recorded'],
  ['exteriorChecked', 'Exterior and visible damage checked'],
];
const evidence = ['number-plate', 'odometer', 'front-exterior', 'rear-exterior', 'left-side', 'right-side', 'interior', 'existing-damage', 'road-test'];
const requiredEvidence = ['number-plate', 'odometer', 'front-exterior', 'rear-exterior'];
const dateTime = (date) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
const toLocal = (date) => new Date(new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const formatAddress = (address) => [
  `Full address: ${address.formattedAddress || 'Unavailable'}`,
  `Street/road: ${address.street || 'Unavailable'}`,
  `Area/locality: ${address.locality || 'Unavailable'}`,
  `City: ${address.city || 'Unavailable'}`,
  `District: ${address.district || 'Unavailable'}`,
  `State: ${address.state || 'Unavailable'}`,
  `PIN code: ${address.postalCode || 'Unavailable'}`,
  `Country: ${address.country || 'Unavailable'}`,
].join(' · ');
const distanceInMeters = (first, second) => {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(second.latitude - first.latitude);
  const longitudeDelta = radians(second.longitude - first.longitude);
  const value = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(first.latitude)) * Math.cos(radians(second.latitude)) *
    Math.sin(longitudeDelta / 2) ** 2;
  const boundedValue = Math.min(1, Math.max(0, value));
  return 6371000 * 2 * Math.atan2(Math.sqrt(boundedValue), Math.sqrt(1 - boundedValue));
};

export function PhysicalIntakeCalendar() {
  const client = useQueryClient();
  const [booking, setBooking] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ enquiry: '', startsAt: '', locationLabel: '', notes: '' });
  const appointments = useQuery({ queryKey: ['intake-appointments'], queryFn: () => api.get('/intake-appointments').then((r) => r.data) });
  const enquiries = useQuery({ queryKey: ['intake-calendar-enquiries'], queryFn: () => api.get('/enquiries', { params: { limit: 100 } }).then((r) => r.data.items || r.data) });
  const save = useMutation({
    mutationFn: () => { const start = new Date(form.startsAt); return api.post(`/enquiries/${form.enquiry}/intake-appointments`, { ...form, startsAt: start, endsAt: new Date(start.getTime() + 45 * 60000), notes: form.notes || undefined }); },
    onSuccess: () => { setBooking(false); setForm({ enquiry: '', startsAt: '', locationLabel: '', notes: '' }); client.invalidateQueries({ queryKey: ['intake-appointments'] }); },
  });
  const rows = useMemo(() => (appointments.data || []).filter((item) => item.status !== 'Cancelled' && new Date(item.endsAt) >= new Date()), [appointments.data]);
  const error = save.error?.response?.data?.error?.message;
  return <>
    <section className="mt-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-navy to-[#135584] px-6 py-6 text-white md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#cceb71]">Service Advisor workspace</p><h1 className="mt-2 text-2xl font-bold">Physical Intake</h1><p className="mt-2 text-sm text-slate-200">Schedule visits, record on-site checks, then hand suitable vehicles to the Senior Technician.</p></div><button className="btn-primary bg-sky hover:bg-sky/90" onClick={() => setBooking(true)}><CalendarDays size={17}/>Start physical intake</button></section>
    <section className="card mt-6 overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-navy">Upcoming visits</h2><p className="mt-1 text-sm text-slate-500">Your confirmed physical-intake appointments.</p></div><span className="badge bg-sky/10 text-sky">{rows.length} scheduled</span></div>{rows.length ? <div className="overflow-x-auto"><table className="table min-w-[960px]"><thead><tr><th>Appointment</th><th>Seller</th><th>Vehicle</th><th>Location</th><th>Status</th><th className="text-right">Action</th></tr></thead><tbody>{rows.map((item) => <tr key={item._id}><td className="font-semibold text-navy">{dateTime(item.startsAt)}</td><td><p className="font-semibold text-navy">{item.party?.name || 'Seller'}</p>{item.party?.phone && <a className="mt-1 flex items-center gap-1 text-xs text-sky" href={`tel:${item.party.phone}`}><Phone size={13}/>{item.party.phone}</a>}</td><td><p className="font-semibold text-navy">{item.vehicle?.registration || 'Registration pending'}</p><p className="mt-1 text-xs text-slate-500">{[item.vehicle?.make, item.vehicle?.model].filter(Boolean).join(' ')}</p></td><td><span className="flex items-center gap-1 text-sm text-slate-600"><MapPin size={14}/>{item.locationLabel}</span></td><td><span className="badge bg-emerald-50 text-emerald-700">{item.status}</span></td><td className="text-right"><button className="btn-primary px-3 py-2 text-xs" onClick={() => setSelected(item)}>Complete intake</button></td></tr>)}</tbody></table></div> : <p className="p-8 text-center text-sm text-slate-500">No upcoming visits yet.</p>}</section>
    {booking && <BookingModal form={form} setForm={setForm} enquiries={enquiries.data || []} saving={save.isPending} error={error} close={() => setBooking(false)} submit={() => save.mutate()}/>} 
    {selected && <IntakeModal appointment={selected} close={() => setSelected(null)} refreshed={() => client.invalidateQueries({ queryKey: ['intake-appointments'] })}/>} 
  </>;
}

function BookingModal({ form, setForm, enquiries, saving, error, close, submit }) {
  return <Modal title="Start physical intake" subtitle="Book a 45-minute seller visit. A 20-minute buffer is automatically reserved." close={close}><form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit(); }}><label className="label">Seller enquiry<select required className="field mt-2" value={form.enquiry} onChange={(e) => setForm({ ...form, enquiry: e.target.value })}><option value="">Select seller case…</option>{enquiries.map((item) => <option key={item._id} value={item._id}>{item.enquiryCode} · {item.vehicle?.registration || 'Registration pending'} · {item.person?.name || 'Seller'}</option>)}</select></label><label className="label">Visit date and time<input required className="field mt-2" type="datetime-local" min={toLocal(new Date())} value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })}/></label><label className="label">Meeting location<input required className="field mt-2" minLength="2" value={form.locationLabel} placeholder="Example: ReVelo Vellore inspection bay" onChange={(e) => setForm({ ...form, locationLabel: e.target.value })}/></label><label className="label">Advisor notes <span className="font-normal text-slate-400">(optional)</span><input className="field mt-2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}/></label><div className="flex gap-3 md:col-span-2"><button className="btn-primary" disabled={saving}>{saving ? 'Booking…' : 'Book physical intake'}</button><button type="button" className="btn-secondary" onClick={close}>Cancel</button></div>{error && <p className="text-sm text-red-700 md:col-span-2">{error}</p>}</form></Modal>;
}

function IntakeModal({ appointment, close, refreshed }) {
  const client = useQueryClient(); const [step, setStep] = useState(1); const [location, setLocation] = useState(null); const [address, setAddress] = useState(''); const [geoError, setGeoError] = useState(''); const [capturing, setCapturing] = useState(false); const [answers, setAnswers] = useState(Object.fromEntries(checks.map(([key]) => [key, null]))); const [data, setData] = useState({ odometer: '', parkingSlot: '', completed: '', duration: '', start: '', end: '', observations: '', notes: '' }); const [intake, setIntake] = useState(null); const [photos, setPhotos] = useState([]); const [rejecting, setRejecting] = useState(false); const [reason, setReason] = useState(''); const [message, setMessage] = useState('');
  const lastGeocoded = useRef(null);
  const slots = useQuery({ queryKey: ['intake-parking-slots'], queryFn: () => api.get('/parking/slots', { params: { limit: 100 } }).then((r) => r.data.items || r.data) });
  const available = (slots.data || []).filter((slot) => ['Available', 'Reserved'].includes(slot.status) && slot.type === 'parking' && slot.enabled !== false);
  const arrivalReady = Object.values(answers).every((value) => typeof value === 'boolean') && location && !capturing && data.odometer !== '' && data.parkingSlot;
  const roadReady = data.completed !== '' && data.duration !== '' && data.start !== '' && data.end !== '' && Number(data.end) >= Number(data.start);
  const complete = useMutation({ mutationFn: () => api.post(`/intake-appointments/${appointment._id}/complete`, { parkingSlot: data.parkingSlot, odometer: Number(data.odometer), physicalChecks: answers, liveLocation: location, roadTest: { completed: data.completed === 'yes', durationMinutes: Number(data.duration), startMileage: Number(data.start), endMileage: Number(data.end), observations: data.observations || undefined }, advisorNotes: data.notes || undefined }), onSuccess: (r) => { setIntake(r.data); refreshed(); } });
  const upload = useMutation({ mutationFn: () => { const body = new FormData(); photos.forEach((item) => body.append('photos', item.file)); body.append('categories', JSON.stringify(photos.map((item) => item.category))); return api.post(`/vehicle-intakes/${intake._id}/photos`, body); } });
  const handoff = useMutation({ mutationFn: () => api.post(`/vehicle-intakes/${intake._id}/handoff-to-technician`), onSuccess: () => { refreshed(); close(); } });
  const reject = useMutation({ mutationFn: () => api.post(`/vehicle-intakes/${intake._id}/reject`, { reason }), onSuccess: () => { refreshed(); close(); } });
  const lookupAddress = async (point) => {
    if (!navigator.onLine) {
      setAddress('Address lookup unavailable; raw GPS coordinates are shown below.');
      setGeoError('No internet connection. The GPS coordinates were captured, but the address could not be looked up.');
      return;
    }
    try {
      const response = await api.post('/intake-location/reverse-geocode', {
        latitude: point.latitude,
        longitude: point.longitude,
      });
      const resolvedAddress = response.data;
      lastGeocoded.current = { point, address: resolvedAddress };
      setLocation((current) => current ? { ...current, address: resolvedAddress } : current);
      setAddress(formatAddress(resolvedAddress));
    } catch (error) {
      setAddress('Address lookup failed; raw GPS coordinates are shown below.');
      setGeoError(
        navigator.onLine
          ? error.response?.data?.error?.message || 'Address lookup failed. The GPS coordinates were captured.'
          : 'No internet connection. The GPS coordinates were captured, but the address could not be looked up.'
      );
    }
  };
  const capture = (forceAddressRefresh = false) => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('This browser does not support GPS location.');
      return;
    }
    setCapturing(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const point = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      setLocation(point);
      setAddress('');
      const previous = lastGeocoded.current;
      const movedMoreThan50Meters = !previous || distanceInMeters(previous.point, point) > 50;
      if (!movedMoreThan50Meters && !forceAddressRefresh) {
        setLocation({ ...point, address: previous.address });
        setAddress(formatAddress(previous.address));
        setCapturing(false);
        return;
      }
      await lookupAddress(point);
      setCapturing(false);
    }, (error) => {
      setCapturing(false);
      const message = error.code === 1
        ? 'Location permission was denied. Allow location access in the browser and retry.'
        : error.code === 2
          ? 'GPS location is unavailable. Turn on device location services and try again.'
          : error.code === 3
            ? 'GPS timed out. Move outdoors and retry.'
            : 'Could not capture GPS location. Please try again.';
      setGeoError(message);
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  };
  const refreshAddress = async () => {
    if (!location) return;
    setGeoError('');
    setAddress('');
    setCapturing(true);
    await lookupAddress(location);
    setCapturing(false);
  };
  const uploadReady = upload.isSuccess && requiredEvidence.every((category) => photos.some((photo) => photo.category === category)); const error = complete.error?.response?.data?.error?.message || upload.error?.response?.data?.error?.message || handoff.error?.response?.data?.error?.message || reject.error?.response?.data?.error?.message;
  if (intake) return <Modal title="Vehicle evidence and decision" subtitle="Upload required vehicle evidence before handing off. Customer identity documents are excluded." close={close}><Evidence photos={photos} setPhotos={setPhotos} upload={upload}/><div className="mt-6 rounded-xl border border-sky/20 bg-sky/5 p-4"><p className="font-bold text-navy">Next decision</p><p className="mt-1 text-sm text-slate-600">Senior Technician receives only vehicle, parking, physical checks, road-test, evidence, and advisor notes.</p><div className="mt-4 flex flex-wrap gap-3"><button className="btn-primary" disabled={!uploadReady || handoff.isPending} onClick={() => handoff.mutate()}>Proceed to Senior Technician</button><button className="btn-secondary text-red-700" onClick={() => setRejecting(true)}>Reject seller vehicle</button></div>{!uploadReady && <p className="mt-2 text-xs text-amber-800">Upload number plate, odometer, front exterior, and rear exterior photos first.</p>}</div>{rejecting && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"><p className="font-bold text-red-800">Reject seller vehicle</p><textarea className="field mt-3 min-h-24" value={reason} placeholder="Exact mandatory rejection reason" onChange={(e) => setReason(e.target.value)}/><div className="mt-3 flex gap-2"><button className="btn-secondary" onClick={() => setRejecting(false)}>Cancel</button><button className="btn-primary bg-red-600 hover:bg-red-700" disabled={reason.trim().length < 3 || reject.isPending} onClick={() => reject.mutate()}>Confirm rejection</button></div></div>}{error && <p className="mt-4 text-sm text-red-700">{error}</p>}</Modal>;
  return (
    <Modal
      title={step === 1 ? 'Step 1 of 2 · Arrival & verification' : 'Step 2 of 2 · Road test & notes'}
      subtitle={`${appointment.vehicle?.registration || 'Seller vehicle'} · ${appointment.party?.name || 'Seller'}`}
      close={close}
    >
      {step === 1 ? (
        <>
          <p className="text-sm text-slate-500">Record every physical check as Yes or No.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {checks.map(([key, label]) => (
              <div className="rounded-xl border border-slate-200 p-3" key={key}>
                <p className="text-sm font-semibold text-navy">{label}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    className={answers[key] === true ? 'btn-primary px-3 py-1.5 text-xs' : 'btn-secondary px-3 py-1.5 text-xs'}
                    onClick={() => setAnswers({ ...answers, [key]: true })}
                  >Yes</button>
                  <button
                    className={answers[key] === false ? 'rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white' : 'btn-secondary px-3 py-1.5 text-xs text-red-700'}
                    onClick={() => setAnswers({ ...answers, [key]: false })}
                  >No</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
            <label className="label">
              Arrival odometer (km)
              <input className="field mt-2" type="number" min="0" value={data.odometer} onChange={(event) => setData({ ...data, odometer: event.target.value })} />
            </label>
            <div>
              <p className="label">Live location</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="btn-secondary" disabled={capturing} onClick={() => capture(Boolean(location))}>
                  <LocateFixed size={16} />
                  {capturing ? 'Capturing…' : location ? 'Refresh location' : 'Capture current location'}
                </button>
                {location && (
                  <button className="btn-secondary" disabled={capturing} onClick={refreshAddress}>
                    <RefreshCw size={16} /> Refresh address
                  </button>
                )}
              </div>
              {location && (
                <div aria-live="polite" className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <p className="break-words font-bold">{address || 'Resolving address…'}</p>
                  <p className="mt-1">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} · ±{Math.round(location.accuracy || 0)} m
                  </p>
                  <a
                    className="mt-1 inline-block font-semibold text-sky"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                  >Open exact point on map</a>
                </div>
              )}
              {geoError && <p role="alert" className="mt-2 text-xs text-red-700">{geoError}</p>}
            </div>
            <label className="label md:col-span-2">
              Released parking slot
              <select className="field mt-2" value={data.parkingSlot} onChange={(event) => setData({ ...data, parkingSlot: event.target.value })}>
                <option value="">Select released parking slot…</option>
                {available.map((slot) => <option key={slot._id} value={slot._id}>{slot.code} · Parking</option>)}
              </select>
              <span className="mt-1 block text-xs font-normal text-slate-500">
                At technician handoff, this slot is released automatically and the vehicle is moved to an available inspection slot.
              </span>
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              className="btn-primary"
              onClick={() => {
                if (!arrivalReady) return setMessage('Complete every check, capture location, enter odometer, and select a slot.');
                setMessage('');
                setStep(2);
              }}
            >Continue to road test</button>
          </div>
          {message && <p className="mt-3 text-sm text-amber-800">{message}</p>}
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">
              Road test completed?
              <select className="field mt-2" value={data.completed} onChange={(event) => setData({ ...data, completed: event.target.value })}>
                <option value="">Select…</option><option value="yes">Yes</option><option value="no">No</option>
              </select>
            </label>
            <label className="label">Duration (minutes)<input className="field mt-2" type="number" min="0" value={data.duration} onChange={(event) => setData({ ...data, duration: event.target.value })} /></label>
            <label className="label">Start kilometres<input className="field mt-2" type="number" min="0" value={data.start} onChange={(event) => setData({ ...data, start: event.target.value })} /></label>
            <label className="label">End kilometres<input className="field mt-2" type="number" min="0" value={data.end} onChange={(event) => setData({ ...data, end: event.target.value })} /></label>
            <label className="label md:col-span-2">Road-test observations<textarea className="field mt-2 min-h-24" value={data.observations} onChange={(event) => setData({ ...data, observations: event.target.value })} /></label>
            <label className="label md:col-span-2">Advisor notes<textarea className="field mt-2 min-h-24" value={data.notes} onChange={(event) => setData({ ...data, notes: event.target.value })} /></label>
          </div>
          <div className="mt-6 flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button
              className="btn-primary"
              disabled={complete.isPending}
              onClick={() => {
                if (!roadReady) return setMessage('Record road-test completion, duration, and start/end kilometres.');
                setMessage('');
                complete.mutate();
              }}
            >{complete.isPending ? 'Saving…' : 'Complete physical intake'}</button>
          </div>
          {message && <p className="mt-3 text-sm text-amber-800">{message}</p>}
        </>
      )}
    </Modal>
  );
}

function Evidence({ photos, setPhotos, upload }) {
  const setPhoto = (category, file) => setPhotos((current) => {
    const remaining = current.filter((item) => item.category !== category);
    return file ? [...remaining, { category, file }] : remaining;
  });
  return <section><h3 className="font-bold text-navy">Vehicle evidence photos</h3><p className="mt-1 text-sm text-slate-500">Upload each image in its own field. Number plate, odometer, front exterior, and rear exterior are required.</p><div className="mt-4 grid gap-4 md:grid-cols-2">{evidence.map((category) => { const selected = photos.find((item) => item.category === category); const required = requiredEvidence.includes(category); return <label className="rounded-xl border border-slate-200 p-4" key={category}><span className="block text-sm font-bold capitalize text-navy">{category.replace(/-/g, ' ')} {required && <span className="text-red-600">*</span>}</span><input className="field mt-3 text-sm" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={(event) => setPhoto(category, event.target.files?.[0])}/><span className={`mt-2 block text-xs ${selected ? 'text-emerald-700' : 'text-slate-500'}`}>{selected ? `Selected: ${selected.file.name}` : required ? 'Required image' : 'Optional image'}</span></label>; })}</div><button className="btn-secondary mt-5" disabled={!photos.length || upload.isPending} onClick={() => upload.mutate()}>{upload.isPending ? 'Uploading…' : upload.isSuccess ? 'Evidence uploaded' : 'Upload evidence securely'}</button></section>;
}
function Modal({ title, subtitle, close, children }) { return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"><section className="mx-auto my-4 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"><header className="flex items-start justify-between bg-navy px-6 py-5 text-white"><div><h2 className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-slate-200">{subtitle}</p></div><button className="rounded-lg p-2 hover:bg-white/10" onClick={close}><X size={20}/></button></header><div className="p-6">{children}</div></section></div>; }
