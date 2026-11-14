import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CarFront, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import reveloLogo from '../assets/revelo-logo.png';

const money = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

export default function PublicVehicleCatalog() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => {
    document.title = 'Browse Cars | ReVelo';
    return () => { document.title = 'ReVelo'; };
  }, []);
  const catalog = useQuery({
    queryKey: ['public-vehicle-catalog', appliedSearch, page],
    queryFn: () =>
      api.get('/public/vehicles', { params: { search: appliedSearch || undefined, page, limit: 12 } })
        .then((response) => response.data),
    retry: false,
  });

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#10253b]">
      <header className="bg-[#0a1d31] px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <img src={reveloLogo} alt="ReVelo" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold">ReVelo</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white">
            <ArrowLeft size={16} /> Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#547437]">Available vehicles</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Find your next car.</h1>
            <p className="mt-2 text-slate-600">Browse vehicles ready for sale at ReVelo locations.</p>
          </div>
          <form className="flex w-full max-w-md gap-2" onSubmit={applySearch}>
            <label className="sr-only" htmlFor="vehicle-search">Search vehicles</label>
            <input
              id="vehicle-search"
              className="field"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search make, model, or fuel type"
            />
            <button className="btn-primary shrink-0" type="submit" aria-label="Search">
              <Search size={18} />
            </button>
          </form>
        </div>

        {catalog.isLoading && <p className="mt-10 text-slate-500">Loading available cars…</p>}
        {catalog.isError && (
          <p role="alert" className="mt-10 rounded-xl bg-red-50 p-5 text-red-700">
            We couldn’t load available cars. Please try again.
          </p>
        )}
        {catalog.data && (
          <>
            {!catalog.data.items.length ? (
              <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm">
                <CarFront className="mx-auto text-slate-300" size={36} />
                <h2 className="mt-3 text-xl font-bold">No cars found</h2>
                <p className="mt-2 text-sm text-slate-500">Try another search or check back later.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {catalog.data.items.map((vehicle) => (
                  <article key={vehicle.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    {vehicle.images[0] ? (
                      <img src={vehicle.images[0].url} alt={`${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`} className="h-52 w-full bg-slate-100 object-cover" />
                    ) : (
                      <div className="grid h-52 place-items-center bg-[#e9eddf] text-[#547437]">
                        <CarFront size={42} />
                      </div>
                    )}
                    <div className="p-5">
                      <h2 className="text-xl font-bold">{[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')}</h2>
                      {vehicle.variant && <p className="mt-1 text-sm text-slate-600">{vehicle.variant}</p>}
                      <p className="mt-3 text-sm text-slate-500">
                        {[vehicle.fuelType, vehicle.transmission, vehicle.odometer ? `${Number(vehicle.odometer).toLocaleString('en-IN')} km` : ''].filter(Boolean).join(' · ')}
                      </p>
                      <p className="mt-4 text-2xl font-bold text-[#10253b]">
                        {vehicle.price == null ? 'Contact for price' : money(vehicle.price)}
                      </p>
                      {vehicle.dealer && <p className="mt-2 text-xs text-slate-500">{[vehicle.dealer.name, vehicle.dealer.city, vehicle.dealer.state].filter(Boolean).join(' · ')}</p>}
                    </div>
                  </article>
                ))}
              </div>
            )}
            {catalog.data.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                  <ArrowLeft size={16} /> Previous
                </button>
                <span className="text-sm text-slate-600">Page {page} of {catalog.data.pages}</span>
                <button className="btn-secondary" disabled={page >= catalog.data.pages} onClick={() => setPage((current) => current + 1)}>
                  Next <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
