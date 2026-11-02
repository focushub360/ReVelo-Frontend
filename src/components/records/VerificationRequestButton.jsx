import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import { api } from '../../lib/api.js';

export function VerificationRequestButton({ enquiry }) {
  const [message, setMessage] = useState('');
  const request = useMutation({ mutationFn: () => api.post(`/enquiries/${enquiry._id}/request-verification`, { message: message || undefined }) });
  if (enquiry.publicSubmission?.proofStatus === 'Requested') return <div className="md:col-span-2 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">A secure verification link has already been emailed to this customer.</div>;
  return <section className="md:col-span-2 rounded-xl border border-[#b8d78c] bg-[#f4f9e9] p-5"><p className="font-bold text-[#10253b]">Accept and request verification</p><p className="mt-1 text-sm leading-6 text-slate-600">ReVelo will email {enquiry.person?.email || 'the customer'} a 7-day secure document link. The email explains that their details are used only for vehicle verification.</p><label className="label mt-4 block">Optional personal note<textarea className="field mt-2 min-h-20" maxLength="1000" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Example: Thank you for your enquiry. Please upload the requested documents when convenient."/></label>{request.isError && <p className="mt-3 text-sm text-red-700">{request.error.response?.data?.error?.message || 'Unable to send the verification email.'}</p>}{request.isSuccess && <p className="mt-3 text-sm text-emerald-700">Secure verification email sent successfully.</p>}<button className="btn-primary mt-4 px-5 py-3" type="button" disabled={request.isPending || !enquiry.person?.email} onClick={() => request.mutate()}>{request.isPending ? 'Sending…' : <><Mail size={17}/> Accept & email secure link</>}</button></section>;
}
