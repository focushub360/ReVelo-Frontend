import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHero } from '../components/layout/PageHero.jsx';

export function AcquisitionPage() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [action, setAction] = useState('');
  const [editing, setEditing] = useState(null);
  const [editError, setEditError] = useState('');
  const [workflowError, setWorkflowError] = useState('');
  const [form, setForm] = useState({
    vehicle: '',
    proposedPrice: '',
    refurbishmentEstimate: '0',
    transactionCosts: '0',
    holdingCosts: '0',
    expectedResale: '',
  });
  const acquisitions = useQuery({
    queryKey: ['acquisitions'],
    queryFn: () => api.get('/acquisitions', { params: { limit: 100 } }).then((response) => response.data),
    retry: false,
  });
  const vehicles = useQuery({
    queryKey: ['acquisition-vehicles'],
    queryFn: () => api.get('/vehicles', { params: { limit: 100 } }).then((response) => response.data),
    retry: false,
  });
  const detail = useQuery({
    queryKey: ['acquisition', selectedId],
    queryFn: () => api.get(`/acquisitions/${selectedId}`).then((response) => response.data),
    enabled: Boolean(selectedId),
    retry: false,
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['acquisitions'] });
    qc.invalidateQueries({ queryKey: ['acquisition-offers'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    if (selectedId) qc.invalidateQueries({ queryKey: ['acquisition', selectedId] });
  };
  const create = useMutation({
    mutationFn: () =>
      api.post('/acquisitions', {
        ...form,
        proposedPrice: Number(form.proposedPrice),
        refurbishmentEstimate: Number(form.refurbishmentEstimate),
        transactionCosts: Number(form.transactionCosts),
        holdingCosts: Number(form.holdingCosts),
        expectedResale: Number(form.expectedResale),
      }),
    onSuccess: () => {
      refresh();
      setAdding(false);
      setForm({
        vehicle: '',
        proposedPrice: '',
        refurbishmentEstimate: '0',
        transactionCosts: '0',
        holdingCosts: '0',
        expectedResale: '',
      });
    },
  });
  const editValuation = useMutation({
    mutationFn: () =>
      api.post(`/acquisitions/${editing._id}/valuation`, {
        proposedPrice: Number(editing.proposedPrice),
        refurbishmentEstimate: Number(editing.refurbishmentEstimate),
        transactionCosts: Number(editing.transactionCosts),
        holdingCosts: Number(editing.holdingCosts),
        expectedResale: Number(editing.expectedResale),
        reason: editing.reason,
      }),
    onSuccess: () => {
      refresh();
      setEditing(null);
      setEditError('');
    },
    onError: (error) =>
      setEditError(error.response?.data?.error?.message || 'Unable to update valuation.'),
  });
  const removeAcquisition = useMutation({
    mutationFn: (id) => api.delete(`/acquisitions/${id}`),
    onSuccess: refresh,
    onError: (error) =>
      setWorkflowError(error.response?.data?.error?.message || 'Unable to delete acquisition.'),
  });
  const runAction = useMutation({
    mutationFn: ({ kind, payload }) => {
      const current = detail.data?.acquisition;
      if (!current) throw new Error('Acquisition details are unavailable.');
      if (kind === 'decision')
        return api.post(`/acquisitions/${current._id}/decision`, payload);
      if (kind === 'offer') return api.post(`/acquisitions/${current._id}/offers`, payload);
      if (kind === 'respond') {
        const offer = detail.data.offers?.find((item) => item.status === 'Sent');
        if (!offer) throw new Error('There is no pending seller offer to respond to.');
        return api.post(`/acquisition-offers/${offer._id}/respond`, payload);
      }
      return api.post(`/acquisitions/${current._id}/purchase`, payload);
    },
    onSuccess: () => {
      refresh();
      setAction('');
    },
    onError: (error) =>
      setWorkflowError(error.response?.data?.error?.message || 'Unable to update the acquisition.'),
  });
  const rows = acquisitions.data?.items || [];
  const acquiredVehicleIds = new Set(rows.map((item) => item.vehicle?._id || item.vehicle));
  const availableVehicles = (vehicles.data?.items || []).filter(
    (vehicle) => !acquiredVehicleIds.has(vehicle._id)
  );
  const current = detail.data?.acquisition;
  const pendingOffer = detail.data?.offers?.find((offer) => offer.status === 'Sent');
  const errorMessage = (error, fallback) =>
    error?.response?.data?.error?.message || error?.message || fallback;
  return (
    <>
      <PageHero
        eyebrow="Vehicle acquisition"
        title="Acquisitions"
        description="Create valuations, review seller offers, and record purchases before sending vehicles to refurbishment."
      >
        <button className="btn-primary" onClick={() => setAdding((value) => !value)}>
          <Plus size={16} />
          New acquisition
        </button>
      </PageHero>
      {adding && (
        <form
          className="card mt-6 grid gap-4 p-6 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate();
          }}
        >
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-navy">Create acquisition valuation</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a vehicle and enter the proposed purchase and resale values.
            </p>
          </div>
          <label className="label">
            Vehicle registration
            <select
              className="field mt-2"
              required
              value={form.vehicle}
              onChange={(event) => setForm({ ...form, vehicle: event.target.value })}
              disabled={vehicles.isLoading || !availableVehicles.length}
            >
              <option value="">
                {vehicles.isLoading
                  ? 'Loading vehicles…'
                  : availableVehicles.length
                    ? 'Select vehicle registration'
                    : 'No eligible vehicles available'}
              </option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.registration || 'No registration'} ·{' '}
                  {[vehicle.make, vehicle.model].filter(Boolean).join(' ') || vehicle.vehicleCode}
                </option>
              ))}
            </select>
          </label>
          {[
            ['proposedPrice', 'Proposed purchase price', true],
            ['expectedResale', 'Expected resale price', true],
            ['refurbishmentEstimate', 'Estimated refurbishment cost'],
            ['transactionCosts', 'Transaction costs'],
            ['holdingCosts', 'Holding costs'],
          ].map(([key, label, required]) => (
            <label className="label" key={key}>
              {label}
              <input
                className="field mt-2"
                type="number"
                min="0"
                step="0.01"
                required={Boolean(required)}
                value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
            </label>
          ))}
          {(vehicles.isError || create.isError) && (
            <p className="text-sm text-red-700 md:col-span-2">
              {errorMessage(
                create.error || vehicles.error,
                'Unable to load vehicles or create the acquisition.'
              )}
            </p>
          )}
          <div className="flex gap-3 md:col-span-2">
            <button className="btn-primary" disabled={create.isPending || !availableVehicles.length}>
              {create.isPending ? 'Saving…' : 'Create valuation'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-navy">Acquisition register</h2>
          <p className="mt-1 text-sm text-slate-500">
            {acquisitions.data?.total ?? rows.length} vehicle{(acquisitions.data?.total ?? rows.length) === 1 ? '' : 's'} in the acquisition workflow
          </p>
        </div>
        {workflowError && (
          <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {workflowError}
          </p>
        )}
        {acquisitions.isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading acquisitions…</p>
        ) : acquisitions.isError ? (
          <p className="p-6 text-sm text-red-700">
            {errorMessage(acquisitions.error, 'Unable to load acquisitions.')}
          </p>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Proposed</th>
                  <th className="px-5 py-3">Expected resale</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((item) => (
                  <tr key={item._id}>
                    <td className="px-5 py-4 font-semibold text-navy">
                      {item.vehicle?.registration || item.vehicle?.vehicleCode || 'Vehicle'}
                    </td>
                    <td className="px-5 py-4">{item.proposedPrice?.toLocaleString() ?? '—'}</td>
                    <td className="px-5 py-4">{item.expectedResale?.toLocaleString() ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5 text-xs"
                          onClick={() => {
                            setSelectedId(item._id);
                            setAction('');
                            setWorkflowError('');
                            runAction.reset();
                          }}
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5 text-xs"
                          disabled={
                            ![
                              'Valuation Requested',
                              'On Hold',
                              'Reinspection Requested',
                              'Revised Valuation Requested',
                              'Approved for Negotiation',
                            ].includes(item.status)
                          }
                          title={
                            [
                              'Valuation Requested',
                              'On Hold',
                              'Reinspection Requested',
                              'Revised Valuation Requested',
                              'Approved for Negotiation',
                            ].includes(item.status)
                              ? 'Edit valuation'
                              : 'Valuation editing is unavailable after an offer or purchase begins'
                          }
                          onClick={() => {
                            setEditError('');
                            setEditing({
                              _id: item._id,
                              proposedPrice: String(item.proposedPrice ?? ''),
                              refurbishmentEstimate: String(item.refurbishmentEstimate ?? 0),
                              transactionCosts: String(item.transactionCosts ?? 0),
                              holdingCosts: String(item.holdingCosts ?? 0),
                              expectedResale: String(item.expectedResale ?? ''),
                              reason: '',
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5 text-xs text-red-700"
                          disabled={
                            removeAcquisition.isPending ||
                            ['Offer Accepted', 'Purchase Pending', 'Purchased'].includes(item.status)
                          }
                          title={
                            ['Offer Accepted', 'Purchase Pending', 'Purchased'].includes(item.status)
                              ? 'Accepted or completed purchases cannot be deleted'
                              : 'Delete acquisition'
                          }
                          onClick={() => {
                            setWorkflowError('');
                            if (
                              window.confirm(
                                'Delete this acquisition? This cannot be undone.'
                              )
                            )
                              removeAcquisition.mutate(item._id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            No acquisitions yet. Create a valuation to begin the purchase workflow.
          </p>
        )}
      </section>
      {editing &&
        createPortal(
          <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#071d36]/55 p-4 backdrop-blur-sm">
            <form
              className="card my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6"
              role="dialog"
              aria-modal="true"
              onSubmit={(event) => {
                event.preventDefault();
                setEditError('');
                editValuation.mutate();
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">
                    Edit acquisition
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-navy">Update valuation</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Saving creates a new valuation snapshot in the acquisition history.
                  </p>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setEditing(null)}
                  aria-label="Close valuation editor"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  ['proposedPrice', 'Proposed purchase price'],
                  ['expectedResale', 'Expected resale price'],
                  ['refurbishmentEstimate', 'Estimated refurbishment cost'],
                  ['transactionCosts', 'Transaction costs'],
                  ['holdingCosts', 'Holding costs'],
                ].map(([key, label]) => (
                  <label className="label" key={key}>
                    {label}
                    <input
                      className="field mt-2"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={editing[key]}
                      onChange={(event) =>
                        setEditing({ ...editing, [key]: event.target.value })
                      }
                    />
                  </label>
                ))}
                <label className="label md:col-span-2">
                  Reason for valuation update
                  <textarea
                    className="field mt-2 min-h-24"
                    required
                    minLength={3}
                    value={editing.reason}
                    onChange={(event) =>
                      setEditing({ ...editing, reason: event.target.value })
                    }
                  />
                </label>
              </div>
              {editError && <p className="mt-4 text-sm text-red-700">{editError}</p>}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button className="btn-primary" disabled={editValuation.isPending}>
                  {editValuation.isPending ? 'Saving…' : 'Save valuation'}
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
      {selectedId && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#071d36]/55 p-4 backdrop-blur-sm">
          <section className="card my-auto w-full max-w-2xl p-6" role="dialog" aria-modal="true">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Acquisition workflow</p>
                <h2 className="mt-1 text-2xl font-bold text-navy">
                  {current?.vehicle?.registration || current?.vehicle?.vehicleCode || 'Acquisition details'}
                </h2>
                {current && <p className="mt-1 text-sm text-slate-500">Status: {current.status}</p>}
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  setSelectedId('');
                  setAction('');
                  runAction.reset();
                }}
                aria-label="Close acquisition"
              >
                <X size={17} />
              </button>
            </div>
            {detail.isLoading ? (
              <p className="mt-6 text-sm text-slate-500">Loading acquisition details…</p>
            ) : detail.isError ? (
              <p className="mt-6 text-sm text-red-700">
                {errorMessage(detail.error, 'Unable to load acquisition details.')}
              </p>
            ) : current ? (
              <>
                <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <p>Proposed price: <strong>{current.proposedPrice?.toLocaleString()}</strong></p>
                  <p>Expected resale: <strong>{current.expectedResale?.toLocaleString()}</strong></p>
                  {current.agreedPrice != null && (
                    <p>Agreed price: <strong>{current.agreedPrice.toLocaleString()}</strong></p>
                  )}
                  {detail.data.eligibility && (
                    <p>
                      Document eligibility:{' '}
                      <strong>{detail.data.eligibility.documentEligible ? 'Complete' : 'Incomplete'}</strong>
                    </p>
                  )}
                  {detail.data.eligibility?.missingDocuments?.length > 0 && (
                    <p className="text-red-700 sm:col-span-2">
                      Missing: {detail.data.eligibility.missingDocuments.join(', ')}
                    </p>
                  )}
                </div>
                <div className="mt-5 space-y-4">
                  {['Valuation Requested', 'On Hold', 'Reinspection Requested', 'Revised Valuation Requested'].includes(current.status) && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ['approve', 'Approve for negotiation'],
                          ['hold', 'Put on hold'],
                          ['reinspection', 'Request reinspection'],
                          ['revalue', 'Request revised valuation'],
                          ['reject', 'Reject'],
                        ].map(([kind, label]) => (
                          <button
                            type="button"
                            className="btn-secondary px-3 py-2 text-xs"
                            key={kind}
                            onClick={() => {
                              setAction(kind);
                              runAction.reset();
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {['approve', 'hold', 'reinspection', 'revalue', 'reject'].includes(action) && (
                        <form
                          className="grid gap-3 sm:grid-cols-[1fr_auto]"
                          onSubmit={(event) => {
                            event.preventDefault();
                            runAction.mutate({
                              kind: 'decision',
                              payload: { action, reason: event.currentTarget.reason.value },
                            });
                          }}
                        >
                          <input className="field" name="reason" required minLength={3} placeholder="Decision reason" />
                          <button className="btn-primary" disabled={runAction.isPending}>
                            Confirm
                          </button>
                        </form>
                      )}
                    </>
                  )}
                  {current.status === 'Approved for Negotiation' && (
                    <>
                      <button type="button" className="btn-secondary" onClick={() => setAction('offer')}>
                        Create seller offer
                      </button>
                      {action === 'offer' && (
                        <form
                          className="grid gap-3 sm:grid-cols-[1fr_auto]"
                          onSubmit={(event) => {
                            event.preventDefault();
                            runAction.mutate({
                              kind: 'offer',
                              payload: { amount: Number(event.currentTarget.amount.value) },
                            });
                          }}
                        >
                          <label className="label">
                            Offer amount
                            <input className="field mt-2" name="amount" type="number" min="0" step="0.01" required />
                          </label>
                          <button className="btn-primary self-end" disabled={runAction.isPending}>Send offer</button>
                        </form>
                      )}
                      {pendingOffer && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-sm font-semibold">Pending offer: {pendingOffer.amount.toLocaleString()}</p>
                          <p className="mt-1 text-xs text-slate-600">Record the seller’s response to continue.</p>
                          <div className="mt-3 flex gap-2">
                            {[true, false].map((accepted) => (
                              <button
                                type="button"
                                className="btn-secondary px-3 py-2 text-xs"
                                key={String(accepted)}
                                onClick={() => runAction.mutate({ kind: 'respond', payload: { accepted } })}
                                disabled={runAction.isPending}
                              >
                                {accepted ? 'Seller accepted' : 'Seller rejected'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {current.status === 'Offer Accepted' && (
                    <>
                      <button type="button" className="btn-secondary" onClick={() => setAction('purchase')}>
                        Record purchase
                      </button>
                      {action === 'purchase' && (
                        <form
                          className="grid gap-3 sm:grid-cols-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            runAction.mutate({
                              kind: 'purchase',
                              payload: {
                                paymentReference: event.currentTarget.paymentReference.value,
                                paymentAmount: Number(event.currentTarget.paymentAmount.value),
                                purchaseAgreementConfirmed: event.currentTarget.purchaseAgreementConfirmed.checked,
                                financeClearanceConfirmed: event.currentTarget.financeClearanceConfirmed.checked,
                                idempotencyKey: crypto.randomUUID(),
                              },
                            });
                          }}
                        >
                          <label className="label">
                            Payment reference
                            <input className="field mt-2" name="paymentReference" required minLength={2} />
                          </label>
                          <label className="label">
                            Payment amount
                            <input
                              className="field mt-2"
                              name="paymentAmount"
                              type="number"
                              min="0"
                              step="0.01"
                              defaultValue={current.agreedPrice ?? current.proposedPrice}
                              required
                            />
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" name="purchaseAgreementConfirmed" required />
                            Purchase agreement confirmed
                          </label>
                          {current.financeClearanceRequired && (
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                              <input type="checkbox" name="financeClearanceConfirmed" required />
                              Finance clearance confirmed
                            </label>
                          )}
                          <button className="btn-primary sm:col-span-2" disabled={runAction.isPending}>
                            Complete purchase
                          </button>
                        </form>
                      )}
                    </>
                  )}
                  {current.status === 'Purchased' && (
                    <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                      Purchase recorded{current.purchaseDate ? ` on ${new Date(current.purchaseDate).toLocaleDateString()}` : ''}.
                      This vehicle is now eligible for refurbishment work orders.
                    </p>
                  )}
                  {runAction.isError && (
                    <p className="text-sm text-red-700">
                      {errorMessage(runAction.error, 'Unable to update the acquisition.')}
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </section>
        </div>
      )}
    </>
  );
}
