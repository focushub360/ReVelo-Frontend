import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, CalendarDays, FileText, LogOut, MessageSquare, UserRound } from 'lucide-react';
import { api, setCsrf } from '../lib/api.js';
import { PublicFooter, PublicHeader } from './PublicExperience.jsx';

const sections = [
  ['dashboard', 'Overview', null], ['enquiries', 'My Enquiries', MessageSquare], ['documents', 'Document Status', FileText], ['appointments', 'Inspection Schedule', CalendarDays], ['negotiations', 'Offer Details', MessageSquare], ['transactions', 'Transactions', FileText], ['profile', 'Profile', UserRound], ['notifications', 'Notifications', Bell],
];
const endpointFor = { enquiries:'/portal/enquiries', documents:'/portal/documents', negotiations:'/portal/negotiations', appointments:'/portal/appointments', transactions:'/portal/transactions', notifications:'/notifications' };

export function AccountPortal() {
  const { section='dashboard' } = useParams(); const go = useNavigate();
  const me=useQuery({queryKey:['portal-me'],queryFn:()=>api.get('/auth/me').then(r=>r.data.user),retry:false});
  const records=useQuery({queryKey:['portal',section],queryFn:()=>api.get(endpointFor[section]).then(r=>r.data),enabled:Boolean(me.data&&endpointFor[section]),retry:false});
  if(me.isLoading)return <p className="rv-status">Loading your account…</p>; if(me.isError)return <Navigate to="/account/login"/>;
  if(me.data.role!=='Buyer & Seller')return <Navigate to={me.data.role==='Super Admin'?'/platform/dashboard':'/dealer/dashboard'}/>;
  const logout=async()=>{await api.post('/auth/logout');setCsrf('');go('/account/login');}; const rows=Array.isArray(records.data)?records.data:records.data?.items||[];
  return <div className="rv-page account-page"><PublicHeader/><main className="rv-container account-shell"><aside className="account-side"><div><p className="rv-eyebrow">My ReVelo</p><h1>{me.data.name}</h1><p>{me.data.email}</p></div><nav>{sections.map(([key,label,Icon])=><Link className={section===key?'is-active':''} key={key} to={`/account/${key}`}>{Icon&&<Icon size={16}/>} {label}</Link>)}</nav><button onClick={logout}><LogOut size={16}/> Sign out</button></aside><section className="account-content"><p className="rv-eyebrow">Account centre</p><h2>{sections.find(([key])=>key===section)?.[1]||'Overview'}</h2>{section==='dashboard'?<><p className="account-lead">Keep track of your authorised buying and selling activity in one place.</p><div className="account-journey"><article><b>1</b><div><h3>Submit an enquiry</h3><p>Share the details needed to start a vehicle conversation.</p></div></article><article><b>2</b><div><h3>Stay updated</h3><p>Review authorised documents, appointments and offers as they become available.</p></div></article><article><b>3</b><div><h3>Move forward</h3><p>Use your dealership contact to continue your vehicle journey.</p></div></article></div><div className="account-actions"><Link to="/cars">Explore available cars</Link><Link to="/sell-your-car">Sell your car</Link></div></>:records.isLoading?<div className="card mt-6 p-6 text-sm text-slate-500">Loading your authorised records…</div>:records.isError?<div className="card mt-6 p-6 text-sm text-red-600">We could not load this section. Please try again.</div>:<div className="account-records">{rows.length?rows.map((item,index)=><article key={item._id||item.id||index}><div><b>{item.enquiryCode||item.category||item.title||item.vehicle?.make||'ReVelo activity'}</b><p>{item.vehicle?.model||item.body||item.message||'Authorised account record'}</p></div><span>{item.status||item.read?'Updated':'In progress'}</span></article>):<div className="account-empty"><FileText/><h3>Nothing to show yet</h3><p>New authorised activity will appear here when it is available.</p></div>}</div>}</section></main><PublicFooter/></div>;
}
