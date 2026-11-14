import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BellRing, ChevronDown, Clock3, LogOut, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import '../../styles/AppHeader.css';

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
          className={`notification-trigger relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-navy transition hover:border-champagne hover:bg-amber-50 ${openNotifications ? 'is-open' : ''}`}
          aria-label="Notifications"
          title="Notifications"
          aria-expanded={openNotifications}
          aria-controls="header-notification-panel"
          onClick={() => setOpenNotifications((value) => !value)}
        >
          <Bell size={18} />
          {unread.length > 0 && (
            <span className="notification-count" aria-label={`${unread.length} unread notifications`}>
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </button>
        {openNotifications && (
          <section className="notification-popover" id="header-notification-panel" aria-label="Notifications">
            <header className="notification-popover-header">
              <div className="notification-heading-icon"><BellRing size={17} /></div>
              <div className="notification-heading-copy">
                <h2>Notifications</h2>
                <p>
                  {unread.length
                    ? `${unread.length} unread update${unread.length === 1 ? '' : 's'}`
                    : 'You’re all caught up'}
                </p>
              </div>
              <button
                type="button"
                className="notification-close"
                aria-label="Close notifications"
                onClick={() => setOpenNotifications(false)}
              >
                <X size={17} />
              </button>
            </header>
            {notifications.isLoading ? (
              <div className="notification-state">
                <span className="notification-loader" />
                <p>Loading your latest updates…</p>
              </div>
            ) : notifications.isError ? (
              <div className="notification-state notification-state-error" role="alert">
                <p>Notifications couldn’t be loaded.</p>
                <span>{notifications.error?.response?.data?.error?.message || 'Check your connection and try again.'}</span>
              </div>
            ) : notifications.data?.length ? (
              <div className="notification-list">
                {notifications.data.map((notification) => (
                  <button
                    type="button"
                    key={notification._id}
                    className={`notification-item ${notification.read ? 'is-read' : 'is-unread'}`}
                    onClick={() => {
                      if (!notification.read) markRead.mutate(notification._id);
                      setOpenNotifications(false);
                      if (notification.link) window.location.href = notification.link;
                    }}
                  >
                    <span className="notification-item-marker" aria-hidden="true" />
                    <span className="notification-item-content">
                      <span className="notification-item-title">{notification.title}</span>
                      <span className="notification-item-body">{notification.body}</span>
                      <span className="notification-item-time">
                        <Clock3 size={12} />
                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Recently'}
                      </span>
                    </span>
                    {notification.link && <span className="notification-item-arrow" aria-hidden="true">→</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="notification-state notification-state-empty">
                <span><Bell size={19} /></span>
                <p>You’re all caught up</p>
                <small>New updates will appear here.</small>
              </div>
            )}
            {markRead.isError && (
              <p className="notification-action-error" role="alert">
                Could not mark this notification as read. Please try again.
              </p>
            )}
            {!notifications.isLoading && !notifications.isError && notifications.data?.length > 0 && (
              <footer className="notification-popover-footer">
                <span><span /> ReVelo workspace updates</span>
                <span>Refreshes automatically</span>
              </footer>
            )}
          </section>
        )}
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
