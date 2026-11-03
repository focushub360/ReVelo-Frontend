import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowDownWideNarrow,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronDown,
  Filter,
  Fuel,
  Gauge,
  Heart,
  MapPin,
  Menu,
  Search,
  Settings2,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { api } from '../lib/api.js';
import logo from '../assets/revelo-logo.png';
import heroCar from '../assets/revelo-hero-car-v2.png';
import heroDrive from '../assets/revelo-hero-drive-v3.png';
import sellHandover from '../assets/revelo-sell-handover-v1.png';
import carLineup from '../assets/revelo-car-lineup-3d.png';
import { CarTransition } from '../components/CarTransition.jsx';
import '../styles/publicExperience.css';
import '../styles/marketplace.css';
import '../styles/headerRefresh.css';
import '../styles/marketplaceScale.css';

const money = (v) => v == null ? 'Price on request' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
const links = [['/', 'Home'], ['/cars', 'Buy Cars'], ['/sell-your-car', 'Sell Your Car'], ['/become-a-dealer', 'Become a Dealer']];
export function PublicHeader() { const [open, setOpen] = useState(false); return <header className="rv-header"><div className="rv-header-accent"/><div className="rv-container rv-nav"><Link className="rv-brand" to="/"><img src={logo} alt="ReVelo"/><span className="rv-brand-copy">ReVelo</span></Link><nav className="rv-desktop-nav" aria-label="Main navigation">{links.map(([to, text]) => <NavLink key={to} to={to} end={to === '/'}>{text}</NavLink>)}</nav><div className="rv-nav-actions"><Link className="rv-account" to="/account/login">My Account</Link><Link className="rv-dealer" to="/dealer/login">Dealer Login <ArrowRight size={15}/></Link><button className="rv-menu" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div></div>{open && <nav className="rv-mobile-nav">{[...links, ['/account/login', 'My Account'], ['/dealer/login', 'Dealer Login']].map(([to, text]) => <Link onClick={() => setOpen(false)} key={to} to={to}>{text}</Link>)}</nav>}</header>; }
function FooterLinks({ title, items }) { return <div><h2>{title}</h2>{items.map(([text, to]) => <Link key={text} to={to}>{text}</Link>)}</div>; }
export function PublicFooter() { return <footer className="rv-footer"><div className="rv-container rv-footer-grid"><div><div className="rv-brand"><img src={logo} alt="ReVelo"/><span>ReVelo</span></div><p>Driven by trust. Refined for you.</p><p>A connected vehicle journey for buying, selling and dealership operations.</p></div><FooterLinks title="Explore" items={[['Home','/'],['Buy Cars','/cars'],['Featured Vehicles','/cars']]}/><FooterLinks title="Sell" items={[['Sell Your Car','/sell-your-car'],['Seller Onboarding','/sell-your-car/start'],['How It Works','/#how-it-works']]}/><FooterLinks title="Account" items={[['My Account','/account/login'],['Dealer Login','/dealer/login'],['Become a Dealer','/become-a-dealer']]}/><div><h2>Legal & support</h2><p>Privacy, terms and contact links are configured when approved business details are available.</p></div></div><div className="rv-container rv-copyright">© {new Date().getFullYear()} ReVelo. All rights reserved.</div></footer>; }
function PublicLayout({ children, className = '' }) { return <div className={`rv-page ${className}`}><PublicHeader/>{children}<PublicFooter/></div>; }
const Button = ({ to, children, kind = 'primary' }) => <Link className={`rv-${kind}`} to={to}>{children}<ArrowRight size={18}/></Link>;

function TransitionLink({ to, destination, start, className, children }) { return <Link className={className} to={to} onClick={(event) => { event.preventDefault(); start(destination, to); }}>{children}</Link>; }
function Hero({ start }) { return <section className="rv-hero rv-hero-full" style={{ backgroundImage: `url(${heroDrive})` }}><div className="rv-container rv-hero-grid"><div className="rv-hero-copy"><p className="rv-eyebrow">The ReVelo experience</p><h1>Move through every <em>journey</em> with confidence.</h1><p className="rv-hero-intro">Find your next car. Start your next chapter.</p><p className="rv-lead">A connected, quality-focused experience for buying or selling a pre-owned vehicle.</p><div className="rv-hero-actions"><TransitionLink className="rv-primary" destination="buy" to="/cars" start={start}>Explore Cars<ArrowRight size={18}/></TransitionLink><TransitionLink className="rv-secondary" destination="sell" to="/sell-your-car" start={start}>Sell Your Car<ArrowRight size={18}/></TransitionLink></div><div className="rv-hero-note"><CheckCircle2/> Built around a structured vehicle lifecycle</div></div><div className="rv-hero-full-tag"><span>ReVelo drive</span><b>Forward, refined.</b></div></div></section>; }
function JourneyShowcase({ start }) { return <section className="rv-showcase"><div className="rv-container"><div className="rv-showcase-heading"><p className="rv-eyebrow">Choose your path</p><h2>What’s your next move?</h2><p>Two simple ways to move forward with ReVelo.</p></div><div className="rv-showcase-grid"><TransitionLink className="rv-showcase-card" destination="buy" to="/cars" start={start}><img src={heroCar} alt="Blue vehicle available in the marketplace"/><span><b>Buy a Car</b><small>Discover quality-focused pre-owned cars, clearly presented for your next decision.</small></span><i>Explore cars <ArrowRight/></i></TransitionLink><TransitionLink className="rv-showcase-card rv-sell-card" destination="sell" to="/sell-your-car" start={start}><img src={sellHandover} alt="Car key handover for a vehicle selling journey"/><span><b>Sell Your Car</b><small>Start with the details you know today, then let the right team guide the process.</small></span><i>Start selling <ArrowRight/></i></TransitionLink></div></div></section>; }
function VehicleCard({ vehicle, marketplaceIndex }) {
  const [favorite, setFavorite] = useState(false);
  const title = [vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Vehicle listing';
  const badge = ['Featured', 'Popular', '', 'Certified'][marketplaceIndex % 4];

  return (
    <article className={`rv-vehicle-card${marketplaceIndex == null ? '' : ' rv-marketplace-card'}`}>
      <div className="rv-vehicle-image">
        {vehicle.images?.[0]?.url ? (
          <img src={vehicle.images[0].url} alt={vehicle.images[0].alt || title} loading="lazy" />
        ) : (
          <div className="rv-vehicle-image-empty"><CarFront size={34}/><span>Vehicle image coming soon</span></div>
        )}
        {marketplaceIndex != null && (
          <>
            {badge && <span className={`rv-vehicle-badge rv-vehicle-badge-${badge.toLowerCase()}`}>{badge}</span>}
            <button
              className={`rv-favorite${favorite ? ' is-favorite' : ''}`}
              type="button"
              aria-label={favorite ? `Remove ${title} from saved cars` : `Save ${title}`}
              aria-pressed={favorite}
              onClick={() => setFavorite((saved) => !saved)}
            >
              <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </>
        )}
      </div>
      <div className="rv-vehicle-info">
        <p>{vehicle.year || 'Year not listed'} <span>·</span> {vehicle.variant || 'Pre-owned'}</p>
        <h3>{title}</h3>
        <div className="rv-specs">
          <span><CalendarDays /> {vehicle.year || 'Year —'}</span>
          <span><Gauge /> {vehicle.odometer ? `${vehicle.odometer.toLocaleString()} km` : 'Mileage —'}</span>
          <span><Fuel /> {vehicle.fuelType || 'Fuel —'}</span>
          <span><Settings2 /> {vehicle.transmission || 'Transmission —'}</span>
        </div>
        <div className="rv-marketplace-card-footer">
          {vehicle.dealer?.city && (
            <small><MapPin /> {[vehicle.dealer.city, vehicle.dealer.state].filter(Boolean).join(', ')}</small>
          )}
          <b>{money(vehicle.price)}</b>
          <Link to={`/cars/${vehicle.id}`}>View Details <ArrowRight size={14} /></Link>
        </div>
      </div>
    </article>
  );
}
function MarketplacePreview() {
  return (
    <section className="rv-love-cars" aria-label="Marketplace preview">
      <div className="rv-container">
        <div className="rv-love-heading"><i/><h2>Find a Car You’ll Love</h2><i/></div>
        <div className="rv-love-content">
          <div className="rv-love-vehicles"><img src={carLineup} alt="A decorative lineup of premium cars"/></div>
          <Link className="rv-love-all" to="/cars">View All Cars <ArrowRight size={18}/></Link>
        </div>
      </div>
    </section>
  );
}
function Featured() { const q = useQuery({ queryKey: ['landing-featured'], queryFn: () => api.get('/public/vehicles', { params: { limit: 4 } }).then(r => r.data), retry: false }); return <section className="rv-section rv-featured"><div className="rv-container"><div className="rv-section-row"><div className="rv-heading"><p className="rv-eyebrow">Marketplace</p><h2>Curated for Your Next Journey.</h2><p>Explore vehicles currently available through the ReVelo marketplace.</p></div><Link className="rv-text-link" to="/cars">Explore All Cars <ArrowRight size={17}/></Link></div>{q.isLoading && <div className="rv-vehicle-grid">{[1,2,3,4].map(i => <div className="rv-skeleton" key={i}/>)}</div>}{q.isError && <div className="rv-state"><h3>We could not load vehicles right now.</h3><p>The marketplace remains available when the connection is restored.</p><Button kind="secondary" to="/cars">Explore Marketplace</Button></div>}{q.data && !q.data.items.length && <div className="rv-state"><CarFront/><h3>New vehicles are coming soon.</h3><p>Approved inventory appears here as it becomes available.</p><Button to="/cars">Explore Marketplace</Button></div>}{q.data?.items?.length > 0 && <div className="rv-vehicle-grid">{q.data.items.map(v => <VehicleCard key={v.id} vehicle={v}/>)}</div>}</div></section>; }
function HowItWorks() { const steps = [['01','Explore','Find your ideal car.',CarFront],['02','Connect','Get in touch with dealers.',CalendarCheck],['03','Drive Away','Complete your purchase.',CheckCircle2]]; return <section id="how-it-works" className="rv-section rv-works"><div className="rv-container"><div className="rv-heading"><h2>How ReVelo Works</h2><p>A simple process. A better experience.</p></div><div className="rv-design-process">{steps.map(([number,title,text,Icon], index)=><article key={number}><span className="rv-process-icon"><Icon/></span><div><b>{number}. {title}</b><p>{text}</p></div>{index < 2 && <ArrowRight className="rv-process-arrow"/>}</article>)}</div></div></section>; }
function Value() { const cards = [['Structured Vehicle Inspection','Vehicle condition is evaluated through the applicable inspection workflow.'],['Transparent Process','Relevant enquiry and transaction progress can be tracked.'],['Organized Vehicle Management','Vehicles move through a managed acquisition and preparation process.'],['Connected Customer Experience','Buyers and sellers can access their own authorized activities.']]; return <section className="rv-section rv-value"><div className="rv-container rv-value-grid"><div><p className="rv-eyebrow">Built around a connected lifecycle</p><h2>A Better Way to Buy and Sell Pre-Owned Cars</h2><p>ReVelo connects vehicle acquisition, inspection, refurbishment, and resale through a structured vehicle lifecycle.</p></div><div className="rv-benefit-grid">{cards.map(([title, text], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>; }
function Closing({ start }) { return <section className="rv-closing"><div className="rv-container"><div><p className="rv-eyebrow">Your journey starts here</p><h2>Ready for Your Next Move?</h2><p>Whether you’re looking for your next car or preparing to sell your current one, start with ReVelo.</p></div><div><TransitionLink className="rv-primary" destination="buy" to="/cars" start={start}>Explore Cars<ArrowRight size={18}/></TransitionLink><TransitionLink className="rv-ghost" destination="sell" to="/sell-your-car" start={start}>Sell Your Car<ArrowRight size={18}/></TransitionLink></div></div></section>; }
export function Landing() { const go = useNavigate(); const [transition, setTransition] = useState(null); const locked = useRef(false); const start = (destination, path) => { if (locked.current) return; locked.current = true; setTransition({ destination, path }); }; const complete = () => { const path = transition?.path; setTransition(null); locked.current = false; if (path) go(path); }; return <PublicLayout><main><Hero start={start}/><JourneyShowcase start={start}/><MarketplacePreview/><Featured/><HowItWorks/><Value/><Closing start={start}/>{transition && <CarTransition destination={transition.destination} onComplete={complete}/>}</main></PublicLayout>; }

export function Cars() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    year: '',
    fuelType: '',
    transmission: '',
    minPrice: 0,
    maxPrice: 10000000,
  });
  const params = {
    search: appliedSearch || undefined,
    page,
    limit: 8,
    sort,
    make: filters.make || undefined,
    model: filters.model || undefined,
    yearMin: filters.year || undefined,
    yearMax: filters.year || undefined,
    fuelType: filters.fuelType || undefined,
    transmission: filters.transmission || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice < 10000000 ? filters.maxPrice : undefined,
  };
  const q = useQuery({
    queryKey: ['cars', params],
    queryFn: () => api.get('/public/vehicles', { params }).then((response) => response.data),
    retry: false,
  });

  function updateFilter(name, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setSearch('');
    setAppliedSearch('');
    setPage(1);
    setSort('newest');
    setFilters({
      make: '',
      model: '',
      year: '',
      fuelType: '',
      transmission: '',
      minPrice: 0,
      maxPrice: 10000000,
    });
  }

  const modelsByMake = {
    Audi: ['A3', 'A4', 'A6', 'Q3', 'Q5'],
    BMW: ['3 Series', '5 Series', 'X1', 'X3'],
    Honda: ['City', 'Civic', 'Elevate'],
    'Maruti Suzuki': ['Baleno', 'Brezza', 'Swift'],
    'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'GLA'],
    Toyota: ['Camry', 'Fortuner', 'Innova', 'Urban Cruiser'],
  };
  const displayedStart = q.data?.total ? (page - 1) * 8 + 1 : 0;
  const displayedEnd = Math.min(page * 8, q.data?.total || 0);

  return (
    <PublicLayout className="rv-marketplace-page">
      <main className="rv-marketplace">
        <section className="rv-market-hero">
          <img className="rv-market-hero-image" src={heroCar} alt="" />
          <div className="rv-market-hero-copy">
            <p className="rv-market-eyebrow">Explore our inventory <span /></p>
            <h1>Find the Perfect<br />Pre-Owned <em>Car</em></h1>
            <p>Quality-checked vehicles. A smoother journey ahead.</p>
            <a className="rv-market-browse" href="#inventory">Browse Cars <ArrowRight size={16} /></a>
          </div>
          <div className="rv-market-hero-wedge" aria-hidden="true" />
        </section>

        <section className="rv-inventory-search" aria-label="Search vehicle inventory">
          <form
            className="rv-inventory-search-form"
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedSearch(search.trim());
              setPage(1);
            }}
          >
            <label className="rv-market-search-input">
              <Search size={17} />
              <input
                aria-label="Search by make or model"
                placeholder="Search by make, model..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label className="rv-market-select">
              <CarFront />
              <select aria-label="All makes" value={filters.make} onChange={(event) => {
                updateFilter('make', event.target.value);
                updateFilter('model', '');
              }}>
                <option value="">All Makes</option>
                {Object.keys(modelsByMake).map((make) => <option key={make}>{make}</option>)}
              </select>
              <ChevronDown />
            </label>
            <label className="rv-market-select">
              <SlidersHorizontal />
              <select aria-label="All models" value={filters.model} onChange={(event) => updateFilter('model', event.target.value)}>
                <option value="">All Models</option>
                {(modelsByMake[filters.make] || Object.values(modelsByMake).flat()).map((model) => (
                  <option key={model}>{model}</option>
                ))}
              </select>
              <ChevronDown />
            </label>
            <label className="rv-market-select">
              <CalendarDays />
              <select aria-label="Any year" value={filters.year} onChange={(event) => updateFilter('year', event.target.value)}>
                <option value="">Any Year</option>
                {Array.from({ length: 15 }, (_, index) => new Date().getFullYear() - index).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown />
            </label>
            <label className="rv-market-select rv-market-select-optional">
              <Fuel />
              <select aria-label="Any fuel type" value={filters.fuelType} onChange={(event) => updateFilter('fuelType', event.target.value)}>
                <option value="">Any Fuel Type</option>
                {['Petrol', 'Diesel', 'Hybrid', 'Electric'].map((fuel) => <option key={fuel}>{fuel}</option>)}
              </select>
              <ChevronDown />
            </label>
            <label className="rv-market-select rv-market-select-optional">
              <Settings2 />
              <select aria-label="Any transmission" value={filters.transmission} onChange={(event) => updateFilter('transmission', event.target.value)}>
                <option value="">Any Transmission</option>
                {['Automatic', 'Manual'].map((transmission) => <option key={transmission}>{transmission}</option>)}
              </select>
              <ChevronDown />
            </label>
            <button className="rv-market-search-button" type="submit">Search Cars</button>
          </form>
        </section>

        <section className="rv-market-results" id="inventory">
          <aside className="rv-filter-panel" aria-label="Filter results">
            <h2><Filter size={16} /> Filter Results</h2>
            <div className="rv-filter-group">
              <label htmlFor="market-price-min">Price Range</label>
              <div className="rv-price-ranges">
                <input
                  id="market-price-min"
                  aria-label="Minimum price"
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={filters.minPrice}
                  onChange={(event) => updateFilter('minPrice', Math.min(Number(event.target.value), filters.maxPrice))}
                />
                <input
                  aria-label="Maximum price"
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={filters.maxPrice}
                  onChange={(event) => updateFilter('maxPrice', Math.max(Number(event.target.value), filters.minPrice))}
                />
                <div><span>{money(filters.minPrice)}</span><span>{filters.maxPrice === 10000000 ? `${money(filters.maxPrice)}+` : money(filters.maxPrice)}</span></div>
              </div>
            </div>
            <label className="rv-filter-group">
              Year
              <select value={filters.year} onChange={(event) => updateFilter('year', event.target.value)}>
                <option value="">Any Year</option>
                {Array.from({ length: 15 }, (_, index) => new Date().getFullYear() - index).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            <fieldset className="rv-filter-group">
              <legend>Fuel Type</legend>
              {['Petrol', 'Diesel', 'Hybrid', 'Electric'].map((fuel) => (
                <label key={fuel}><input type="checkbox" checked={filters.fuelType === fuel} onChange={() => updateFilter('fuelType', filters.fuelType === fuel ? '' : fuel)} />{fuel}</label>
              ))}
            </fieldset>
            <fieldset className="rv-filter-group">
              <legend>Transmission</legend>
              {['Automatic', 'Manual'].map((transmission) => (
                <label key={transmission}><input type="checkbox" checked={filters.transmission === transmission} onChange={() => updateFilter('transmission', filters.transmission === transmission ? '' : transmission)} />{transmission}</label>
              ))}
            </fieldset>
            <button className="rv-clear-filters" type="button" onClick={clearFilters}>Clear Filters</button>
          </aside>

          <div className="rv-inventory-listings">
            <div className="rv-listings-toolbar">
              <p>
                {q.isLoading ? 'Finding vehicles...' : q.data
                  ? `Showing ${displayedStart}–${displayedEnd} of ${q.data.total} vehicles`
                  : 'Available vehicles'}
              </p>
              <label className="rv-sort-control"><ArrowDownWideNarrow /><span className="rv-sort-label">Sort</span>
                <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <ChevronDown />
              </label>
            </div>
            {q.isLoading && <p className="rv-market-status" role="status">Loading approved listings…</p>}
            {q.isError && <p className="rv-market-status" role="alert">Listings are unavailable right now. Please try again.</p>}
            {q.data && q.data.items.length > 0 && (
              <div className="rv-vehicle-grid rv-marketplace-grid">
                {q.data.items.map((vehicle, index) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} marketplaceIndex={index} />
                ))}
              </div>
            )}
            {q.data && !q.data.items.length && (
              <div className="rv-market-empty"><CarFront /><h2>No cars match those filters</h2><p>Try adjusting your search or clearing one of the filters.</p></div>
            )}
            {q.data?.pages > 1 && (
              <nav className="rv-pagination" aria-label="Vehicle listing pages">
                <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
                <span>Page {page} of {q.data.pages}</span>
                <button disabled={page >= q.data.pages} onClick={() => setPage((current) => current + 1)}>Next</button>
              </nav>
            )}
            <aside className="rv-sell-banner">
              <img src={sellHandover} alt="" />
              <span className="rv-sell-banner-icon"><CarFront /></span>
              <div><h2>Ready to Sell Your Car?</h2><p>Get the best value with a simple and convenient process.</p></div>
              <Link to="/sell-your-car">Start Selling <ArrowRight size={16} /></Link>
            </aside>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
export function CarDetail() { const {listingId}=useParams(); const q=useQuery({queryKey:['car',listingId],queryFn:()=>api.get(`/public/vehicles/${listingId}`).then(r=>r.data.vehicle),retry:false}); if(q.isLoading)return <PublicLayout><p className="rv-status">Loading vehicle…</p></PublicLayout>; if(q.isError)return <PublicLayout><p className="rv-status">This approved listing is no longer available.</p></PublicLayout>; const v=q.data; const title=[v.make,v.model].filter(Boolean).join(' ') || 'Available vehicle'; return <PublicLayout><main className="rv-detail rv-container"><div className="rv-detail-image">{v.images?.[0]?.url?<img src={v.images[0].url} alt={v.images[0].alt||title}/>:<div className="rv-vehicle-image-empty"><CarFront size={46}/><span>Vehicle photos will be added soon</span></div>}</div><div><p className="rv-eyebrow">Available vehicle</p><h1>{[v.make,v.model,v.variant].filter(Boolean).join(' ')}</h1><div className="rv-detail-specs">{[['Year',v.year],['Fuel',v.fuelType],['Transmission',v.transmission],['Mileage',v.odometer?`${v.odometer.toLocaleString()} km`:'—']].map(([k,x])=><div key={k}><span>{k}</span><b>{x||'—'}</b></div>)}</div><p className="rv-price">{money(v.price)}</p><Button to="/account/login">Interested in this car</Button></div></main></PublicLayout>; }
export function DealerApplication(){const [form,setForm]=useState({legalName:'',contactName:'',email:'',phone:'',line1:'',city:'',businessType:'',notes:'',consent:false});const m=useMutation({mutationFn:()=>api.post('/public/dealer-applications',{legalName:form.legalName,contactName:form.contactName,email:form.email,phone:form.phone,address:{line1:form.line1,city:form.city},businessType:form.businessType,notes:form.notes,consent:form.consent})});return <PublicLayout><main className="rv-simple rv-container"><p className="rv-eyebrow">Partner with ReVelo</p><h1>Become a dealer</h1><p>Submit your business details for platform review. An application never creates a dealer administrator account automatically.</p>{m.isSuccess?<div className="rv-state"><CheckCircle2/><h2>Application received</h2><p>Reference: {m.data.data.reference}. The platform team will review it before any account can be provisioned.</p></div>:<form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={e=>{e.preventDefault();m.mutate();}}>{[['legalName','Business / legal name'],['contactName','Contact person'],['email','Business email'],['phone','Mobile number'],['line1','Business address'],['city','City'],['businessType','Business type']].map(([key,label])=><label key={key} className="label">{label}<input className="field mt-1" type={key==='email'?'email':'text'} required={key!=='businessType'} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}<label className="label sm:col-span-2">About your business<textarea className="field mt-1" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label><label className="sm:col-span-2 text-sm text-slate-600"><input type="checkbox" required checked={form.consent} onChange={e=>setForm({...form,consent:e.target.checked})}/> I consent to ReVelo contacting me about this application.</label>{m.isError&&<p className="text-sm text-red-600 sm:col-span-2">{m.error.response?.data?.error?.message||'Unable to submit application.'}</p>}<button className="rv-primary w-fit border-0" disabled={m.isPending}>{m.isPending?'Submitting…':'Submit application'} <ArrowRight size={18}/></button></form>}</main></PublicLayout>;}
export function SellYourCar(){const dealers=useQuery({queryKey:['public-dealers'],queryFn:()=>api.get('/public/dealers').then(r=>r.data)});const [form,setForm]=useState({dealershipCode:'',name:'',phone:'',email:'',registration:'',make:'',model:'',variant:'',year:'',fuelType:'',transmission:'',odometer:'',accidentHistory:'',serviceHistory:'',initialCondition:'',consent:false});const m=useMutation({mutationFn:()=>api.post('/public/seller-enquiries',{dealershipCode:form.dealershipCode,seller:{name:form.name,phone:form.phone,email:form.email||undefined},vehicle:{registration:form.registration,make:form.make,model:form.model,variant:form.variant||undefined,year:form.year||undefined,fuelType:form.fuelType||undefined,transmission:form.transmission||undefined,odometer:form.odometer||undefined},condition:{accidentHistory:form.accidentHistory||undefined,serviceHistory:form.serviceHistory||undefined,initialCondition:form.initialCondition||undefined},consent:form.consent})});const field=(key,label,type='text',required=true)=><label className="label" key={key}>{label}<input className="field mt-1" type={type} required={required} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>;return <PublicLayout><main className="rv-simple rv-container"><p className="rv-eyebrow">Sell with ReVelo</p><h1>Tell us about your car.</h1><p>A participating dealer will evaluate your enquiry through its secure acquisition workflow.</p>{m.isSuccess?<div className="rv-state"><CheckCircle2/><h2>Your vehicle submission is in</h2><p>Reference: <b>{m.data.data.reference}</b>. Sign in to your account when an authorised account is available to follow the journey.</p><Button to="/account/login">My account</Button></div>:<form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={e=>{e.preventDefault();m.mutate();}}><h2 className="sm:col-span-2 text-xl font-bold text-navy">Your details</h2>{field('name','Full name')}{field('phone','Mobile number','tel')}{field('email','Email address','email',false)}<label className="label">Preferred dealership<select required className="field mt-1" value={form.dealershipCode} onChange={e=>setForm({...form,dealershipCode:e.target.value})}><option value="">Select a dealership</option>{dealers.data?.map(d=><option value={d.code} key={d.code}>{d.name} · {d.city}</option>)}</select></label><h2 className="sm:col-span-2 mt-3 text-xl font-bold text-navy">Vehicle information</h2>{field('registration','Registration number')}{field('make','Make')}{field('model','Model')}{field('variant','Variant', 'text', false)}{field('year','Registration year','number',false)}{field('odometer','Odometer reading','number',false)}{field('fuelType','Fuel type','text',false)}{field('transmission','Transmission','text',false)}<h2 className="sm:col-span-2 mt-3 text-xl font-bold text-navy">Condition and history</h2>{['accidentHistory','serviceHistory','initialCondition'].map(key=><label className="label sm:col-span-2" key={key}>{key==='accidentHistory'?'Accident or damage history':key==='serviceHistory'?'Service history':'Known condition or defects'}<textarea className="field mt-1" value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}<label className="sm:col-span-2 text-sm text-slate-600"><input type="checkbox" required checked={form.consent} onChange={e=>setForm({...form,consent:e.target.checked})}/> I consent to ReVelo processing these details and contacting me about this enquiry.</label>{m.isError&&<p className="text-sm text-red-600 sm:col-span-2">{m.error.response?.data?.error?.message||'Unable to submit enquiry.'}</p>}<button className="rv-primary w-fit border-0" disabled={m.isPending}>{m.isPending?'Submitting…':'Submit vehicle enquiry'} <ArrowRight size={18}/></button></form>}</main></PublicLayout>;}
export function PortalHome(){const {section='dashboard'}=useParams();const me=useQuery({queryKey:['portal-me'],queryFn:()=>api.get('/auth/me').then(r=>r.data.user),retry:false});const go=useNavigate();const endpoint={enquiries:'/portal/enquiries',vehicles:'/portal/enquiries',documents:'/portal/documents',negotiations:'/portal/negotiations',appointments:'/portal/appointments',transactions:'/portal/transactions'}[section];const records=useQuery({queryKey:['portal',section],queryFn:()=>endpoint?api.get(endpoint).then(r=>r.data):Promise.resolve([]),enabled:Boolean(endpoint)&&Boolean(me.data),retry:false});useEffect(()=>{if(me.data&&me.data.role!=='Buyer & Seller')go(me.data.role==='Super Admin'?'/platform/dashboard':'/dealer/dashboard',{replace:true});},[me.data,go]);if(me.isLoading)return <p className="rv-status">Loading account…</p>;if(me.isError)return <Link to="/account/login" className="rv-status">Sign in to your account</Link>;const items=section==='vehicles'?(records.data||[]).map(x=>x.vehicle).filter(Boolean):(records.data||[]);return <main className="min-h-screen bg-slate-50"><PublicHeader/><div className="rv-container rv-portal"><p>My account</p><h1>Welcome, {me.data.name}</h1><nav className="my-5 flex flex-wrap gap-3">{['dashboard','enquiries','vehicles','documents','negotiations','appointments','transactions','profile'].map(x=><Link className="rounded-full bg-white px-3 py-2 text-sm shadow-sm" key={x} to={`/account/${x}`}>{x}</Link>)}</nav><section className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="capitalize">{section}</h2>{section==='dashboard'||section==='profile'?<p className="mt-3 text-slate-600">Your account is connected to authorised buyer and seller records only. Use the sections above to view current activity.</p>:records.isLoading?<p className="mt-3">Loading your authorised records…</p>:records.isError?<p className="mt-3 text-red-600">We could not load this section.</p>:!items.length?<p className="mt-3 text-slate-600">There are no authorised {section} to show yet.</p>:<div className="mt-4 grid gap-3">{items.map((item,i)=><article className="rounded-xl border border-slate-200 p-4" key={item._id||item.id||i}><b>{item.enquiryCode||item.category||item.vehicle?.make||item.make||'ReVelo record'}</b><p className="mt-1 text-sm text-slate-600">{item.status||'In progress'} {item.vehicle?.model||item.model?` · ${item.vehicle?.model||item.model}`:''}</p></article>)}</div>}</section></div></main>;}
