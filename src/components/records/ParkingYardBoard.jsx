import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, MousePointer2, Move, PenLine, RotateCcw, Save, Square, Trash2, Undo2, Redo2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHero } from '../layout/PageHero.jsx';
import { api } from '../../lib/api.js';

const empty = { name: 'Main Parking Lot', canvas: { width: 2000, height: 1200, gridSize: 20 }, roads: [] };
const statusColor = { Available: '#22c55e', Occupied: '#ef4444', Reserved: '#f59e0b', Blocked: '#64748b', Maintenance: '#8b5cf6' };
const path = (points = []) => points.length < 2 ? '' : `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')}`;
const getPoint = (event, canvas) => { const svg = event.currentTarget instanceof SVGSVGElement ? event.currentTarget : event.currentTarget.ownerSVGElement; const box = svg.getBoundingClientRect(); return { x: Math.max(0, Math.round((event.clientX - box.left) * canvas.width / box.width)), y: Math.max(0, Math.round((event.clientY - box.top) * canvas.height / box.height)) }; };
const frame = (a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) });
const pointLineDistance = (point, start, end) => {
  const [x, y] = point; const [x1, y1] = start; const [x2, y2] = end;
  const length = Math.hypot(x2 - x1, y2 - y1);
  if (!length) return Math.hypot(x - x1, y - y1);
  return Math.abs((x2 - x1) * (y1 - y) - (x1 - x) * (y2 - y1)) / length;
};
const simplifyPath = (points, tolerance = 18) => {
  if (points.length < 3) return points;
  let greatest = tolerance; let splitAt = -1;
  for (let index = 1; index < points.length - 1; index += 1) { const distance = pointLineDistance(points[index], points[0], points.at(-1)); if (distance > greatest) { greatest = distance; splitAt = index; } }
  if (splitAt < 0) return [points[0], points.at(-1)];
  return [...simplifyPath(points.slice(0, splitAt + 1), tolerance).slice(0, -1), ...simplifyPath(points.slice(splitAt), tolerance)];
};
const cleanRoad = (rawPoints) => {
  const corners = simplifyPath(rawPoints);
  return corners.reduce((result, originalEnd, index) => {
    if (!index) return [originalEnd];
    const start = result.at(-1); const dx = originalEnd[0] - start[0]; const dy = originalEnd[1] - start[1];
    if (Math.abs(dx) > Math.abs(dy) * 1.45) return [...result, [originalEnd[0], start[1]]];
    if (Math.abs(dy) > Math.abs(dx) * 1.45) return [...result, [start[0], originalEnd[1]]];
    return [...result, originalEnd];
  }, []);
};

export function ParkingYardBoard({ title, rows, loading, error, canConfigure = false }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tool, setTool] = useState('select'); const [gesture, setGesture] = useState(null); const [selected, setSelected] = useState(null);
  const [undo, setUndo] = useState([]); const [redo, setRedo] = useState([]); const [zoom, setZoom] = useState(.75); const [snap, setSnap] = useState(false); const [activeLot, setActiveLot] = useState('');
  const lots = useQuery({ queryKey: ['parking-lots'], queryFn: () => api.get('/parking/lots').then(r => r.data), retry: false });
  const lotQuery = activeLot ? `?lotId=${activeLot}` : '';
  const layoutKey = ['parking-layout', activeLot];
  const q = useQuery({ queryKey: layoutKey, queryFn: () => api.get(`/parking/layout${lotQuery}`).then(r => r.data), retry: false, onSuccess: () => qc.invalidateQueries({ queryKey: ['parking-lots'] }) });
  const data = q.data || {}; const layout = data.layout || empty; const canvas = layout.canvas || empty.canvas; const slots = data.slots || rows.filter(row => row.layout?.x != null);
  const refresh = () => { qc.invalidateQueries({ queryKey: layoutKey }); qc.invalidateQueries({ queryKey: ['parking/slots'] }); };
  const layoutMutation = useMutation({ mutationFn: body => api.put(`/parking/layout${lotQuery}`, body), onError: refresh });
  const createMutation = useMutation({ mutationFn: body => api.post(`/parking/layout/slots${lotQuery}`, body), onSuccess: refresh, onError: refresh });
  const editMutation = useMutation({ mutationFn: ({ id, ...body }) => api.patch(`/parking/layout/slots/${id}`, body), onSuccess: refresh, onError: refresh });
  const deleteMutation = useMutation({ mutationFn: id => api.delete(`/parking/slots/${id}`), onSuccess: () => { setSelected(null); refresh(); } });
  const publish = useMutation({ mutationFn: () => api.post(`/parking/layout/publish${lotQuery}`), onSuccess: refresh });
  const createLot = useMutation({ mutationFn: body => api.post('/parking/lots', body), onSuccess: result => { qc.invalidateQueries({ queryKey: ['parking-lots'] }); setActiveLot(result.data._id); } });
  const saveRoads = (roads, record = true) => { if (record) { setUndo(items => [...items, layout.roads]); setRedo([]); } qc.setQueryData(layoutKey, { ...data, layout: { ...layout, roads } }); layoutMutation.mutate({ name: layout.name, canvas, roads }); };
  const restore = (from, setFrom, setTo) => { const previous = from.at(-1); if (!previous) return; setTo(items => [...items, layout.roads]); setFrom(items => items.slice(0, -1)); saveRoads(previous, false); };
  const snapTo = value => snap ? Math.round(value / canvas.gridSize) * canvas.gridSize : value;
  const label = () => { const used = new Set(slots.map(slot => slot.code)); let n = 1; while (used.has(`P-${n}`)) n += 1; return `P-${n}`; };
  const selectedSlot = selected?.kind === 'slot' ? slots.find(slot => slot._id === selected.id) : null;
  const selectedRoad = selected?.kind === 'road' ? layout.roads.find(road => road.roadId === selected.id) : null;
  const start = event => { if (!canConfigure) return; event.currentTarget.setPointerCapture?.(event.pointerId); const p = getPoint(event, canvas); if (tool === 'move' && selected) { setGesture({ kind: 'move', target: selected, start: p, end: p }); return; } if (tool === 'select') { setSelected(null); return; } setGesture({ kind: tool, start: p, end: p, points: [[p.x, p.y]] }); };
  const draw = event => { if (!gesture) return; const p = getPoint(event, canvas); if (gesture.kind === 'road') { const last = gesture.points.at(-1); if (Math.hypot(last[0] - p.x, last[1] - p.y) > 3 && gesture.points.length < 280) setGesture({ ...gesture, end: p, points: [...gesture.points, [p.x, p.y]] }); } else setGesture({ ...gesture, end: p }); };
  const finish = () => { if (!gesture) return; const area = frame(gesture.start, gesture.end);
    if (gesture.kind === 'road' && gesture.points.length > 1) saveRoads([...layout.roads, { roadId: `road-${Date.now()}`, label: `Road ${layout.roads.length + 1}`, points: cleanRoad(gesture.points), width: 70, color: '#334155' }]);
    if (gesture.kind === 'slot' && area.width > 25 && area.height > 25) createMutation.mutate({ code: label(), x: snapTo(area.x), y: snapTo(area.y), width: snapTo(area.width), height: snapTo(area.height), rotation: 0, type: 'parking' });
    if (gesture.kind === 'move') { const dx = snapTo(gesture.end.x - gesture.start.x); const dy = snapTo(gesture.end.y - gesture.start.y); if (gesture.target.kind === 'slot') { const slot = slots.find(item => item._id === gesture.target.id); if (slot) editMutation.mutate({ id: slot._id, layout: { ...slot.layout, x: Math.max(0, slot.layout.x + dx), y: Math.max(0, slot.layout.y + dy) } }); } else saveRoads(layout.roads.map(road => road.roadId === gesture.target.id ? { ...road, points: road.points.map(([x, y]) => [Math.max(0, x + dx), Math.max(0, y + dy)]) } : road)); }
    setGesture(null);
  };
  const remove = () => { if (selectedSlot?.status === 'Available') deleteMutation.mutate(selectedSlot._id); if (selectedRoad) { saveRoads(layout.roads.filter(road => road.roadId !== selectedRoad.roadId)); setSelected(null); } };
  useEffect(() => {
    const removeWithKey = (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selected && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        remove();
      }
    };
    window.addEventListener('keydown', removeWithKey);
    return () => window.removeEventListener('keydown', removeWithKey);
  }, [selected, selectedRoad, selectedSlot]);
  const reset = () => { if (!layout.roads.length || !window.confirm('Remove every drawn road? Parking spaces will not be removed.')) return; saveRoads([]); setSelected(null); };
  const preview = gesture && frame(gesture.start, gesture.end);
  const moveOffset = gesture?.kind === 'move' ? { x: snapTo(gesture.end.x - gesture.start.x), y: snapTo(gesture.end.y - gesture.start.y) } : { x: 0, y: 0 };
  const newLot = () => { const name = window.prompt('Parking lot name, for example: Service Bay Parking'); if (name?.trim()) createLot.mutate({ name: name.trim() }); };
  return <><PageHero eyebrow="Paint-style parking designer" title={title} description="Draw freehand roads, place any-sized spaces, select objects, move them, or reset the road drawing."><div className="flex items-center gap-3"><div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right"><p className="text-xs text-slate-200">Spaces</p><p className="text-2xl font-bold">{slots.length}</p></div><button className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20" onClick={() => navigate('/dashboard')}><LogOut className="mr-2 inline" size={16}/>Exit editor</button></div></PageHero>
    <div className="card mt-5 flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Current parking lot</p><select className="field mt-1 min-w-[260px]" value={activeLot || layout._id || ''} onChange={event => { setActiveLot(event.target.value); setSelected(null); setTool('select'); }}>{!activeLot && <option value={layout._id || ''}>{layout.name}</option>}{(lots.data || []).map(lot => <option key={lot._id} value={lot._id}>{lot.name}</option>)}</select></div>{canConfigure && <button className="btn-primary" onClick={newLot}>+ New parking lot</button>}</div>
    {(loading || q.isLoading) && <div className="card mt-6 p-6">Loading parking canvas…</div>}{(error || q.isError) && <div className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">Unable to load the parking canvas.</div>}
    {!loading && !q.isLoading && !error && !q.isError && <section className="card mt-6 overflow-hidden"><header className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><h2 className="font-bold text-navy">{layout.name}</h2><p className="mt-1 text-sm text-slate-500">Select an object first, then use Move to reposition it.</p></div>{canConfigure && <div className="flex flex-wrap gap-2"><button className="btn-secondary px-3 py-2 text-xs" disabled={!undo.length} onClick={() => restore(undo, setUndo, setRedo)}><Undo2 size={14}/> Undo</button><button className="btn-secondary px-3 py-2 text-xs" disabled={!redo.length} onClick={() => restore(redo, setRedo, setUndo)}><Redo2 size={14}/> Redo</button><button className="btn-secondary px-3 py-2 text-xs text-red-700" disabled={!layout.roads.length} onClick={reset}><RotateCcw size={14}/> Reset canvas</button><button className="btn-primary px-3 py-2 text-xs" onClick={() => publish.mutate()}><Save size={14}/> Publish</button></div>}</header>
      <div className="flex flex-wrap items-center gap-2 border-b bg-slate-50 p-3"><Tool active={tool === 'select'} icon={<MousePointer2 size={16}/>} label="Select" onClick={() => setTool('select')}/><Tool active={tool === 'move'} icon={<Move size={16}/>} label="Move selected" disabled={!selected} onClick={() => setTool('move')}/><Tool active={tool === 'road'} icon={<PenLine size={16}/>} label="Draw aligned road" onClick={() => setTool('road')}/><Tool active={tool === 'slot'} icon={<Square size={16}/>} label="Draw space" onClick={() => setTool('slot')}/><span className="text-xs text-slate-500">{tool === 'move' ? 'Drag the selected road or space.' : tool === 'road' ? 'Sketch roughly; it is cleaned into a straight road.' : tool === 'slot' ? 'Drag any rectangle.' : 'Click an object to select it.'}</span><label className="ml-auto flex items-center gap-2 text-xs"><input type="checkbox" checked={snap} onChange={e => setSnap(e.target.checked)}/> Snap</label><input aria-label="Canvas zoom" type="range" min=".45" max="1" step=".05" value={zoom} onChange={e => setZoom(Number(e.target.value))}/></div>
      <div className="grid min-h-[calc(100vh-250px)] lg:grid-cols-[1fr_300px]"><div className="overflow-hidden bg-slate-100 p-3"><svg className="h-full w-full rounded-xl border bg-white shadow-inner" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox={`0 0 ${canvas.width} ${canvas.height}`} onPointerDown={start} onPointerMove={draw} onPointerUp={finish} onPointerLeave={finish}><defs><pattern id="yard-dots" width={canvas.gridSize} height={canvas.gridSize} patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#d6e1ee"/></pattern></defs><rect width={canvas.width} height={canvas.height} fill={snap ? 'url(#yard-dots)' : 'white'}/>{layout.roads.map(road => { const moving = gesture?.kind === 'move' && gesture.target.kind === 'road' && gesture.target.id === road.roadId; const display = moving ? { ...road, points: road.points.map(([x, y]) => [x + moveOffset.x, y + moveOffset.y]) } : road; return <Road key={road.roadId} road={display} selected={selectedRoad?.roadId === road.roadId} onPick={e => { e.stopPropagation(); if (tool === 'move' && selected?.kind === 'road' && selected.id === road.roadId) { start(e); return; } setSelected({ kind: 'road', id: road.roadId }); }}/>; })}{slots.map(slot => { const moving = gesture?.kind === 'move' && gesture.target.kind === 'slot' && gesture.target.id === slot._id; const display = moving ? { ...slot, layout: { ...slot.layout, x: slot.layout.x + moveOffset.x, y: slot.layout.y + moveOffset.y } } : slot; return <Slot key={slot._id} slot={display} selected={selectedSlot?._id === slot._id} onPick={e => { e.stopPropagation(); if (tool === 'move' && selected?.kind === 'slot' && selected.id === slot._id) { start(e); return; } setSelected({ kind: 'slot', id: slot._id }); }}/>; })}{gesture?.kind === 'road' && <path d={path(gesture.points)} fill="none" stroke="#334155" strokeWidth="70" strokeLinecap="round" strokeLinejoin="round" opacity=".5"/>}{gesture?.kind === 'slot' && <rect {...preview} fill="#38bdf822" stroke="#0284c7" strokeWidth="4" strokeDasharray="10 7"/>}</svg></div><Inspector slot={selectedSlot} road={selectedRoad} canConfigure={canConfigure} onDelete={remove}/></div>
    </section>}</>;
}
function Tool({ active, icon, label, onClick, disabled }) { return <button className={`btn-secondary px-3 py-2 text-xs ${active ? 'border-sky-500 bg-sky-50 text-sky-800 ring-1 ring-sky-500' : ''}`} disabled={disabled} onClick={onClick}>{icon}{label}</button>; }
function Road({ road, selected, onPick }) { return <g className="cursor-pointer" onPointerDown={onPick}><path d={path(road.points)} fill="none" stroke={selected ? '#0ea5e9' : road.color || '#334155'} strokeWidth={road.width + (selected ? 8 : 0)} strokeLinecap="round" strokeLinejoin="round"/><path d={path(road.points)} fill="none" stroke="white" strokeWidth="3" strokeDasharray="18 14" strokeLinecap="round"/></g>; }
function Slot({ slot, selected, onPick }) { const l = slot.layout; return <g className="cursor-pointer" transform={`rotate(${l.rotation || 0} ${l.x + l.width / 2} ${l.y + l.height / 2})`} onPointerDown={onPick}><rect x={l.x} y={l.y} width={l.width} height={l.height} rx="4" fill={`${statusColor[slot.status] || '#64748b'}22`} stroke={selected ? '#0284c7' : statusColor[slot.status] || '#64748b'} strokeWidth={selected ? 6 : 3}/><text x={l.x + l.width / 2} y={l.y + l.height / 2 + 5} textAnchor="middle" fontSize={Math.max(10, Math.min(18, l.width / 4))} fontWeight="700" pointerEvents="none">{slot.code}</text></g>; }
function Inspector({ slot, road, canConfigure, onDelete }) { if (!slot && !road) return <aside className="border-l bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Selection</p><h3 className="mt-2 font-bold text-navy">Nothing selected</h3><p className="mt-2 text-sm text-slate-500">Choose Select and click a road or space. Then choose Move selected to drag it.</p></aside>; return <aside className="border-l bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Selected {road ? 'road' : 'space'}</p><h3 className="mt-1 text-xl font-bold text-navy">{road?.label || slot.code}</h3><p className="mt-3 text-sm text-slate-500">{road ? 'This road can be moved or deleted independently.' : `Status: ${slot.status}. Spaces can be moved; only Available spaces can be deleted.`}</p>{canConfigure && <button className="btn-secondary mt-5 px-3 py-2 text-xs text-red-700" disabled={slot && slot.status !== 'Available'} onClick={onDelete}><Trash2 size={15}/> Delete selected</button>}</aside>; }
