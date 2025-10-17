import api from './api';

// Banner API service
export const bannersApi = {
  // Get all banners
  getBanners: () => api.get('/api/banners'),

  // Get banners list with pagination, search, and sorting
  getBannersList: (params = {}) => {
    const { pageNumber = 1, pageSize = 10, searchTerm, sortBy = 'CreatedAt', sortOrder = 'desc' } = params;
    return api.get('/api/banners/list', {
      params: { pageNumber, pageSize, searchTerm, sortBy, sortOrder }
    });
  },

  // Get banner by ID
  getBanner: (id) => api.get(`/api/banners/${id}`),

  // Create new banner
  createBanner: (formData) => api.post('/api/banners', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Update banner
  updateBanner: (id, formData) => api.put(`/api/banners/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Delete banner
  deleteBanner: (id) => api.delete(`/api/banners/${id}`),

  // Get active banners
  getActiveBanners: () => api.get('/api/banners/active'),

  // Upload banner image
  uploadBannerImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/api/banners/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get banner trips
  getBannerTrips: (id, params = {}) => {
    const { pageNumber = 1, pageSize = 10, sortBy = 'CreatedAt', sortOrder = 'desc' } = params;
    return api.get(`/api/banners/${id}/trips`, {
      params: { pageNumber, pageSize, sortBy, sortOrder }
    });
  },
};

export default bannersApi; 