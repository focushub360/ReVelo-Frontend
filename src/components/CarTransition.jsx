import { useEffect } from 'react';

export function CarTransition({ destination, onComplete }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 700);
    return () => window.clearTimeout(timer);
  }, [onComplete]);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#071d36] text-center text-white"><div><p className="text-sm font-bold tracking-[.2em] text-[#cbe770]">{destination === 'sell' ? 'STARTING YOUR SELLING JOURNEY...' : 'FINDING YOUR NEXT DRIVE...'}</p><div className="mt-5 h-1 w-64 overflow-hidden rounded bg-white/20"><i className="block h-full w-full animate-pulse bg-[#cbe770]"/></div></div></div>;
}
