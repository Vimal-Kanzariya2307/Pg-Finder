export const formatPrice = (price) => {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'badge-yellow',
    approved: 'badge-green',
    rejected: 'badge-red',
    inactive: 'badge-blue',
    responded: 'badge-green',
    closed: 'badge-blue',
  };
  return colors[status] || 'badge-blue';
};

export const amenityIcons = {
  'WiFi': '📶',
  'AC': '❄️',
  'Meals': '🍽️',
  'Laundry': '🧺',
  'Parking': '🚗',
  'CCTV': '📹',
  'Gym': '💪',
  'TV': '📺',
  'Geyser': '🚿',
  'Power Backup': '🔋',
  'Water Purifier': '💧',
  'Housekeeping': '🧹',
};

export const AMENITIES_LIST = Object.keys(amenityIcons);

export const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];

export const PG_PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
];

export const getPGImage = (pg, index = 0) => {
  if (pg?.photos?.length > 0) return pg.photos[index]?.url;
  return PG_PLACEHOLDER_IMAGES[index % PG_PLACEHOLDER_IMAGES.length];
};

export const getMinRent = (pg) => {
  const rents = [pg?.rent?.single, pg?.rent?.double, pg?.rent?.triple].filter(Boolean);
  return rents.length > 0 ? Math.min(...rents) : null;
};
