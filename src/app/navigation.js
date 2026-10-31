import { Building2, CarFront, CircleDot, ClipboardCheck, FileText, LayoutDashboard, MapPin, ShieldCheck, Users, Wrench } from 'lucide-react';

export const ICONS = {
  Dashboard: LayoutDashboard,
  Dealers: Building2,
  Employees: Users,
  Vehicles: CarFront,
  Enquiries: FileText,
  Inspections: ClipboardCheck,
  Parking: MapPin,
  Workshop: Wrench,
  Activity: ShieldCheck,
  Profile: Users,
  Inventory: CarFront,
  Documents: FileText,
  Offers: FileText,
  Acquisitions: CircleDot,
};

export const navFor = (user) => {
  if (user.role === 'Super Admin')
    return [
      ['dashboard', 'Platform Dashboard'],
      ['dealers', 'Dealers'],
      ['public-lead-settings', 'Public Lead Form'],
      ['admins', 'Admin Management'],
      ['activity', 'Platform Activity'],
      ['profile', 'My Profile'],
    ];
  if (user.role === 'Dealer Admin')
    return [
      ['dashboard', 'Dealership Dashboard'],
      ['enquiries', 'Enquiries'],
      ['vehicles', 'Vehicles'],
      ['documents', 'Documents'],
      ['inspections', 'Inspections'],
      ['acquisitions', 'Acquisitions'],
      ['work-orders', 'Refurbishment'],
      ['parking', 'Parking & Yard'],
      ['offers', 'Offers'],
      ['employees', 'Employees'],
      ['activity', 'Activity Logs'],
      ['profile', 'My Profile'],
    ];
  if (user.operationalProfile === 'Parking Manager')
    return [
      ['dashboard', 'Parking Dashboard'],
      ['parking', 'Yard Map'],
      ['vehicles', 'Vehicle Locations'],
      ['activity', 'My Activity'],
      ['profile', 'My Profile'],
    ];
  if (user.operationalProfile === 'Refurbishment Technician')
    return [
      ['dashboard', 'Workshop Dashboard'],
      ['work-orders', 'My Work Orders'],
      ['activity', 'My Activity'],
      ['profile', 'My Profile'],
    ];
  if (user.role === 'Technician & Service Advisor')
    return [
      ['dashboard', 'My Dashboard'],
      ['inspections', 'Inspection Queue'],
      ['activity', 'My Activity'],
      ['profile', 'My Profile'],
    ];
  return [
    ['dashboard', 'My Dashboard'],
    ['enquiries', 'My Enquiries'],
    ['vehicles', 'Available Vehicles'],
    ['documents', 'My Documents'],
    ['offers', 'Offers'],
    ['activity', 'My Activity'],
    ['profile', 'My Profile'],
  ];
};
