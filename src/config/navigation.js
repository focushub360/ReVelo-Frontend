export const navFor = (user) => {
  if (user.role === 'Super Admin') return [['dashboard', 'Platform Dashboard'], ['dealers', 'Dealers'], ['admins', 'Admin Management'], ['activity', 'Platform Activity'], ['profile', 'My Profile']];
  if (user.role === 'Dealer Admin') return [['dashboard', 'Dealership Dashboard'], ['enquiries', 'Enquiries'], ['vehicles', 'Vehicles'], ['inspections', 'Inspections'], ['parking', 'Parking & Yard'], ['work-orders', 'Refurbishment'], ['employees', 'Employees'], ['activity', 'Activity Logs'], ['profile', 'My Profile']];
  if (user.operationalProfile === 'Parking Manager') return [['dashboard', 'Parking Dashboard'], ['parking', 'Yard Map'], ['vehicles', 'Vehicle Locations'], ['activity', 'My Activity'], ['profile', 'My Profile']];
  if (user.operationalProfile === 'Refurbishment Technician') return [['dashboard', 'Workshop Dashboard'], ['work-orders', 'My Work Orders'], ['activity', 'My Activity'], ['profile', 'My Profile']];
  if (user.role === 'Technician & Service Advisor') return [['dashboard', 'My Dashboard'], ['inspections', 'Inspection Queue'], ['activity', 'My Activity'], ['profile', 'My Profile']];
  return [['dashboard', 'My Dashboard'], ['enquiries', 'My Enquiries'], ['vehicles', 'Available Vehicles'], ['documents', 'My Documents'], ['offers', 'Offers'], ['activity', 'My Activity'], ['profile', 'My Profile']];
};
