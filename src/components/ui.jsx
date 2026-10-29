import { AlertCircle, CheckCircle2, Inbox, LoaderCircle, X } from 'lucide-react';
export function LoadingState({ label = 'Loading records…' }) {
  return (
    <div className="card flex min-h-40 items-center justify-center gap-3 p-8 text-slate-500">
      <LoaderCircle className="animate-spin text-sky" size={20} />
      {label}
    </div>
  );
}
export function EmptyState({
  title = 'Nothing here yet',
  description = 'Create the first record to get started.',
}) {
  return (
    <div className="card p-10 text-center">
      <Inbox className="mx-auto text-slate-300" />
      <h3 className="mt-3 font-semibold text-navy">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
export function ErrorState({ message = 'We could not load this information.', retry }) {
  return (
    <div className="card flex items-center gap-3 border-red-200 p-5 text-red-700">
      <AlertCircle />
      <div>
        <b>Something went wrong</b>
        <p className="text-sm">{message}</p>
        {retry && (
          <button className="btn-outline mt-2" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
export function Toast({ notice, onClose }) {
  if (!notice) return null;
  return (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl bg-navy px-4 py-3 text-sm text-white shadow-xl"
    >
      <CheckCircle2 className="text-emerald-400" size={18} />
      {notice}
      <button aria-label="Dismiss" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
}
export function ConfirmDialog({
  open,
  title = 'Confirm action',
  message,
  confirm = 'Confirm',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-navy/40 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-navy">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onConfirm}>
            {confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
