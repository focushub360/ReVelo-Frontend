import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHero } from '../components/layout/PageHero.jsx';
import { display, recordColumns, recordEditing } from './records/recordConfig.js';
import { RecordActions } from '../components/records/RecordActions.jsx';
import { ParkingYardBoard } from '../components/records/ParkingYardBoard.jsx';
import { AcquisitionSellerOffers } from '../components/records/AcquisitionSellerOffers.jsx';
import { ReviewBlock, yesNo } from '../components/records/ReviewBlock.jsx';

export function Records({ title, endpoint, onAddSpace, canManageVehicles = false }) {
  const [selectedEnquiryId, setSelectedEnquiryId] = useState('');
  const q = useQuery({
    queryKey: [endpoint],
    queryFn: () =>
      api
        .get(`/${endpoint}`, {
          params: endpoint === 'parking/slots' ? { limit: 100 } : undefined,
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
      />
    );
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
                            {endpoint === 'inspections' &&
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
                    <div className="md:col-span-2 rounded-xl bg-slate-50 p-4"><p className="font-semibold text-navy">Accident or major repair declaration</p><p className="mt-2 whitespace-pre-wrap text-slate-600">{enquiry.declaredAccidentHistory || 'None provided'}</p></div>
                    <p className="md:col-span-2 text-xs leading-5 text-slate-500">This is an initial customer declaration. Request proof through the upcoming secure private workflow; do not request Aadhaar or RC files through email or WhatsApp.</p>
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
