import { useEffect, useRef } from 'react';
import './CarTransition.css';
import './CarTransitionRollback.css';

const copy = {
  buy: 'Finding your next drive...',
  sell: 'Starting your selling journey...',
};

export function CarTransition({ destination, onComplete }) {
  const completed = useRef(false);
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      if (!completed.current) { completed.current = true; onComplete(); }
    }, reduced ? 90 : 840);
    return () => window.clearTimeout(timer);
  }, [onComplete]);
  return <div className="rv-transition" role="status" aria-live="polite" aria-label={copy[destination]}>
    <div className="rv-transition-brand">ReVelo</div>
    <p>{copy[destination]}</p>
    <div className="rv-motion-lines" aria-hidden="true"><i/><i/><i/></div>
    <div className="rv-transition-car" aria-hidden="true"><Sedan/></div>
    <div className="rv-road" aria-hidden="true"><span/><span/><span/><span/></div>
  </div>;
}

function Sedan() { return <svg viewBox="0 0 520 190" focusable="false">
  <defs><linearGradient id="body" x1="0" x2="1"><stop stopColor="#dce7f0"/><stop offset=".42" stopColor="#7d9ab4"/><stop offset="1" stopColor="#eff6fb"/></linearGradient><linearGradient id="glass" x1="0" x2="1"><stop stopColor="#102d4d"/><stop offset="1" stopColor="#396488"/></linearGradient></defs>
  <path className="rv-car-shadow" d="M55 166h409l-27 13H80z"/><path className="rv-car-body" d="M31 132c7-23 20-37 42-42l100-17 52-43c12-10 28-15 45-15h86c22 0 38 8 52 25l47 58 31 12c17 7 25 17 25 35v13H31z"/><path className="rv-car-glass" d="m188 70 47-39c10-8 22-12 37-12h78c15 0 27 6 37 19l28 36z"/><path className="rv-car-seam" d="M186 76h218M229 33l-5 43m112-55 6 54M72 111h55m303 0h47"/>
  <path className="rv-car-light" d="M452 103h25l8 9h-34z"/><circle className="rv-wheel" cx="137" cy="147" r="35"/><circle className="rv-rim" cx="137" cy="147" r="19"/><circle className="rv-wheel" cx="401" cy="147" r="35"/><circle className="rv-rim" cx="401" cy="147" r="19"/>
 </svg>; }
