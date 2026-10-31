import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHero } from '../components/layout/PageHero.jsx';
import { DocumentUploadForm } from '../components/records/DocumentUploadForm.jsx';

export function DocumentRegister({ canUploadDocuments }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [uploadVehicleId, setUploadVehicleId] = useState('');
  const vehicles = useQuery({
    queryKey: ['document-register-vehicles'],
    queryFn: () => api.get('/vehicles', { params: { limit: 100 } }).then((response) => response.data),
    retry: false,
  });
  const documents = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.get('/documents', { params: { limit: 100 } }).then((response) => response.data),
    retry: false,
  });
  const requirements = useQuery({
    queryKey: ['document-requirements'],
    queryFn: () => api.get('/documents/requirements').then((response) => response.data),
    retry: false,
  });
  const vehicleRows = vehicles.data?.items || [];
  const documentRows = documents.data?.items || [];
  const docsByVehicle = documentRows.reduce((all, document) => {
    const vehicleId = document.vehicle?._id || document.vehicle;
    if (!vehicleId) return all;
    (all[vehicleId] ||= []).push(document);
    return all;
  }, {});
  const selectedVehicle = vehicleRows.find((vehicle) => vehicle._id === selectedVehicleId);
  const uploadVehicle = vehicleRows.find((vehicle) => vehicle._id === uploadVehicleId);
  const selectedDocuments = docsByVehicle[selectedVehicleId] || [];
  const submittedCategories = new Set(selectedDocuments.map((document) => document.category));
  const pendingCategories = (requirements.data || []).filter(
    (requirement) => !submittedCategories.has(requirement.category)
  );
  const pageError = vehicles.error || documents.error || requirements.error;
  const errorMessage = pageError?.response?.data?.error?.message || 'Unable to load the document register.';
  const fileLink = (document) => `/api/v1/documents/${document._id}/file`;
  return (
    <>
      <PageHero
        eyebrow="Document management"
        title="Documents"
        description="Select a vehicle to review submitted documents, outstanding requirements, and certificates."
      >
        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right">
          <p className="text-xs text-slate-200">Vehicles</p>
          <p className="text-2xl font-bold">{vehicles.data?.total ?? vehicleRows.length}</p>
        </div>
      </PageHero>
      {(vehicles.isLoading || documents.isLoading || requirements.isLoading) && (
        <div className="card mt-6 p-6 text-slate-500">Loading vehicle documents…</div>
      )}
      {pageError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{errorMessage}</div>
      )}
      {!vehicles.isLoading && !documents.isLoading && !requirements.isLoading && !pageError && (
        <section className="card mt-6 overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-navy">Vehicle document register</h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a vehicle row to view submitted documents and outstanding requirements.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle registration</th>
                  <th>Vehicle</th>
                  <th>Documents submitted</th>
                  <th>Yet to submit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vehicleRows.length ? (
                  vehicleRows.map((vehicle) => {
                    const vehicleDocuments = docsByVehicle[vehicle._id] || [];
                    const submitted = new Set(vehicleDocuments.map((document) => document.category));
                    const pendingCount = (requirements.data || []).filter(
                      (requirement) => !submitted.has(requirement.category)
                    ).length;
                    return (
                      <tr
                        key={vehicle._id}
                        className="cursor-pointer"
                        tabIndex={0}
                        onClick={() => setSelectedVehicleId(vehicle._id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedVehicleId(vehicle._id);
                          }
                        }}
                      >
                        <td className="font-semibold text-navy">
                          {vehicle.registration || 'No registration'}
                        </td>
                        <td>{[vehicle.make, vehicle.model].filter(Boolean).join(' ') || '—'}</td>
                        <td>{vehicleDocuments.length}</td>
                        <td>{pendingCount}</td>
                        <td className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="btn-secondary px-3 py-1.5 text-xs"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedVehicleId(vehicle._id);
                              }}
                            >
                              View documents
                            </button>
                            {canUploadDocuments && (
                              <button
                                type="button"
                                className="btn-primary px-3 py-1.5 text-xs"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setUploadVehicleId(vehicle._id);
                                }}
                              >
                                <Plus size={14} />
                                Upload document
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-slate-500">
                      No vehicles are registered in this dealership.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {selectedVehicle &&
        createPortal(
          <div
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#071d36]/55 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedVehicleId('');
            }}
          >
            <section
              className="card my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="vehicle-document-title"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Vehicle documents</p>
                  <h2 id="vehicle-document-title" className="mt-1 text-2xl font-bold text-navy">
                    {selectedVehicle.registration || 'No registration'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {[selectedVehicle.make, selectedVehicle.model].filter(Boolean).join(' ')}
                  </p>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setSelectedVehicleId('')}
                  aria-label="Close vehicle documents"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-bold text-navy">Submitted documents</h3>
                {selectedDocuments.length ? (
                  <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {selectedDocuments.map((document) => (
                      <div
                        className="flex flex-wrap items-center justify-between gap-3 p-4"
                        key={document._id}
                      >
                        <div>
                          <p className="font-semibold text-navy">{document.category}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {document.originalName || 'Uploaded document'} · {document.status}
                            {document.submittedAt
                              ? ` · ${new Date(document.submittedAt).toLocaleDateString()}`
                              : ''}
                          </p>
                        </div>
                        <a
                          className="btn-secondary px-3 py-1.5 text-xs"
                          href={fileLink(document)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View certificate
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    No documents have been submitted for this vehicle.
                  </p>
                )}
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-bold text-navy">Yet to submit</h3>
                {pendingCategories.length ? (
                  <ul className="mt-3 space-y-2">
                    {pendingCategories.map((requirement) => (
                      <li
                        className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm"
                        key={requirement._id}
                      >
                        <span className="font-medium text-slate-700">{requirement.name}</span>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          Not submitted
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                    All configured document requirements have been submitted.
                  </p>
                )}
              </div>
            </section>
          </div>,
          document.body
        )}
      {uploadVehicle && (
        <DocumentUploadForm
          key={uploadVehicle._id}
          vehicle={uploadVehicle}
          close={() => setUploadVehicleId('')}
        />
      )}
    </>
  );
}
