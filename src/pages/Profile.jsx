import { CalendarDays, Mail, ShieldCheck, Users } from 'lucide-react';
import ProfileSettingsPanel from '../components/ProfileSettings.jsx';

export function ProfileOverview({ user }) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const roleDetails =
    user.role === 'Super Admin'
      ? {
          eyebrow: 'Platform identity',
          title: 'Platform administrator',
          description: 'You manage dealership tenants, subscriptions, onboarding, and platform security.',
          color: '#b6dd52',
          modules: [
            'Dealer provisioning',
            'Platform activity',
            'Subscription oversight',
            'Security settings',
          ],
        }
      : user.role === 'Dealer Admin'
        ? {
            eyebrow: 'Dealership leadership',
            title: 'Dealership administrator',
            description:
              'You oversee the full vehicle lifecycle and operational teams within your dealership.',
            color: '#72b7f2',
            modules: [
              'Vehicle operations',
              'Employee management',
              'Commercial approvals',
              'Dealership reporting',
            ],
          }
        : user.role === 'Buyer & Seller'
          ? {
              eyebrow: 'External portal access',
              title: user.partyType || 'Customer account',
              description:
                'Your portal is restricted to your authorised enquiries, appointments, documents, and offers.',
              color: '#b6dd52',
              modules: ['My enquiries', 'My appointments', 'My documents', 'Offers & progress'],
            }
          : {
              eyebrow: 'Operational identity',
              title: user.operationalProfile || 'Operational employee',
              description:
                'Your workspace is shaped by your assigned responsibility and dealership permissions.',
              color: '#72b7f2',
              modules:
                user.operationalProfile === 'Parking Manager'
                  ? ['Yard map', 'Vehicle locations', 'Reservations', 'Movement history']
                  : user.operationalProfile === 'Refurbishment Technician'
                    ? ['Assigned repairs', 'Parts & labour', 'Completion evidence', 'Rework history']
                    : ['My assignments', 'Inspection queue', 'Report history', 'Vehicle context'],
            };
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071d36] via-[#0a3155] to-[#135584] p-6 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[18px] border-white/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-2xl border-2 border-white/30 bg-white/10 text-2xl font-extrabold text-white shadow-lg">
              {initials}
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[.18em]"
                style={{ color: roleDetails.color }}
              >
                {roleDetails.eyebrow}
              </p>
              <h1 className="mt-1 text-3xl font-bold">{user.name}</h1>
              <p className="mt-1 text-sm text-slate-200">{roleDetails.title}</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs text-slate-200">Account status</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-bold">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b6dd52]" />
              Active & protected
            </p>
          </div>
        </div>
      </div>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="card p-6">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-sky">Workspace access</p>
          <h2 className="mt-1 text-xl font-bold text-navy">Your role, focused</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{roleDetails.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {roleDetails.modules.map((module, index) => (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4" key={module}>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#071d36] text-sm font-bold text-[#b6dd52]">
                  0{index + 1}
                </span>
                <span className="text-sm font-semibold text-navy">{module}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-sky">Account information</p>
          <h2 className="mt-1 text-xl font-bold text-navy">Profile details</h2>
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-sky">
                <Mail size={18} />
              </span>
              <div>
                <p className="text-xs text-slate-500">Email address</p>
                <p className="text-sm font-semibold text-navy">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-50 text-emerald-700">
                <ShieldCheck size={18} />
              </span>
              <div>
                <p className="text-xs text-slate-500">Primary role</p>
                <p className="text-sm font-semibold text-navy">{user.role}</p>
              </div>
            </div>
            {user.operationalProfile && (
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <Users size={18} />
                </span>
                <div>
                  <p className="text-xs text-slate-500">Operational profile</p>
                  <p className="text-sm font-semibold text-navy">{user.operationalProfile}</p>
                </div>
              </div>
            )}
            {user.partyType && (
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                  <Users size={18} />
                </span>
                <div>
                  <p className="text-xs text-slate-500">Portal relationship</p>
                  <p className="text-sm font-semibold text-navy">{user.partyType}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Workspace scope</p>
          <p className="mt-3 text-lg font-bold text-navy">
            {user.dealership?.name ||
              (user.role === 'Super Admin' ? 'All platform tenants' : 'Authorised dealer relationship')}
          </p>
          <p className="mt-2 text-sm text-slate-500">Access is enforced from your secure session.</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Security posture</p>
          <p className="mt-3 text-lg font-bold text-navy">Session protected</p>
          <p className="mt-2 text-sm text-slate-500">Role and responsibility checks apply to every action.</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Activity visibility</p>
          <p className="mt-3 flex items-center gap-2 text-lg font-bold text-navy">
            <CalendarDays size={19} className="text-sky" />
            Role-aware history
          </p>
          <p className="mt-2 text-sm text-slate-500">Review the activity permitted for your account.</p>
        </div>
      </section>
    </>
  );
}

export function Profile({ user }) {
  return (
    <>
      <ProfileOverview user={user} />
      <ProfileSettingsPanel user={user} />
    </>
  );
}
