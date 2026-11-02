import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

export default function AcceptInvitation() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!params.get('token')) return setError('This invitation link is incomplete. Ask your platform administrator to resend it.');
    if (password.length < 12) return setError('Use at least 12 characters for your password.');
    if (password !== confirmPassword) return setError('The passwords do not match.');
    try { await api.post('/auth/invitations/accept', { token: params.get('token'), password }); setDone(true); }
    catch (requestError) { setError(requestError.response?.data?.error?.message || 'We could not accept this invitation.'); }
  };
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><section className="card w-full max-w-md p-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-sky">ReVelo invitation</p>{done ? <div className="mt-5 text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600"/><h1 className="mt-4 text-2xl font-bold text-navy">Your account is ready.</h1><p className="mt-2 text-slate-600">You can now sign in with your email address and new password.</p><Link className="btn-primary mt-6" to="/login">Go to sign in</Link></div> : <form className="mt-4" onSubmit={submit}><h1 className="text-2xl font-bold text-navy">Set your password</h1><p className="mt-2 text-sm leading-6 text-slate-600">Create a password to activate your ReVelo dealer administrator account.</p><label className="label mt-6 block">New password<input className="field mt-2" type="password" minLength="12" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required/></label><label className="label mt-4 block">Confirm password<input className="field mt-2" type="password" minLength="12" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required/></label>{error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className="btn-primary mt-6 w-full" type="submit">Activate account</button></form>}</section></main>;
}
