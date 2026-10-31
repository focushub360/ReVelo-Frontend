import { Bell, ChevronDown, LogOut } from 'lucide-react';

export function AppHeader({ user, logout }) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const workspace =
    user.dealership?.name || (user.role === 'Super Admin' ? 'Platform administration' : 'Secure workspace');
  return (
    <header className="topbar relative flex min-h-[72px] items-center justify-between overflow-hidden border-b-4 border-[#d6aa29] bg-[#071d36] px-5 shadow-lg md:px-8">
      <div className="pointer-events-none absolute -left-12 top-0 h-32 w-56 -skew-x-12 bg-gradient-to-r from-[#d6aa29]/20 to-transparent" />
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#f4cf54]">
          ReVelo control centre
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-white">{workspace}</p>
          <span className="hidden rounded-full border border-[#f4cf54]/40 bg-[#f4cf54]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#ffe785] sm:inline">
            {user.operationalProfile || user.role}
          </span>
        </div>
      </div>
      <div className="relative flex items-center gap-2 sm:gap-3">
        <button
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#d6ee55] ring-2 ring-[#071d36]" />
        </button>
        <div className="hidden h-8 w-px bg-white/15 sm:block" />
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#ffe785] to-[#c99317] text-[11px] font-extrabold text-[#071d36]">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="max-w-36 truncate text-xs font-semibold text-white">{user.name}</p>
            <p className="max-w-36 truncate text-[10px] text-slate-300">{user.email}</p>
          </div>
          <ChevronDown size={15} className="hidden text-[#f4cf54] sm:block" />
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:border-red-300/60 hover:bg-red-500/20"
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
