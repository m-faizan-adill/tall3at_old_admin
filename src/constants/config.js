// API Endpoints
export const ENDPOINTS = {
  ADMIN_LOGIN: '/admin-login',
  USER_LOGIN: '/users/user-login',
  ADMIN_REGISTER: '/users/admin-signup',
  USER_REGISTER: '/users/signup',
  USER_PROFILE: '/users/get-user',
  UPDATE_USER: '/users/update-user',
  CHECK_USERNAME: '/users/check-username',
  // Video endpoints
  VIDEOS: '/videos',
  VIDEOS_BY_TRIP: '/videos/trip',
  VIDEOS_UPLOAD: '/videos/upload',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  TOKEN_EXPIRATION: 'tokenExpiration',
  USER_ROLE: 'userRole',
};

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  STORE: 'store',
  CUSTOMER: 'customer',
  DRIVER: 'driver',
};

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

// API Configuration
export const API_CONFIG = {
  // BASE_URL: 'http://localhost:5030/',
  BASE_URL: 'https://devwebapi.tall3at.com/',
  TIMEOUT: 10000,
};

// Theme Configuration
export const THEME = {
  PRIMARY_COLOR: '#31beb5',
  SECONDARY_COLOR: '#29304a',
  SUCCESS_COLOR: '#2ecc71',
  ERROR_COLOR: '#e74c3c',
  WARNING_COLOR: '#f1c40f',
  INFO_COLOR: '#3498db',
}; 