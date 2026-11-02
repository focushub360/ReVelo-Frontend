import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '../../lib/api.js';

export function DocumentUploadForm({ vehicle, close }) {
  const qc = useQueryClient();
  const [category, setCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const requirements = useQuery({
    queryKey: ['document-requirements'],
    queryFn: () => api.get('/documents/requirements').then((response) => response.data),
    retry: false,
  });
  const selectedRequirement = (requirements.data || []).find((item) => item.category === category);
  const upload = useMutation({
    mutationFn: () => {
      const data = new FormData();
      data.append('vehicle', vehicle._id);
      data.append('category', category);
      if (expiryDate) data.append('expiryDate', expiryDate);
      data.append('file', file);
      return api.post('/documents', data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      close();
    },
    onError: (uploadError) =>
      setError(uploadError.response?.data?.error?.message || 'Unable to upload this document.'),
  });
  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#071d36]/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        className="card my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-upload-title"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">Document management</p>
            <h2 id="document-upload-title" className="mt-1 text-xl font-bold text-navy">
              Upload vehicle document
            </h2>
            <p className="mt-1 text-sm text-slate-500">Upload a PDF, JPEG, or PNG file to this vehicle.</p>
          </div>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close upload form">
            <X size={17} />
          </button>
        </div>
        <form
          className="mt-5 grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            upload.mutate();
          }}
        >
          <label className="label">
            Vehicle registration
            <div className="field mt-2 flex items-center bg-slate-50 text-slate-600">
              {vehicle.registration || 'No registration'} ·{' '}
              {[vehicle.make, vehicle.model].filter(Boolean).join(' ') || vehicle.vehicleCode}
            </div>
          </label>
          <label className="label">
            Document category
            <select
              className="field mt-2"
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={requirements.isLoading || !requirements.data?.length}
            >
              <option value="">
                {requirements.isLoading
                  ? 'Loading document categories…'
                  : requirements.data?.length
                    ? 'Select document category'
                    : 'No document categories configured'}
              </option>
              {(requirements.data || []).map((item) => (
                <option key={item._id} value={item.category}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="label">
            Expiry date{' '}
            <span className="font-normal text-slate-400">
              {selectedRequirement?.requiresExpiry ? '(required)' : '(optional)'}
            </span>
            <input
              className="field mt-2"
              type="date"
              required={Boolean(selectedRequirement?.requiresExpiry)}
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
            />
          </label>
          <label className="label">
            Document file
            <input
              className="field mt-2"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              required
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">Maximum file size: 10 MB</span>
          </label>
          {(requirements.isError || upload.isError) && (
            <p className="text-sm text-red-700 md:col-span-2">
              {error ||
                requirements.error?.response?.data?.error?.message ||
                'Unable to load document upload options.'}
            </p>
          )}
          <div className="flex items-end gap-3 md:col-span-2">
            <button
              className="btn-primary"
              disabled={upload.isPending || requirements.isLoading || !requirements.data?.length}
            >
              {upload.isPending ? 'Uploading…' : 'Upload document'}
            </button>
            <button type="button" className="btn-secondary" onClick={close}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}
