import { Route, Routes } from 'react-router-dom';
import { Login } from '../pages/Login.jsx';
import { Shell } from './Shell.jsx';
import { Landing, Cars, CarDetail, DealerApplication, PortalHome, SellYourCar } from '../pages/PublicExperience.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/cars" element={<Cars />} />
      <Route path="/cars/:listingId" element={<CarDetail />} />
      <Route path="/sell-your-car" element={<SellYourCar />} />
      <Route path="/sell-your-car/start" element={<SellYourCar />} />
      <Route path="/become-a-dealer" element={<DealerApplication />} />
      <Route path="/login" element={<Login />} />
      <Route path="/account/login" element={<Login portal="account" />} />
      <Route path="/account/register" element={<Login portal="account" register />} />
      <Route path="/account/:section?" element={<PortalHome />} />
      <Route path="/dealer/login" element={<Login portal="dealer" />} />
      <Route path="/dealer/*" element={<Shell />} />
      <Route path="/platform/login" element={<Login portal="platform" />} />
      <Route path="/platform/*" element={<Shell />} />
      <Route path="/admins" element={<Shell />} />
      <Route path="/*" element={<Shell />} />
    </Routes>
  );
}
