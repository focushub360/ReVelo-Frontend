const stages = ['Enquiry Received', 'Document Verification', 'Vehicle Inspection', 'Parking / Yard', 'Refurbishment', 'Quality Assurance', 'Ready for Sale', 'Sold'];

export function LifecycleTracker({ breakdown = [] }) {
  const counts = new Map(breakdown.map((item) => [item._id, item.count]));
  const activeStages = stages.filter((stage) => counts.has(stage));
  const shown = activeStages.length ? activeStages : stages;
  return (
    <section className="card lifecycle-tracker p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.12em] text-champagne">Vehicle lifecycle</p>
        <h2 className="mt-1 text-xl font-bold text-navy">Stock progression</h2>
        <p className="mt-1 text-sm text-slate-500">Live counts from the current vehicle lifecycle.</p>
      </div>
      <ol className="lifecycle-stages">
        {shown.map((stage, index) => <li key={stage} className={(counts.get(stage) || 0) > 0 ? 'is-active' : ''}><span>{index + 1}</span><div><b>{stage === 'Ready for Sale' ? 'Ready for Resale' : stage}</b><small>{counts.get(stage) || 0} vehicles</small></div></li>)}
      </ol>
    </section>
  );
}
