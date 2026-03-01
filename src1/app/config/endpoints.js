// 🌍 Base API Config
export const BASE_URI = 'https://devwebapi.tall3at.com';
export const TIME_OUT = 10000;

// 🧩 API Endpoints
export const ENDPOINTS = {
  // 🔐 Authentication
  ADMIN_LOGIN: '/admin-login',
  USER_LOGIN: '/users/user-login',
  ADMIN_REGISTER: '/users/admin-signup',
  USER_REGISTER: '/users/signup',

  // 👤 Users
  USER_PROFILE: '/users/get-user',
  UPDATE_USER: '/users/update-user',
  CHECK_USERNAME: '/users/check-username',

  // 🎥 Videos
  VIDEOS: '/videos',
  VIDEOS_BY_TRIP: '/videos/trip',
  VIDEOS_UPLOAD: '/videos/upload',

  // 🔔 Notifications
  NOTIFICATIONS: '/api/admin',

  // 🏠 Home
  HOME: '/api/home/home',

  // 🧾 Bookings
  ADMIN_BOOKINGS: '/api/admin/bookings', // Get all or filter bookings
  ADMIN_BOOKING_BY_ID: (bookingId) => `/api/admin/bookings/${bookingId}`, // Single booking by ID
  ADMIN_BOOKING_TRANSACTIONS: '/api/admin/bookings/transactions', // Booking transactions

  // 🗂️ Categories
  ADMIN_CATEGORIES: '/api/admin/categories',
  ADMIN_CATEGORY_BY_ID: (categoryId) => `/api/admin/categories/${categoryId}`,

  // 🚘 Trips
  ADMIN_TRIPS: '/api/admin/trips',

  // 🖼️ Banners
  BANNERS: '/api/banners',
  BANNERS_LIST: '/api/banners/list',
  BANNER_BY_ID: (id) => `/api/banners/${id}`,
  ACTIVE_BANNERS: '/api/banners/active',
  BANNER_UPLOAD_IMAGE: '/api/banners/upload-image',
  BANNER_TRIPS: (id) => `/api/banners/${id}/trips`,

  // 💬 Chat (Admin)
  CHAT_BASE: '/api/admin/chat',
  CHAT_CONVERSATIONS: '/api/admin/chat/conversations',
  CHAT_MESSAGES: '/api/admin/chat/messages',
  CHAT_STATISTICS: '/api/admin/chat/statistics',
  CHAT_SEARCH: '/api/admin/chat/search',

  // 👥 Admin Users Management
  ADMIN_USERS: '/api/admin/users', // GET/POST
  ADMIN_USER_BY_ID: (id) => `/api/admin/users/${encodeURIComponent(id)}`,
  ADMIN_USER_UPDATE: (id) => `/api/admin/users/${id}`,
  ADMIN_USER_STATUS: (id) => `/api/admin/users/${id}/status`,
  ADMIN_USER_DELETE: (id) => `/api/admin/users/${id}`,

  // 🌍 Cities
  CITIES: '/api/cities', // GET list of all cities

  // 🗑️ Deleted Packages
  ADMIN_DELETED_PACKAGES: '/api/admin/deletedpackages', // GET list of deleted packages

  // 🧑‍🔧 Providers
  ADMIN_PROVIDERS: '/api/admin/providers', // GET all, POST new
  ADMIN_PROVIDER_BY_ID: (id) => `/api/admin/providers/${id}`, // GET single provider
  ADMIN_PROVIDER_STATUS: (id) => `/api/admin/providers/${id}/status`, // PUT status update
  ADMIN_PROVIDER_DELETE: (id) => `/api/admin/providers/${id}`, // DELETE provider

  // ⚙️ Settings
  ADMIN_SETTINGS_BASE: '/api/admin/settings',
  ADMIN_SETTINGS_FEATURED: '/api/admin/settings/featured', // GET featured settings by city
  ADMIN_SETTINGS_FEATURED_REORDER: '/api/admin/settings/featured/reorder', // PUT reorder featured
  ADMIN_SETTINGS_REORDERED: '/api/admin/settings/reordered', // GET reordered settings
  ADMIN_SETTINGS_REORDER: '/api/admin/settings/reorder', // PUT reorder settings

  // ⚙️ App Config
  APP_CONFIG: '/api/AppConfig', // GET app configuration
  APP_CONFIG_UPDATE_REVIEW: '/api/AppConfig/update-review', // PUT update app review status
};
