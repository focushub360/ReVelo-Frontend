import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { api } from '../../lib/api.js';

export function AppHeader({ user, logout }) {
  const [openNotifications, setOpenNotifications] = useState(false);
  const client = useQueryClient();
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: () => api.get('/notifications').then((r) => r.data), refetchInterval: 30000, retry: false });
  const markRead = useMutation({ mutationFn: (id) => api.patch(`/notifications/${id}/read`), onSuccess: () => client.invalidateQueries({ queryKey: ['notifications'] }) });
  const unread = (notifications.data || []).filter((notification) => !notification.read);
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const workspace =
    user.dealership?.name || (user.role === 'Super Admin' ? 'Platform administration' : 'Secure workspace');
  return (
    <header className="topbar relative flex min-h-[72px] items-center justify-between overflow-visible px-5 md:px-8">
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-champagne">
          ReVelo control centre
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-navy">{workspace}</p>
          <span className="hidden rounded-full border border-line bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-muted sm:inline">
            {user.operationalProfile || user.role}
          </span>
        </div>
      </div>
      <div className="relative flex items-center gap-2 sm:gap-3">
        <button
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-navy transition hover:border-champagne hover:bg-amber-50"
          aria-label="Notifications"
          title="Notifications"
          onClick={() => setOpenNotifications((value) => !value)}
        >
          <Bell size={18} />
          {unread.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-champagne ring-2 ring-white" />}
        </button>
        {openNotifications && <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"><div className="border-b px-4 py-3"><p className="font-bold text-navy">Notifications</p></div>{notifications.isLoading ? <p className="p-4 text-sm text-slate-500">Loading…</p> : notifications.data?.length ? <div className="max-h-80 overflow-y-auto">{notifications.data.map((notification) => <button key={notification._id} className={`block w-full border-b px-4 py-3 text-left text-sm hover:bg-slate-50 ${notification.read ? 'bg-white' : 'bg-sky/5'}`} onClick={() => { if (!notification.read) markRead.mutate(notification._id); if (notification.link) window.location.href = notification.link; }}><p className="font-semibold text-navy">{notification.title}</p><p className="mt-1 text-xs leading-5 text-slate-600">{notification.body}</p></button>)}</div> : <p className="p-4 text-sm text-slate-500">No notifications yet.</p>}</div>}
        <div className="hidden h-8 w-px bg-line sm:block" />
        <div className="flex items-center gap-2 rounded-xl border border-line bg-slate-50 py-1.5 pl-1.5 pr-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-champagne text-[11px] font-extrabold text-navy">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="max-w-36 truncate text-xs font-semibold text-navy">{user.name}</p>
            <p className="max-w-36 truncate text-[10px] text-muted">{user.email}</p>
          </div>
          <ChevronDown size={15} className="hidden text-champagne sm:block" />
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-navy transition hover:border-red-300 hover:bg-red-50"
          title="Sign out"
          aria-label="Sign out"
          onClick={logout}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
