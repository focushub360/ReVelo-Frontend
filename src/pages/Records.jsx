import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHero } from '../components/layout/PageHero.jsx';
import { display, recordColumns, recordEditing } from './records/recordConfig.js';
import { RecordActions } from '../components/records/RecordActions.jsx';
import { ParkingYardBoard } from '../components/records/ParkingYardBoard.jsx';
import { AcquisitionSellerOffers } from '../components/records/AcquisitionSellerOffers.jsx';
import { ReviewBlock, yesNo } from '../components/records/ReviewBlock.jsx';
import { VerificationRequestButton } from '../components/records/VerificationRequestButton.jsx';

export function Records({ title, endpoint, onAddSpace, canManageVehicles = false, canConfigureParking = false }) {
  const [selectedEnquiryId, setSelectedEnquiryId] = useState('');
  const [enquiryPage, setEnquiryPage] = useState(1);
  const q = useQuery({
    queryKey: [endpoint, endpoint === 'enquiries' ? enquiryPage : null],
    queryFn: () =>
      api
        .get(`/${endpoint}`, {
          params: endpoint === 'parking/slots' ? { limit: 100 } : endpoint === 'enquiries' ? { page: enquiryPage, limit: 20 } : undefined,
        })
        .then((r) => r.data),
    retry: false,
  });
  const enquiryDetail = useQuery({
    queryKey: ['enquiry-review', selectedEnquiryId],
    queryFn: () => api.get(`/enquiries/${selectedEnquiryId}`).then((response) => response.data),
    enabled: endpoint === 'enquiries' && Boolean(selectedEnquiryId),
    retry: false,
  });
  const rows = Array.isArray(q.data) ? q.data : q.data?.items || [];
  const hasActions = Boolean(recordEditing[endpoint]) || endpoint === 'enquiries';
  const columns =
    endpoint === 'enquiries'
      ? [
          ...recordEditing.enquiries.fields.map(([key, label]) => [key, label]),
          ['vehicle', 'Vehicle enquiry raised for'],
        ]
      : endpoint === 'work-orders'
        ? [['vehicle', 'Vehicle'], ...recordEditing['work-orders'].fields.map(([key, label]) => [key, label])]
        : recordEditing[endpoint]?.fields.map(([key, label]) => [key, label]) ||
        recordColumns[endpoint] || [
          ['createdAt', 'Created'],
          ['status', 'Status'],
        ];
  const active = rows.filter((row) =>
    ['Open', 'Assigned', 'In Progress', 'Occupied', 'Reserved', 'Active'].includes(row.status)
  ).length;
  if (endpoint === 'parking/slots')
    return (
      <ParkingYardBoard
        title={title}
        rows={rows}
        loading={q.isLoading}
        error={q.error}
        onAddSpace={onAddSpace}
        canConfigure={canConfigureParking}
      />
    );
  if (endpoint === 'enquiries')
    return <SellerEnquiryQueue rows={rows} total={q.data?.total ?? rows.length} page={q.data?.page || enquiryPage} pages={q.data?.pages || 1} loading={q.isLoading} error={q.error} selectedId={selectedEnquiryId} onSelect={setSelectedEnquiryId} onPage={setEnquiryPage} detail={enquiryDetail} onClose={() => setSelectedEnquiryId('')} />;
  return (
    <>
      <PageHero
        eyebrow="Operational register"
        title={title}
        description="Review live dealership records, current workflow states, and authorised operational context."
      >
        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right backdrop-blur">
          <p className="text-xs text-slate-200">Records shown</p>
          <p className="text-2xl font-bold">{q.data?.total ?? rows.length}</p>
        </div>
      </PageHero>
      {q.isLoading && <div className="card mt-6 p-6 text-slate-500">Loading live records…</div>}
      {q.isError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {q.error?.response?.data?.error?.message || 'Unable to load records.'}
        </div>
      )}
      {!q.isLoading && !q.isError && (
        <>
          {endpoint === 'sales' && <AcquisitionSellerOffers />}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="card p-4">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Total records</p>
              <p className="mt-2 text-2xl font-bold text-navy">{q.data?.total ?? rows.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Active now</p>
              <p className="mt-2 text-2xl font-bold text-navy">{active}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Latest update</p>
              <p className="mt-2 text-base font-bold text-navy">
                {rows[0]?.updatedAt ? new Date(rows[0].updatedAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
          <div className="card mt-6 overflow-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-navy">Authorised records</h2>
                <p className="mt-1 text-xs text-slate-500">Live data from your secured workspace</p>
              </div>
              <span className="rounded-full bg-[#eef7dc] px-3 py-1 text-xs font-semibold text-[#457412]">
                Live register
              </span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  {columns.map(([, label]) => (
                    <th key={label} scope="col">{label}</th>
                  ))}
                  {endpoint === 'enquiries' && <th scope="col">Review</th>}
                  {recordEditing[endpoint] && <th scope="col">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((row, index) => (
                    <tr key={row._id || index}>
                      {columns.map(([key]) => (
                        <td key={key}>
                          <span
                            className={
                              key === 'status' || key === 'lifecycle'
                                ? 'badge bg-slate-100 text-slate-700'
                                : ''
                            }
                          >
                            {endpoint === 'work-orders' && ['estimatedLabour', 'estimatedParts'].includes(key) && !Number(row[key])
                              ? 'Awaiting technician estimate'
                              : endpoint === 'inspections' &&
                            key === 'assignedTo' &&
                            typeof row[key] === 'object'
                              ? `${row[key].name || 'Employee'} · ${row[key].operationalProfile || row[key].role || 'Employee'}`
                              : endpoint === 'enquiries' && key === 'vehicle'
                                ? [
                                    row.vehicle?.registration || row.vehicle?.vehicleCode,
                                    [row.vehicle?.make, row.vehicle?.model, row.vehicle?.variant]
                                      .filter(Boolean)
                                      .join(' '),
                                  ]
                                    .filter(Boolean)
                                    .join(' · ') || '—'
                                : display(row[key])}
                          </span>
                        </td>
                      ))}
                      {endpoint === 'enquiries' && (
                        <td>
                          <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setSelectedEnquiryId(row._id)}>
                            Review
                          </button>
                        </td>
                      )}
                      {recordEditing[endpoint] && (
                        <td>
                          <RecordActions
                            endpoint={endpoint}
                            row={row}
                            canManageVehicles={canManageVehicles}
                          />
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + (endpoint === 'enquiries' ? 2 : hasActions ? 1 : 0)}
                      className="py-14 text-center text-slate-500"
                    >
                      <p className="font-semibold text-navy">No records yet</p>
                      <p className="mt-1 text-sm">
                        New authorised records will appear here as workflow activity begins.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {q.data?.pages > 1 && (
              <p className="border-t px-5 py-3 text-sm text-slate-500">
                Page {q.data.page} of {q.data.pages} · {q.data.total} records
              </p>
            )}
          </div>
          {selectedEnquiryId && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="Seller enquiry review">
              <section className="card max-h-[90vh] w-full max-w-3xl overflow-auto p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Protected seller review</p>
                    <h2 className="mt-1 text-xl font-bold text-navy">{enquiryDetail.data?.enquiry?.enquiryCode || 'Seller enquiry'}</h2>
                  </div>
                  <button className="icon-btn" onClick={() => setSelectedEnquiryId('')} aria-label="Close review"><X size={17} /></button>
                </div>
                {enquiryDetail.isLoading && <p className="mt-6 text-sm text-slate-500">Loading submitted details…</p>}
                {enquiryDetail.isError && <p className="mt-6 text-sm text-red-700">{errorMessage(enquiryDetail.error, 'Unable to load this enquiry.')}</p>}
                {enquiryDetail.data && (() => {
                  const { enquiry } = enquiryDetail.data;
                  const submission = enquiry.publicSubmission;
                  return <div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
                    <ReviewBlock title="Seller" items={[["Name", enquiry.person?.name], ["Phone", enquiry.person?.phone], ["Email", enquiry.person?.email], ["Seller ID", enquiry.person?.customerReference]]} />
                    <ReviewBlock title="Vehicle" items={[["Registration", enquiry.vehicle?.registration], ["Vehicle", [enquiry.vehicle?.make, enquiry.vehicle?.model].filter(Boolean).join(' ')], ["Year", enquiry.vehicle?.year], ["Odometer", enquiry.vehicle?.odometer ? `${enquiry.vehicle.odometer.toLocaleString()} km` : '—']]} />
                    <ReviewBlock title="Address" items={[["Address", submission?.address ? [submission.address.line1, submission.address.locality, submission.address.city, submission.address.state, submission.address.postalCode].filter(Boolean).join(', ') : '—'], ["Nearest location", [submission?.nearestLocation?.city, submission?.nearestLocation?.state].filter(Boolean).join(', ')]]} />
                    <ReviewBlock title="Declarations" items={[["Owner count", submission?.ownerCount], ["First owner", yesNo(submission?.isFirstOwner)], ["RC available", yesNo(submission?.rcAvailable)], ["Insurance renewal", submission?.insuranceRenewalDate ? new Date(submission.insuranceRenewalDate).toLocaleDateString() : '—'], ["Active loan / hypothecation", yesNo(submission?.hasActiveLoan)], ["Loan provider", submission?.loanProvider], ["Proof status", submission?.proofStatus || 'Not requested']]} />
                    {submission?.customFields?.length ? <ReviewBlock title="Additional submitted details" items={submission.customFields.map((field) => [field.label, typeof field.value === 'boolean' ? yesNo(field.value) : String(field.value)])} /> : null}
                    {enquiryDetail.data.verification?.declaration && <ReviewBlock title="Private verification details" items={[["Loan / hypothecation", yesNo(enquiryDetail.data.verification.declaration.hasLoan)], ["Loan provider", enquiryDetail.data.verification.declaration.loanProvider], ["Loan reference", enquiryDetail.data.verification.declaration.loanReference], ["Outstanding amount", enquiryDetail.data.verification.declaration.outstandingAmount ? `₹${Number(enquiryDetail.data.verification.declaration.outstandingAmount).toLocaleString('en-IN')}` : '—'], ["Previous owners", enquiryDetail.data.verification.declaration.previousOwners?.length ? enquiryDetail.data.verification.declaration.previousOwners.map((owner, index) => `Owner ${index + 1}: ${[owner.name, owner.phone, owner.address].filter(Boolean).join(' · ')}`).join('\n') : 'None provided']]} />}
                    {enquiryDetail.data.documents?.length ? <PrivateDocumentReview enquiryId={enquiry._id} documents={enquiryDetail.data.documents} /> : null}
                    <div className="md:col-span-2 rounded-xl bg-slate-50 p-4"><p className="font-semibold text-navy">Accident or major repair declaration</p><p className="mt-2 whitespace-pre-wrap text-slate-600">{enquiry.declaredAccidentHistory || 'None provided'}</p></div>
                    <VerificationRequestButton enquiry={enquiry}/>
                  </div>;
                })()}
              </section>
            </div>
          )}
        </>
      )}
    </>
  );
}

function PrivateDocumentReview({ enquiryId, documents }) {
  const queryClient = useQueryClient();
  const [mismatch, setMismatch] = useState(null);
  const [reason, setReason] = useState('');
  const review = useMutation({ mutationFn: ({ id, status, reason }) => api.patch(`/documents/${id}/review`, { status, reason }), onSuccess: () => { setMismatch(null); setReason(''); queryClient.invalidateQueries({ queryKey: ['enquiry-review', enquiryId] }); } });
  return <section className="rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><div><h3 className="font-bold text-navy">Private documents received</h3><p className="mt-1 text-xs text-slate-500">Open each file, then verify it or ask the seller to correct it securely.</p></div></div><div className="mt-3 divide-y divide-slate-100">{documents.map((document) => <div className="flex flex-wrap items-center justify-between gap-3 py-3" key={document._id}><div><p className="font-semibold text-slate-700">{document.category}</p><p className="mt-1 text-xs text-slate-500">{document.originalName || 'Submitted file'} · {document.status || 'Submitted'}{document.reviewReason ? ` · ${document.reviewReason}` : ''}</p></div><div className="flex flex-wrap gap-2"><a className="btn-secondary px-3 py-1.5 text-xs" href={`/api/v1/documents/${document._id}/file`} target="_blank" rel="noopener noreferrer">Open file</a><button className="btn-primary px-3 py-1.5 text-xs" type="button" disabled={review.isPending || document.status === 'Verified'} onClick={() => review.mutate({ id: document._id, status: 'Verified' })}>{document.status === 'Verified' ? 'Verified' : 'Verify'}</button><button className="btn-secondary px-3 py-1.5 text-xs text-red-700" type="button" disabled={review.isPending || ['Verified', 'Mismatch'].includes(document.status)} onClick={() => setMismatch(document)}>{document.status === 'Mismatch' ? 'Correction sent' : 'Mismatch'}</button></div></div>)}</div>{review.isError && <p className="mt-3 text-sm text-red-700">{review.error.response?.data?.error?.message || 'Unable to save verification.'}</p>}{mismatch && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"><p className="font-bold text-red-800">Request a correction for {mismatch.category}</p><p className="mt-1 text-sm text-red-700">Explain exactly what is wrong. This reason and a fresh secure upload link will be emailed to the seller.</p><textarea className="field mt-3 min-h-24" value={reason} onChange={(event) => setReason(event.target.value)} maxLength="2000" placeholder="Example: The RC owner name does not match the seller identity. Please upload the current RC book."/><div className="mt-3 flex justify-end gap-2"><button className="btn-secondary px-3 py-2 text-xs" type="button" onClick={() => { setMismatch(null); setReason(''); }}>Cancel</button><button className="btn-primary bg-red-600 px-3 py-2 text-xs hover:bg-red-700" type="button" disabled={review.isPending || reason.trim().length < 3} onClick={() => review.mutate({ id: mismatch._id, status: 'Mismatch', reason: reason.trim() })}>{review.isPending ? 'Sending…' : 'Send correction request'}</button></div></div>}</section>;
}

function SellerEnquiryQueue({ rows, total, page, pages, loading, error, selectedId, onSelect, onPage, detail, onClose }) {
  const count = (status) => rows.filter((row) => row.publicSubmission?.proofStatus === status).length;
  return <>
    <PageHero eyebrow="Seller acquisition" title="Seller enquiries" description="Review customer details, verify proof, and move only trusted vehicles into physical intake.">
      <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right"><p className="text-xs text-slate-200">Open seller cases</p><p className="text-2xl font-bold">{total}</p></div>
    </PageHero>
    {loading && <div className="card mt-6 p-6 text-slate-500">Loading seller enquiries…</div>}
    {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error.response?.data?.error?.message || 'Unable to load seller enquiries.'}</div>}
    {!loading && !error && <><div className="mt-6 grid gap-4 sm:grid-cols-3"><Metric label="Total enquiries" value={total}/><Metric label="Documents requested" value={count('Requested')}/><Metric label="Proof submitted" value={count('Submitted')}/></div><section className="card mt-6 overflow-hidden"><div className="overflow-x-auto"><table className="table min-w-[1000px]"><thead><tr><th>Seller</th><th>Vehicle</th><th>Location</th><th>Received</th><th>Document status</th><th className="text-right">Action</th></tr></thead><tbody>{rows.length ? rows.map((enquiry) => { const vehicle = enquiry.vehicle || {}; const seller = enquiry.person || {}; const proof = enquiry.publicSubmission?.proofStatus || 'Not Requested'; return <tr key={enquiry._id}><td><p className="font-semibold text-navy">{seller.name || 'Unnamed seller'}</p><p className="mt-1 text-xs text-slate-500">{seller.phone || 'No mobile'}<br/>{seller.email || 'No email'}</p></td><td><p className="font-semibold text-navy">{vehicle.registration || vehicle.vehicleCode || 'Registration pending'}</p><p className="mt-1 text-xs text-slate-500">{[vehicle.year, vehicle.make, vehicle.model, vehicle.fuelType].filter(Boolean).join(' · ') || 'Vehicle details pending'}</p></td><td className="text-sm text-slate-600">{enquiry.publicSubmission?.nearestLocation?.city || '—'}</td><td className="text-sm text-slate-600">{enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : '—'}</td><td><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${proofStyle(proof)}`}>{proofLabel(proof)}</span></td><td className="text-right"><button className="btn-primary px-3 py-2 text-xs" onClick={() => onSelect(enquiry._id)}>Open case</button></td></tr>; }) : <tr><td className="py-14 text-center text-slate-500" colSpan="6">No seller enquiries yet.</td></tr>}</tbody></table></div>{pages > 1 && <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm"><span className="text-slate-500">Page {page} of {pages} · {total} enquiries</span><div className="flex gap-2"><button className="btn-secondary px-3 py-1.5 text-xs" disabled={page === 1} onClick={() => onPage(page - 1)}>Previous</button><button className="btn-secondary px-3 py-1.5 text-xs" disabled={page === pages} onClick={() => onPage(page + 1)}>Next</button></div></div>}</section></>}
    {selectedId && <SellerReviewModal detail={detail} onClose={onClose}/>} {/* review modal */}
  </>;
}

function Metric({ label, value }) { return <div className="card p-5"><p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-navy">{value}</p></div>; }
function proofLabel(status) { return ({ 'Not Requested': 'Needs review', Requested: 'Awaiting customer', Submitted: 'Ready to verify', Verified: 'Verified', Mismatch: 'Mismatch', Rejected: 'Rejected' })[status] || status || 'Needs review'; }
function proofStyle(status) { return ({ Submitted: 'bg-amber-50 text-amber-800', Verified: 'bg-emerald-50 text-emerald-800', Mismatch: 'bg-red-50 text-red-700', Requested: 'bg-sky-50 text-sky-800' })[status] || 'bg-slate-100 text-slate-700'; }
function SellerEnquiryCard({ enquiry, onOpen }) { const vehicle = enquiry.vehicle || {}; const seller = enquiry.person || {}; const proof = enquiry.publicSubmission?.proofStatus || 'Not Requested'; return <article className="card border-l-4 border-l-sky-500 p-5 transition hover:shadow-md"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="grid flex-1 gap-5 sm:grid-cols-3"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Seller</p><p className="mt-1 font-bold text-navy">{seller.name || 'Unnamed seller'}</p><p className="mt-1 text-sm text-slate-500">{seller.phone || 'No mobile'} · {seller.email || 'No email'}</p></div><div><p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Vehicle</p><p className="mt-1 font-bold text-navy">{vehicle.registration || vehicle.vehicleCode || 'Registration pending'}</p><p className="mt-1 text-sm text-slate-500">{[vehicle.year, vehicle.make, vehicle.model, vehicle.fuelType].filter(Boolean).join(' · ') || 'Vehicle details pending'}</p></div><div><p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Verification</p><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${proofStyle(proof)}`}>{proofLabel(proof)}</span><p className="mt-2 text-xs text-slate-500">Received {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'today'}</p></div></div><button className="btn-primary whitespace-nowrap px-4 py-2.5" onClick={onOpen}>Open case</button></div></article>; }

function SellerReviewModal({ detail, onClose }) {
  if (detail.isLoading) return <ModalShell onClose={onClose}><p className="p-8 text-slate-500">Loading seller case…</p></ModalShell>;
  if (detail.isError) return <ModalShell onClose={onClose}><p className="p-8 text-red-700">{detail.error.response?.data?.error?.message || 'Unable to load this seller case.'}</p></ModalShell>;
  const enquiry = detail.data?.enquiry; if (!enquiry) return null;
  const submission = enquiry.publicSubmission || {}; const documents = detail.data.documents || []; const verified = documents.filter((document) => document.status === 'Verified').length; const mismatches = documents.filter((document) => document.status === 'Mismatch').length;
  return <ModalShell onClose={onClose}><div className="border-b border-slate-100 bg-gradient-to-r from-[#071d36] to-[#135584] px-6 py-6 text-white"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#cceb71]">Seller acquisition case</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-bold">{enquiry.vehicle?.registration || 'Vehicle enquiry'}</h2><p className="mt-1 text-sm text-slate-200">{[enquiry.vehicle?.year, enquiry.vehicle?.make, enquiry.vehicle?.model, enquiry.vehicle?.variant].filter(Boolean).join(' · ')}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${proofStyle(submission.proofStatus)}`}>{proofLabel(submission.proofStatus)}</span></div></div><div className="p-6"><div className="grid gap-4 md:grid-cols-3"><Metric label="Documents received" value={documents.length}/><Metric label="Verified" value={verified}/><Metric label="Needs attention" value={mismatches}/></div><div className="mt-6 grid gap-4 lg:grid-cols-3"><ReviewBlock title="Customer" items={[["Name", enquiry.person?.name], ["Mobile", enquiry.person?.phone], ["Email", enquiry.person?.email], ["Seller ID", enquiry.person?.customerReference]]}/><ReviewBlock title="Vehicle details" items={[["Registration", enquiry.vehicle?.registration], ["Fuel / transmission", [enquiry.vehicle?.fuelType, enquiry.vehicle?.transmission].filter(Boolean).join(' / ')], ["Odometer", enquiry.vehicle?.odometer ? `${enquiry.vehicle.odometer.toLocaleString()} km` : '—'], ["Insurance expiry", submission.insuranceRenewalDate ? new Date(submission.insuranceRenewalDate).toLocaleDateString() : '—']]}/><ReviewBlock title="Location & ownership" items={[["Nearest location", [submission.nearestLocation?.city, submission.nearestLocation?.state].filter(Boolean).join(', ')], ["Owner count", submission.ownerCount], ["First owner", yesNo(submission.isFirstOwner)], ["Accident history", enquiry.declaredAccidentHistory || 'None declared']]}/></div>{submission.address && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm"><p className="font-bold text-navy">Customer address</p><p className="mt-1 text-slate-600">{[submission.address.line1, submission.address.locality, submission.address.city, submission.address.state, submission.address.postalCode].filter(Boolean).join(', ')}</p></div>}{detail.data.verification?.declaration && <div className="mt-4"><ReviewBlock title="Private verification declaration" items={[["Active loan", yesNo(detail.data.verification.declaration.hasLoan)], ["Loan provider", detail.data.verification.declaration.loanProvider], ["Loan reference", detail.data.verification.declaration.loanReference], ["Previous owners", detail.data.verification.declaration.previousOwners?.length ? detail.data.verification.declaration.previousOwners.map((owner, index) => `Owner ${index + 1}: ${[owner.name, owner.phone].filter(Boolean).join(' · ')}`).join('\n') : 'None provided']]}/></div>}<div className="mt-6">{documents.length ? <PrivateDocumentReview enquiryId={enquiry._id} documents={documents}/> : <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No documents have been uploaded yet. Send the secure verification link to continue.</div>}</div><div className="mt-6"><VerificationRequestButton enquiry={enquiry}/></div></div></ModalShell>;
}
function ModalShell({ children, onClose }) { return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><section className="mx-auto my-5 w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex justify-end border-b border-slate-100 px-4 py-3"><button className="icon-btn" onClick={onClose} aria-label="Close seller case"><X size={18}/></button></div>{children}</section></div>; }
