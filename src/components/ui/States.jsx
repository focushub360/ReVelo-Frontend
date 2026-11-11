import { AlertCircle, FileText, LoaderCircle } from 'lucide-react';
export function LoadingSkeleton({ label = 'Loading…', className = '' }) { return <div className={`ui-loading ${className}`} role="status"><LoaderCircle size={18}/>{label}</div>; }
export function EmptyState({ title = 'Nothing to show yet', description = 'New information will appear here when available.', icon: Icon = FileText, children }) { return <div className="ui-empty"><Icon size={28}/><h3>{title}</h3><p>{description}</p>{children}</div>; }
export function ErrorState({ title = 'Unable to load this section', description = 'Please refresh and try again.' }) { return <div className="ui-error"><AlertCircle size={20}/><div><b>{title}</b><p>{description}</p></div></div>; }
