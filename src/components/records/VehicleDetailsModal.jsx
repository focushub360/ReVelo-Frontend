import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '../../lib/api.js';

export function VehicleDetailsModal({ row, close, canManageVehicles }) {
  const qc = useQueryClient();
  const [images, setImages] = useState([]);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const details = useQuery({
    queryKey: ['vehicle-details', row._id],
    queryFn: () => api.get(`/vehicles/${row._id}`).then((response) => response.data),
    retry: false,
  });
  const uploadImages = useMutation({
    mutationFn: () => {
      const data = new FormData();
      images.forEach((image) => data.append('images', image));
      return api.post(`/vehicles/${row._id}/images`, data);
    },
    onSuccess: () => {
      setImages([]);
      setUploadError('');
      setImageInputKey((key) => key + 1);
      qc.invalidateQueries({ queryKey: ['vehicle-details', row._id] });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error) =>
      setUploadError(error.response?.data?.error?.message || 'Unable to upload vehicle images.'),
  });
  const vehicle = details.data?.vehicle;
  const vehicleFields = vehicle
    ? [
        ['Vehicle code', vehicle.vehicleCode],
        ['Registration', vehicle.registration],
        ['Make', vehicle.make],
        ['Model', vehicle.model],
        ['Variant', vehicle.variant],
        ['Year', vehicle.year],
        ['VIN', vehicle.vin],
        ['Chassis number', vehicle.chassis],
        ['Engine number', vehicle.engine],
        ['Fuel type', vehicle.fuelType],
        ['Transmission', vehicle.transmission],
        ['Odometer', vehicle.odometer == null ? undefined : `${vehicle.odometer} km`],
        ['Lifecycle', vehicle.lifecycle],
        ['Current location', vehicle.currentLocation?.code || vehicle.currentLocation?.name],
        ['Created', vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleString() : undefined],
        ['Last updated', vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleString() : undefined],
      ].filter(([, value]) => value !== undefined && value !== null && value !== '')
    : [];
  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#071d36]/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        className="card my-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-details-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Vehicle details</p>
            <h2 id="vehicle-details-title" className="mt-1 text-2xl font-bold text-navy">
              {row.registration || 'Vehicle'}
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close vehicle details">
            <X size={17} />
          </button>
        </div>
        {details.isLoading && <p className="mt-6 text-sm text-slate-500">Loading vehicle details…</p>}
        {details.isError && (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {details.error?.response?.data?.error?.message || 'Unable to load vehicle details.'}
          </p>
        )}
        {vehicle && (
          <>
            <section className="mt-6">
              <h3 className="text-sm font-bold text-navy">Vehicle information</h3>
              <dl className="mt-3 grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                {vehicleFields.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-navy">Vehicle images</h3>
                <span className="text-xs text-slate-500">{vehicle.images?.length || 0} images</span>
              </div>
              {vehicle.images?.length ? (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {vehicle.images.map((image) => (
                    <a
                      className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      href={`/api/v1/vehicles/${vehicle._id}/images/${image._id}`}
                      key={image._id}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
                        src={`/api/v1/vehicles/${vehicle._id}/images/${image._id}`}
                        alt={image.originalName || `${vehicle.registration} vehicle`}
                      />
                      <span className="block truncate px-3 py-2 text-xs text-slate-600">
                        {image.originalName}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No images have been uploaded for this vehicle.
                </p>
              )}
              {canManageVehicles && (
                <form
                  className="mt-4 rounded-xl border border-dashed border-slate-300 p-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setUploadError('');
                    uploadImages.mutate();
                  }}
                >
                  <label className="label">
                    Add more images
                    <input
                      key={imageInputKey}
                      className="field mt-2"
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      multiple
                      required
                      onChange={(event) => setImages(Array.from(event.target.files || []))}
                    />
                    <span className="mt-1 block text-xs font-normal text-slate-500">
                      Select up to 20 JPEG or PNG images per upload, 10 MB maximum each. Upload again to add
                      more.
                    </span>
                  </label>
                  {uploadError && (
                    <p role="alert" className="mt-3 text-sm text-red-700">
                      {uploadError}
                    </p>
                  )}
                  <button className="btn-primary mt-3" disabled={!images.length || uploadImages.isPending}>
                    {uploadImages.isPending ? 'Uploading images…' : 'Upload images'}
                  </button>
                </form>
              )}
            </section>
          </>
        )}
      </section>
    </div>,
    document.body
  );
}
