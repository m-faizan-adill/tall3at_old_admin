import api from './api';
import { ENDPOINTS } from '../constants/config';

export const videoApi = {
  // Get video by trip ID
  getVideoByTripId: async (tripId) => {
    try {
      const response = await api.get(`${ENDPOINTS.VIDEOS_BY_TRIP}/${tripId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get video by ID
  getVideo: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.VIDEOS}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload video for a trip
  uploadVideo: async (tripId, videoFile) => {
    try {
      const formData = new FormData();
      formData.append('tripId', tripId);
      formData.append('videoFile', videoFile);

      const response = await api.post(ENDPOINTS.VIDEOS_UPLOAD, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update video
  updateVideo: async (id, videoFile) => {
    try {
      const formData = new FormData();
      formData.append('videoFile', videoFile);

      const response = await api.put(`${ENDPOINTS.VIDEOS}/${id}`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete video by ID
  deleteVideo: async (id) => {
    try {
      const response = await api.delete(`${ENDPOINTS.VIDEOS}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete video by trip ID
  deleteVideoByTripId: async (tripId) => {
    try {
      const response = await api.delete(`${ENDPOINTS.VIDEOS_BY_TRIP}/${tripId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 