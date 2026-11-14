import { useEffect } from 'react';
import { ArrowRight, CarFront, HandCoins } from 'lucide-react';
import { Link } from 'react-router-dom';
import reveloLogo from '../assets/revelo-logo.png';
import showroomImage from '../assets/login-showroom.png';

const cards = [
  {
    title: 'Buy a car',
    description: 'Browse quality-checked vehicles ready for their next owner.',
    action: 'Explore available cars',
    to: '/buy-cars',
    icon: CarFront,
    style: 'bg-white text-[#10253b]',
  },
  {
    title: 'Sell your car',
    description: 'Share a few details and connect with your nearest ReVelo team.',
    action: 'Start a seller enquiry',
    to: '/sell-your-car',
    icon: HandCoins,
    style: 'bg-[#d6f15d] text-[#10253b]',
  },
];

export default function PublicHome() {
  useEffect(() => {
    document.title = 'Buy or Sell Your Car | ReVelo';
    return () => { document.title = 'ReVelo'; };
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f7f2] font-sans text-[#10253b]">
      <header className="absolute inset-x-0 top-0 z-10 px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <img src={reveloLogo} alt="ReVelo" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold tracking-tight">ReVelo</span>
          </Link>
          <Link to="/login" className="text-sm font-semibold text-white hover:text-[#d6f15d]">
            Dealer sign in
          </Link>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-[#0a1d31] px-5 pb-20 pt-36 sm:px-10">
        <img
          src={showroomImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071a2d] via-[#071a2d]/90 to-[#071a2d]/45" />
        <div className="mx-auto max-w-7xl pb-12 text-white">
          <p className="text-xs font-bold uppercase tracking-[.24em] text-[#d6f15d]">Welcome to ReVelo</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.04] tracking-[-.045em] sm:text-7xl">
            The next move is yours.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            Find a car you love or make your next move by selling with a nearby ReVelo team.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:px-10 md:grid-cols-2 md:py-16">
        {cards.map(({ title, description, action, to, icon: Icon, style }) => (
          <Link
            key={title}
            to={to}
            className={`group flex min-h-64 flex-col justify-between rounded-3xl p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-10 ${style}`}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                <p className="mt-3 max-w-md leading-7 text-slate-600">{description}</p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#10253b] text-[#d6f15d]">
                <Icon size={23} />
              </span>
            </div>
            <span className="mt-10 inline-flex items-center gap-2 text-sm font-bold">
              {action}
              <ArrowRight className="transition group-hover:translate-x-1" size={17} />
            </span>
          </Link>
        ))}
      </section>

      <footer className="px-5 pb-8 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-[#ced5c6] pt-6 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} ReVelo. All rights reserved.</span>
          <Link to="/sell-your-car" className="hover:text-[#10253b]">Sell your car</Link>
        </div>
      </footer>
    </main>
  );
}
