import { Route, Routes } from 'react-router-dom';
import PublicSellerForm from '../components/PublicSellerForm.jsx';
import AcceptInvitation from '../components/AcceptInvitation.jsx';
import PublicSellerLanding from '../components/PublicSellerLanding.jsx';
import PublicDocumentVerification from '../components/PublicDocumentVerification.jsx';
import { Login } from '../pages/Login.jsx';
import { AdminGate } from '../pages/admin/AdminGate.jsx';
import { Shell } from './Shell.jsx';
import { Cars, CarDetail, DealerApplication, Landing, PortalHome, SellYourCar } from '../pages/PublicExperience.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/cars" element={<Cars />} />
      <Route path="/cars/:listingId" element={<CarDetail />} />
      <Route path="/sell-your-car" element={<SellYourCar />} />
      <Route path="/sell-your-car/start" element={<SellYourCar />} />
      <Route path="/accept-invitation" element={<AcceptInvitation />} />
      <Route path="/verify-documents" element={<PublicDocumentVerification />} />
      <Route path="/become-a-dealer" element={<DealerApplication />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dealer/login" element={<Login />} />
      <Route path="/account/login" element={<Login />} />
      <Route path="/account/:section?" element={<PortalHome />} />
      <Route path="/admins" element={<AdminGate />} />
      <Route path="/*" element={<Shell />} />
    </Routes>
  );
}
