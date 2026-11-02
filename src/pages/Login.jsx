import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { api, setCsrf } from '../lib/api.js';
import reveloLogo from '../assets/revelo-logo.png';
import showroomImage from '../assets/login-showroom.png';

export function Login() {
  const [form, setForm] = useState({ email: 'super.admin@revelo.test', password: 'ChangeMe123!' });
  const [error, setError] = useState('');
  const go = useNavigate();
  const login = useMutation({
    mutationFn: () => api.post('/auth/login', form),
    onSuccess: ({ data }) => {
      setCsrf(data.csrfToken);
      go('/dashboard');
    },
    onError: (e) => setError(e.response?.data?.error?.message || 'Unable to sign in'),
  });
  return (
    <main className="min-h-screen bg-[#071d36] p-4 sm:p-6 lg:grid lg:h-screen lg:min-h-0 lg:place-items-center lg:overflow-hidden">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1380px] overflow-hidden rounded-[24px] bg-white shadow-2xl lg:h-[calc(100vh-3rem)] lg:min-h-0 lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative hidden min-h-0 overflow-hidden lg:block">
          <img
            src={showroomImage}
            alt="Premium vehicles in a ReVelo showroom"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071d36]/90 via-[#071d36]/15 to-[#071d36]/40" />
          <div className="absolute left-7 top-7 flex items-center gap-3">
            <img src={reveloLogo} alt="ReVelo" className="h-12 w-12 rounded-xl object-contain" />
            <div>
              <p className="text-xl font-extrabold tracking-tight text-white">ReVelo</p>
              <p className="text-xs font-medium text-slate-200">Vehicle lifecycle platform</p>
            </div>
          </div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              Dealer operating system
            </span>
            <h1 className="mt-3 max-w-md text-3xl font-bold leading-tight xl:text-4xl">
              Every vehicle journey, connected.
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-200">
              Acquire, inspect, refurbish and sell with one secure multi-tenant workspace.
            </p>
            <div className="mt-5 flex gap-7 text-xs">
              <span>
                <b className="block text-lg text-white">4</b> secure roles
              </span>
              <span>
                <b className="block text-lg text-white">1</b> connected lifecycle
              </span>
              <span>
                <b className="block text-lg text-white">100%</b> dealer scoped
              </span>
            </div>
          </div>
        </div>
        <div className="flex min-h-0 items-center justify-center overflow-y-auto bg-white p-6 sm:p-8 lg:p-10">
          <form
            className="w-full max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate();
            }}
          >
            <div className="flex items-center gap-3 lg:hidden">
              <img src={reveloLogo} alt="ReVelo" className="h-14 w-14 object-contain" />
              <div>
                <p className="text-xl font-extrabold text-navy">ReVelo</p>
                <p className="text-xs text-slate-500">Vehicle lifecycle platform</p>
              </div>
            </div>
            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-sky">Secure access</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in to your authorised ReVelo workspace.</p>
            </div>
            <label className="label mt-6 block">
              Email address
              <input
                className="field mt-2 h-11"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label className="label mt-4 block">
              Password
              <input
                type="password"
                autoComplete="current-password"
                className="field mt-2 h-11"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-[#071d36] text-sm font-bold text-white shadow-lg shadow-[#071d36]/20 transition hover:bg-[#0d3459] disabled:opacity-60"
              disabled={login.isPending}
            >
              {login.isPending ? 'Signing in…' : 'Sign in securely'}
            </button>
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={16} className="text-[#2278d4]" />
              Protected with secure session authentication
            </div>
            <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
              ReVelo · Multi-tenant dealership operations
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
