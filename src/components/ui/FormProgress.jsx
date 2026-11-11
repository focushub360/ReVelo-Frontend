export function FormProgress({ steps, current }) {
  return <ol className="form-progress">{steps.map((label, index) => <li key={label} className={index === current ? 'is-current' : index < current ? 'is-complete' : ''}><span>{index < current ? '✓' : index + 1}</span><b>{label}</b></li>)}</ol>;
}
