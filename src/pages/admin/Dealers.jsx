import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { PageHero } from '../../components/layout/PageHero.jsx';

export function Dealers() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [inviteNotice, setInviteNotice] = useState('');
  const [form, setForm] = useState({
    name: '',
    code: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    address: '',
    city: '',
    plan: 'Starter',
    maxUsers: 10,
    maxVehicles: 250,
    adminName: '',
    adminEmail: '',
  });
  const q = useQuery({ queryKey: ['dealers'], queryFn: () => api.get('/dealers').then((r) => r.data) });
  const create = useMutation({
    mutationFn: () =>
      api.post('/dealers', {
        name: form.name,
        code: form.code,
        contact: { name: form.contactName, email: form.contactEmail, phone: form.phone },
        address: { line1: form.address, city: form.city },
        subscription: {
          plan: form.plan,
          maxUsers: Number(form.maxUsers),
          maxVehicles: Number(form.maxVehicles),
        },
        admin: { name: form.adminName, email: form.adminEmail },
      }),
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: ['dealers'] });
      setInviteNotice(data.inviteDelivery === 'sent' ? `Invitation email sent to ${data.dealerAdmin?.email}.` : data.inviteDelivery === 'not_configured' ? 'Dealership created, but SMTP is not configured. Add SMTP settings before resending the invitation.' : 'Dealership created, but the invitation email could not be delivered.');
      setForm({
        name: '',
        code: '',
        contactName: '',
        contactEmail: '',
        phone: '',
        address: '',
        city: '',
        plan: 'Starter',
        maxUsers: 10,
        maxVehicles: 250,
        adminName: '',
        adminEmail: '',
      });
      setShow(false);
    },
  });
  const edit = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/dealers/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealers'] });
      setEditing(null);
    },
  });
  const setStatus = useMutation({
    mutationFn: ({ id, active }) => api.patch(`/dealers/${id}/status`, { active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealers'] });
      qc.invalidateQueries({ queryKey: ['admin-dealers'] });
      qc.invalidateQueries({ queryKey: ['platform-admin-users'] });
    },
  });
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/dealers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dealers'] }),
  });
  const resendInvite = useMutation({
    mutationFn: (id) => api.post(`/dealers/${id}/resend-invitation`),
    onSuccess: ({ data }) => setInviteNotice(data.inviteDelivery === 'sent' ? 'Invitation email sent.' : 'SMTP is not configured; invitation was not emailed.'),
  });
  const beginEdit = (dealer) => {
    setEditing({
      id: dealer._id,
      name: dealer.name || '',
      code: dealer.code || '',
      contactName: dealer.contact?.name || '',
      contactEmail: dealer.contact?.email || '',
      phone: dealer.contact?.phone || '',
      address: dealer.address?.line1 || '',
      city: dealer.address?.city || '',
      plan: dealer.subscription?.plan || 'Starter',
      maxUsers: dealer.subscription?.maxUsers ?? 10,
      maxVehicles: dealer.subscription?.maxVehicles ?? 250,
    });
  };
  const saveEdit = (event) => {
    event.preventDefault();
    edit.mutate({
      id: editing.id,
      payload: {
        name: editing.name,
        code: editing.code,
        contact: {
          name: editing.contactName,
          email: editing.contactEmail,
          phone: editing.phone,
        },
        address: { line1: editing.address, city: editing.city },
        subscription: {
          plan: editing.plan,
          maxUsers: Number(editing.maxUsers),
          maxVehicles: Number(editing.maxVehicles),
        },
      },
    });
  };
  const dealers = q.data || [];
  const activeCount = dealers.filter((dealer) => dealer.active).length;
  const onboardingCount = dealers.filter((dealer) => dealer.onboardingStatus !== 'Active').length;
  const enterpriseCount = dealers.filter((dealer) => dealer.subscription?.plan === 'Enterprise').length;
  return (
    <>
      <PageHero
        eyebrow="Platform administration"
        title="Dealerships"
        description="Provision secure dealership workspaces, manage subscription capacity, and track onboarding."
      >
        <button className="btn-primary" onClick={() => setShow((visible) => !visible)}>
          <Plus size={16} />
          {show ? 'Close form' : 'Create dealership'}
        </button>
      </PageHero>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total dealerships', dealers.length, '#2278d4'],
          ['Active tenants', activeCount, '#32a66c'],
          ['Onboarding', onboardingCount, '#e7a62c'],
          ['Enterprise plans', enterpriseCount, '#8b5cf6'],
        ].map(([label, value, color]) => (
          <div className="card p-5" key={label}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">{label}</p>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <p className="mt-3 text-3xl font-bold text-navy">{q.isLoading ? '—' : value}</p>
            <p className="mt-1 text-xs text-slate-500">Platform portfolio</p>
          </div>
        ))}
      </div>
      {show && (
        <form
          className="card mt-6 grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="md:col-span-2 xl:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">New tenant</p>
            <h2 className="mt-1 text-xl font-bold text-navy">Create dealership workspace</h2>
            <p className="mt-1 text-sm text-slate-500">
              Set up the dealership, subscription limits, and its first administrator.
            </p>
          </div>
          {[
            ['name', 'Dealership name', 'text'],
            ['code', 'Unique dealer code', 'text'],
            ['contactName', 'Primary contact name', 'text'],
            ['contactEmail', 'Contact email', 'email'],
            ['phone', 'Contact phone', 'tel'],
            ['address', 'Address', 'text'],
            ['city', 'City', 'text'],
            ['adminName', 'First admin name', 'text'],
            ['adminEmail', 'First admin email', 'email'],
          ].map(([k, l, type]) => (
            <label className="label" key={k}>
              {l}
              <input
                required
                type={type}
                className="field mt-2"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </label>
          ))}
          <label className="label">
            Plan
            <select
              className="field mt-2"
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
            >
              <option>Starter</option>
              <option>Growth</option>
              <option>Enterprise</option>
            </select>
          </label>
          {[
            ['maxUsers', 'User limit'],
            ['maxVehicles', 'Vehicle limit'],
          ].map(([key, label]) => (
            <label className="label" key={key}>
              {label}
              <input
                className="field mt-2"
                type="number"
                min="1"
                required
                value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
            </label>
          ))}
          {create.error && (
            <p className="text-sm text-red-700 md:col-span-2 xl:col-span-3">
              {create.error.response?.data?.error?.message || 'Unable to create dealership.'}
            </p>
          )}
          <div className="flex gap-3 md:col-span-2 xl:col-span-3">
            <button className="btn-primary" disabled={create.isPending}>
              {create.isPending ? 'Provisioning…' : 'Provision dealership'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShow(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {inviteNotice && <p className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm text-blue-800">{inviteNotice}</p>}
      <section className="card mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-navy">Dealership portfolio</h2>
            <p className="mt-1 text-xs text-slate-500">
              Tenant status, subscription plan, and onboarding progress
            </p>
          </div>
          <span className="rounded-full bg-[#eef7dc] px-3 py-1 text-xs font-semibold text-[#457412]">
            {q.isLoading ? 'Loading…' : `${dealers.length} tenants`}
          </span>
        </div>
        {(setStatus.error || remove.error || resendInvite.error) && (
          <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {(setStatus.error || remove.error || resendInvite.error).response?.data?.error?.message ||
              'Unable to update dealership.'}
          </p>
        )}
        {q.isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading dealership portfolio…</p>
        ) : q.isError ? (
          <p className="p-6 text-sm text-red-700">
            {q.error?.response?.data?.error?.message || 'Unable to load dealerships.'}
          </p>
        ) : dealers.length ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Dealership</th>
                  <th>Primary contact</th>
                  <th>Subscription</th>
                  <th>Capacity</th>
                  <th>Onboarding</th>
                  <th>Tenant status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dealers.map((dealer) => (
                  <tr key={dealer._id}>
                    <td>
                      <b className="text-navy">{dealer.name}</b>
                      <p className="mt-1 text-xs text-slate-500">{dealer.code}</p>
                    </td>
                    <td>
                      <p>{dealer.contact?.name || '—'}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {dealer.contact?.email || dealer.contact?.phone || 'No contact details'}
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-blue-50 text-blue-700">
                        {dealer.subscription?.plan || 'Starter'}
                      </span>
                    </td>
                    <td>
                      <p>{dealer.subscription?.maxUsers ?? 0} users</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {dealer.subscription?.maxVehicles ?? 0} vehicles
                      </p>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          dealer.onboardingStatus === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {dealer.onboardingStatus || 'Draft'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(dealer.active)}
                        aria-label={`${dealer.active ? 'Deactivate' : 'Activate'} ${dealer.name}`}
                        disabled={setStatus.isPending}
                        onClick={() => {
                          const active = !dealer.active;
                          if (
                            !active &&
                            !window.confirm(
                              `Deactivate ${dealer.name}? This will also deactivate its admin and employee accounts.`
                            )
                          ) return;
                          setStatus.mutate({ id: dealer._id, active });
                        }}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                          dealer.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <span
                          className={`relative h-5 w-9 rounded-full transition ${
                            dealer.active ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                              dealer.active ? 'left-4' : 'left-0.5'
                            }`}
                          />
                        </span>
                        {dealer.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit dealership"
                          aria-label={`Edit ${dealer.name}`}
                          onClick={() => beginEdit(dealer)}
                        >
                          <Pencil size={16} />
                        </button>
                        {dealer.onboardingStatus !== 'Active' && <button type="button" className="icon-btn" title="Resend administrator invitation" aria-label={`Resend administrator invitation for ${dealer.name}`} disabled={resendInvite.isPending} onClick={() => resendInvite.mutate(dealer._id)}><Mail size={16} /></button>}
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          title="Delete dealership"
                          aria-label={`Delete ${dealer.name}`}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete ${dealer.name}? Dealerships with users or operational records cannot be deleted.`
                              )
                            ) remove.mutate(dealer._id);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-10 text-center text-sm text-slate-500">
            No dealerships have been provisioned yet.
          </p>
        )}
      </section>
      {editing &&
        createPortal(
          <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/60 p-4">
            <form
              className="card my-auto grid w-full max-w-3xl gap-4 p-6 sm:grid-cols-2"
              onSubmit={saveEdit}
            >
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">
                  Dealership settings
                </p>
                <h2 className="mt-1 text-xl font-bold text-navy">Edit dealership</h2>
              </div>
              {[
                ['name', 'Dealership name', 'text'],
                ['code', 'Dealer code', 'text'],
                ['contactName', 'Primary contact name', 'text'],
                ['contactEmail', 'Contact email', 'email'],
                ['phone', 'Contact phone', 'tel'],
                ['address', 'Address', 'text'],
                ['city', 'City', 'text'],
                ['maxUsers', 'User limit', 'number'],
                ['maxVehicles', 'Vehicle limit', 'number'],
              ].map(([key, label, type]) => (
                <label className="label" key={key}>
                  {label}
                  <input
                    className="field mt-2"
                    type={type}
                    min={type === 'number' ? 1 : undefined}
                    required
                    value={editing[key]}
                    onChange={(event) =>
                      setEditing({ ...editing, [key]: event.target.value })
                    }
                  />
                </label>
              ))}
              <label className="label">
                Plan
                <select
                  className="field mt-2"
                  value={editing.plan}
                  onChange={(event) => setEditing({ ...editing, plan: event.target.value })}
                >
                  <option>Starter</option>
                  <option>Growth</option>
                  <option>Enterprise</option>
                </select>
              </label>
              {edit.error && (
                <p className="text-sm text-red-700 sm:col-span-2">
                  {edit.error.response?.data?.error?.message || 'Unable to update dealership.'}
                </p>
              )}
              <div className="flex gap-3 sm:col-span-2">
                <button className="btn-primary" disabled={edit.isPending}>
                  {edit.isPending ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </>
  );
}
