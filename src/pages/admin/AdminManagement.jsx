import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { PageHero } from '../../components/layout/PageHero.jsx';

export function AdminManagement() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', dealership: '' });
  const dealers = useQuery({
    queryKey: ['admin-dealers'],
    queryFn: () => api.get('/dealers').then((r) => r.data),
    retry: false,
  });
  const admins = useQuery({
    queryKey: ['platform-admin-users'],
    queryFn: () => api.get('/users').then((r) => r.data),
    retry: false,
  });
  const create = useMutation({
    mutationFn: () => api.post('/users', { ...form, role: 'Dealer Admin' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-admin-users'] });
      setShow(false);
      setForm({ name: '', email: '', phone: '', password: '', dealership: '' });
    },
  });
  const edit = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/users/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-admin-users'] });
      setEditing(null);
    },
  });
  const setStatus = useMutation({
    mutationFn: ({ id, active }) => api.patch(`/users/${id}`, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-admin-users'] }),
  });
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform-admin-users'] }),
  });
  const dealerName = (id) => dealers.data?.find((d) => d._id === id)?.name || 'Unassigned';
  const items = (admins.data || []).filter((user) => user.role === 'Dealer Admin');
  return (
    <>
      <PageHero
        eyebrow="Platform access management"
        title="Dealer Admins"
        description="Provision secure dealership administrator accounts. Each admin is linked to one selected active dealership and receives access only to that tenant."
      >
        <button
          className="rounded-xl bg-[#b6dd52] px-4 py-3 text-sm font-bold text-[#071d36] shadow-lg transition hover:bg-[#c8e878]"
          onClick={() => setShow(!show)}
        >
          {show ? 'Close provisioning' : 'Provision Dealer Admin'}
        </button>
      </PageHero>
      {show && (
        <form
          className="card mt-6 grid gap-4 p-6 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate();
          }}
        >
          <div className="md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">New administrator</p>
            <h2 className="mt-1 text-xl font-bold text-navy">Assign credentials to a dealership</h2>
            <p className="mt-1 text-sm text-slate-500">
              The selected dealership is set by the server and cannot be changed by the new administrator.
            </p>
          </div>
          {[
            ['name', 'Full name', 'text'],
            ['email', 'Work email', 'email'],
            ['phone', 'Phone', 'tel'],
            ['password', 'Temporary password', 'password'],
          ].map(([key, label, type]) => (
            <label className="label" key={key}>
              {label}
              <input
                className="field mt-2"
                type={type}
                required={key !== 'phone'}
                minLength={key === 'password' ? 12 : undefined}
                value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
            </label>
          ))}
          <label className="label">
            Dealership
            <select
              className="field mt-2"
              required
              value={form.dealership}
              onChange={(event) => setForm({ ...form, dealership: event.target.value })}
            >
              <option value="">Select an active dealership</option>
              {dealers.data
                ?.filter((dealer) => dealer.active)
                .map((dealer) => (
                  <option key={dealer._id} value={dealer._id}>
                    {dealer.name} · {dealer.code}
                  </option>
                ))}
            </select>
          </label>
          <div className="md:col-span-2 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Passwords are hashed before persistence. The account can be deactivated or sessions revoked
              later.
            </p>
            <button className="btn-primary" disabled={create.isPending}>
              {create.isPending ? 'Provisioning…' : 'Create Dealer Admin'}
            </button>
          </div>
          {create.error && (
            <p className="md:col-span-2 text-sm text-red-600">
              {create.error.response?.data?.error?.message}
            </p>
          )}
        </form>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Dealer Admins</p>
          <p className="mt-2 text-3xl font-bold text-navy">{items.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Active accounts</p>
          <p className="mt-2 text-3xl font-bold text-navy">{items.filter((user) => user.active).length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Covered dealerships</p>
          <p className="mt-2 text-3xl font-bold text-navy">
            {new Set(items.map((user) => user.dealership)).size}
          </p>
        </div>
      </div>
      <div className="card mt-6 overflow-auto">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">
            Authorised tenant leadership
          </p>
          <h2 className="mt-1 text-xl font-bold text-navy">Dealer Admin registry</h2>
        </div>
        {(setStatus.error || remove.error) && (
          <p className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
            {(setStatus.error || remove.error).response?.data?.error?.message ||
              'Unable to update Dealer Admin.'}
          </p>
        )}
        <table className="table">
          <thead>
            <tr>
              <th>Administrator</th>
              <th>Dealership</th>
              <th>Contact</th>
              <th>Account status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((user) => (
                <tr key={user._id}>
                  <td>
                    <b>{user.name}</b>
                    <p className="mt-1 text-xs text-slate-500">Dealer Admin</p>
                  </td>
                  <td>{dealerName(user.dealership)}</td>
                  <td>
                    {user.email}
                    <p className="mt-1 text-xs text-slate-500">{user.phone || 'No phone provided'}</p>
                  </td>
                  <td>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(user.active)}
                      aria-label={`${user.active ? 'Deactivate' : 'Activate'} ${user.name}`}
                      disabled={
                        setStatus.isPending ||
                        (!user.active &&
                          !dealers.data?.find((dealer) => dealer._id === user.dealership)?.active)
                      }
                      title={
                        !user.active &&
                        !dealers.data?.find((dealer) => dealer._id === user.dealership)?.active
                          ? 'Activate the dealership before this admin account'
                          : undefined
                      }
                      onClick={() => {
                        const active = !user.active;
                        if (
                          !active &&
                          !window.confirm(`Deactivate ${user.name}'s Dealer Admin account?`)
                        ) return;
                        setStatus.mutate({ id: user._id, active });
                      }}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        user.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <span
                        className={`relative h-5 w-9 rounded-full transition ${
                          user.active ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                            user.active ? 'left-4' : 'left-0.5'
                          }`}
                        />
                      </span>
                      {user.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="icon-btn"
                        title="Edit Dealer Admin"
                        aria-label={`Edit ${user.name}`}
                        onClick={() =>
                          setEditing({
                            id: user._id,
                            name: user.name || '',
                            email: user.email || '',
                            phone: user.phone || '',
                          })
                        }
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        title="Delete Dealer Admin"
                        aria-label={`Delete ${user.name}`}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete ${user.name}'s Dealer Admin account? They will no longer be able to sign in.`
                            )
                          ) remove.mutate(user._id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-14 text-center text-slate-500">
                  No Dealer Admin accounts provisioned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editing &&
        createPortal(
          <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/60 p-4">
            <form
              className="card my-auto grid w-full max-w-xl gap-4 p-6 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                edit.mutate({
                  id: editing.id,
                  payload: {
                    name: editing.name,
                    email: editing.email,
                    phone: editing.phone,
                  },
                });
              }}
            >
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[.12em] text-sky">
                  Platform access management
                </p>
                <h2 className="mt-1 text-xl font-bold text-navy">Edit Dealer Admin</h2>
              </div>
              {[
                ['name', 'Full name', 'text'],
                ['email', 'Work email', 'email'],
                ['phone', 'Phone', 'tel'],
              ].map(([key, label, type]) => (
                <label className="label" key={key}>
                  {label}
                  <input
                    className="field mt-2"
                    type={type}
                    required={key !== 'phone'}
                    value={editing[key]}
                    onChange={(event) =>
                      setEditing({ ...editing, [key]: event.target.value })
                    }
                  />
                </label>
              ))}
              {edit.error && (
                <p className="text-sm text-red-700 sm:col-span-2">
                  {edit.error.response?.data?.error?.message || 'Unable to update Dealer Admin.'}
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
