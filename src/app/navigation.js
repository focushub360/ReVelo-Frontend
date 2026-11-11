import { Building2, CarFront, CircleDot, ClipboardCheck, FileText, LayoutDashboard, MapPin, ShieldCheck, Users, Wrench } from 'lucide-react';

export const ICONS = {
  Dashboard: LayoutDashboard,
  Dealers: Building2,
  Dealer: Building2,
  System: ShieldCheck,
  Vehicle: CarFront,
  Document: FileText,
  Team: Users,
  Yard: MapPin,
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
      ['dealers', 'Dealer Management'],
      ['public-lead-settings', 'Public Lead Form'],
      ['admins', 'Dealer Admin Accounts'],
      ['activity', 'System Analytics'],
      ['profile', 'My Profile'],
    ];
  if (user.role === 'Dealer Admin')
    return [
      ['dashboard', 'Dealership Dashboard'],
      ['dealer-oversight', 'Vehicle Lifecycle'],
      ['enquiries', 'Enquiries'],
      ['vehicles', 'Vehicle Master'],
      ['documents', 'Document Verification'],
      ['acquisitions', 'Acquisitions'],
      ['work-orders', 'Refurbishment'],
      ['parking', 'Parking & Yard'],
      ['offers', 'Offers'],
      ['employees', 'Team Management'],
      ['activity', 'Activity Logs'],
      ['profile', 'My Profile'],
    ];
  if (user.operationalProfile === 'Service Advisor')
    return [
      ['dashboard', 'My Dashboard'],
      ['enquiries', 'Seller Enquiries'],
      ['documents', 'Document Verification'],
      ['inspections', 'Physical Intake'],
      ['activity', 'My Activity'],
      ['profile', 'My Profile'],
    ];
  if (user.operationalProfile === 'Dealership Manager')
    return [
      ['dashboard', 'Manager Dashboard'],
      ['seller-discussions', 'Seller Discussions'],
      ['acquisitions', 'Purchase Decisions'],
      ['vehicles', 'Inventory'],
      ['work-orders', 'Refurbishment Progress'],
      ['completed-handovers', 'Completed Handovers'],
      ['pricing-listing', 'Pricing & Listing'],
      ['activity', 'Activity Logs'],
      ['profile', 'My Profile'],
    ];
  if (user.operationalProfile === 'Senior Technician / Vehicle Inspector')
    return [
      ['dashboard', 'My Dashboard'],
      ['inspections', 'Inspection Queue'],
      ['work-orders', 'Refurbishment Work'],
      ['activity', 'My Activity'],
      ['profile', 'My Profile'],
    ];
  if (user.operationalProfile === 'Parking Manager')
    return [
      ['dashboard', 'Parking Dashboard'],
      ['parking', 'Yard Layout & Slots'],
      ['vehicles', 'Vehicle Movement'],
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
