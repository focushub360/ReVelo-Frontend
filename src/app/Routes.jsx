import { Route, Routes } from 'react-router-dom';
import PublicSellerForm from '../components/PublicSellerForm.jsx';
import AcceptInvitation from '../components/AcceptInvitation.jsx';
import PublicSellerLanding from '../components/PublicSellerLanding.jsx';
import { Login } from '../pages/Login.jsx';
import { AdminGate } from '../pages/admin/AdminGate.jsx';
import { Shell } from './Shell.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/sell-your-car" element={<PublicSellerLanding />} />
      <Route path="/sell-your-car/start" element={<PublicSellerForm />} />
      <Route path="/accept-invitation" element={<AcceptInvitation />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admins" element={<AdminGate />} />
      <Route path="/*" element={<Shell />} />
    </Routes>
  );
}
