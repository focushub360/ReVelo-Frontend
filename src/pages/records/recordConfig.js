
export const display = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object')
    return value.registration || value.name || value.vehicleCode || value.code || '—';
  if (/^\d{4}-\d{2}-\d{2}T/.test(String(value))) return new Date(value).toLocaleString();
  return String(value);
};

export const recordColumns = {
  enquiries: [
    ['enquiryCode', 'Enquiry'],
    ['type', 'Type'],
    ['person', 'Customer'],
    ['vehicle', 'Vehicle'],
    ['status', 'Status'],
    ['createdAt', 'Received'],
  ],
  vehicles: [
    ['vehicleCode', 'Vehicle ID'],
    ['registration', 'Registration'],
    ['make', 'Make'],
    ['model', 'Model'],
    ['lifecycle', 'Lifecycle'],
    ['currentLocation', 'Location'],
  ],
  inspections: [
    ['kind', 'Inspection'],
    ['vehicle', 'Vehicle'],
    ['assignedTo', 'Assigned to'],
    ['status', 'Status'],
    ['dueDate', 'Due date'],
  ],
  'parking/slots': [
    ['code', 'Slot'],
    ['zone', 'Zone'],
    ['row', 'Row'],
    ['type', 'Type'],
    ['status', 'Status'],
    ['activeVehicle', 'Vehicle'],
  ],
  'work-orders': [
    ['workOrderCode', 'Work order'],
    ['title', 'Repair'],
    ['vehicle', 'Vehicle'],
    ['assignedTo', 'Assigned to'],
    ['priority', 'Priority'],
    ['status', 'Status'],
  ],
  documents: [
    ['category', 'Document'],
    ['originalName', 'File'],
    ['vehicle', 'Vehicle'],
    ['status', 'Verification'],
    ['submittedAt', 'Submitted'],
  ],
  sales: [
    ['vehicle', 'Vehicle'],
    ['status', 'Status'],
    ['agreedPrice', 'Agreed price'],
    ['reservedUntil', 'Reserved until'],
  ],
  users: [
    ['name', 'Employee'],
    ['email', 'Email'],
    ['role', 'Primary role'],
    ['operationalProfile', 'Operational profile'],
    ['active', 'Account'],
  ],
};

export const quickAdd = {
  users: {
    label: 'Add employee',
    fields: [
      ['name', 'Full name'],
      ['email', 'Work email', 'email'],
      ['password', 'Login password', 'password'],
      ['operationalProfile', 'Employee type', 'employee-type'],
    ],
  },
  vehicles: {
    label: 'Add vehicle',
    fields: [
      ['registration', 'Registration'],
      ['make', 'Make'],
      ['model', 'Model'],
      ['variant', 'Variant'],
      ['year', 'Year', 'number'],
      ['vin', 'VIN'],
      ['chassis', 'Chassis number'],
      ['engine', 'Engine number'],
      ['fuelType', 'Fuel type'],
      ['transmission', 'Transmission'],
      ['odometer', 'Odometer (km)', 'number'],
    ],
  },
  'parking/slots': {
    label: 'Add parking space',
    fields: [
      ['code', 'Space code'],
      ['zone', 'Zone'],
      ['row', 'Row'],
      ['number', 'Space number', 'number'],
      ['type', 'Space type', 'select:parking|inspection|road-test|workshop|delivery'],
      ['status', 'Status', 'select:Available|Reserved|Occupied|Blocked|Maintenance'],
      ['vehicle', 'Vehicle registration', 'vehicle-select'],
    ],
  },
  'work-orders': {
    label: 'Add refurbishment',
    fields: [
      ['vehicle', 'Vehicle registration'],
      ['title', 'Repair title'],
      ['priority', 'Priority', 'select:Low|Medium|High|Critical'],
    ],
  },
  inspections: {
    label: 'Add inspection',
    fields: [
      ['vehicle', 'Vehicle ID'],
      ['assignedTo', 'Employee ID'],
      ['kind', 'Inspection type', 'select:mechanical|structural'],
      ['dueDate', 'Due date & time', 'datetime-local'],
    ],
  },
  enquiries: {
    label: 'Add seller enquiry',
    fields: [
      ['sellerName', 'Seller name'],
      ['registration', 'Vehicle registration'],
      ['make', 'Make'],
      ['model', 'Model'],
      ['askingPrice', 'Asking price', 'number'],
    ],
  },
  sales: {
    label: 'Add sale',
    fields: [
      ['vehicle', 'Vehicle ID'],
      ['targetPrice', 'Target price', 'number'],
    ],
  },
};

export const recordEditing = {
  users: {
    resource: 'users',
    fields: [
      ['name', 'Full name'],
      ['email', 'Email', 'email'],
      ['phone', 'Phone'],
      [
        'operationalProfile',
        'Operational profile',
        'select:Service Advisor|Senior Technician / Vehicle Inspector|Parking Manager|Refurbishment Technician',
      ],
      ['active', 'Active', 'checkbox'],
    ],
  },
  vehicles: {
    resource: 'vehicles',
    fields: [
      ['registration', 'Registration'],
      ['make', 'Make'],
      ['model', 'Model'],
      ['year', 'Year', 'number'],
      ['fuelType', 'Fuel type'],
      ['transmission', 'Transmission'],
      ['odometer', 'Odometer', 'number'],
      ['lifecycle', 'Lifecycle'],
    ],
  },
  enquiries: {
    resource: 'enquiries',
    fields: [
      ['status', 'Status'],
      ['askingPrice', 'Asking price', 'number'],
      ['source', 'Source'],
      ['followUp', 'Follow-up', 'datetime-local'],
      ['nextAction', 'Next action'],
      ['notes', 'Notes', 'textarea'],
    ],
  },
  inspections: {
    resource: 'inspections',
    fields: [
      ['dueDate', 'Due date & time', 'datetime-local'],
      ['assignedTo', 'Assigned employee ID'],
      ['status', 'Status', 'select:Assigned|In Progress|Submitted|Reviewed|Reinspection Required'],
    ],
  },
  'parking/slots': {
    resource: 'parking-slots',
    fields: [
      ['code', 'Space code'],
      ['zone', 'Zone'],
      ['row', 'Row'],
      ['number', 'Space number', 'number'],
      ['type', 'Type'],
      ['status', 'Status', 'select:Available|Reserved|Occupied|Blocked|Maintenance'],
      ['vehicle', 'Vehicle registration', 'vehicle-select'],
      ['enabled', 'Enabled', 'checkbox'],
    ],
  },
  'work-orders': {
    resource: 'work-orders',
    fields: [
      ['title', 'Title'],
      ['description', 'Description', 'textarea'],
      ['priority', 'Priority'],
      ['assignedTo', 'Assigned employee ID'],
      ['status', 'Status'],
      ['notes', 'Notes', 'textarea'],
    ],
  },
  sales: {
    resource: 'sales',
    fields: [
      ['targetPrice', 'Target price', 'number'],
      ['agreedPrice', 'Agreed price', 'number'],
      ['status', 'Status'],
      ['reservedUntil', 'Reserved until', 'datetime-local'],
    ],
  },
};
