export function PageHero({ eyebrow = 'ReVelo workspace', title, description, children }) {
  return (
    <div className="workspace-hero relative overflow-hidden rounded-2xl bg-navy px-6 py-7 text-white shadow-float md:px-8">
      <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border-[20px] border-champagne/20" />
      <div className="absolute right-28 top-8 h-px w-20 bg-champagne/70" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-champagne">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.04em] md:text-[2.35rem]">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">{description}</p>
        </div>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
