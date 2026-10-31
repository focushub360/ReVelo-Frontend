export function ReviewBlock({ title, items }) {
  return <section className="rounded-xl border border-slate-200 p-4"><h3 className="font-bold text-navy">{title}</h3><dl className="mt-3 space-y-2">{items.map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="break-words font-medium text-slate-700">{value || '—'}</dd></div>)}</dl></section>;
}

export function yesNo(value) { return value === undefined ? '—' : value ? 'Yes' : 'No'; }
