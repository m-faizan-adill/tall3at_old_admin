import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSearch, 
  faFilter, 
  faVideo, 
  faPlay, 
  faEdit, 
  faTrash,
  faEye,
  faCalendarAlt,
  faUser,
  faRoute,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { videoApi } from '../../services/videoApi';
import api from '../../services/api';
import './VideosDashboard.css';

const VideosDashboard = () => {
  const [videos, setVideos] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrip, setSelectedTrip] = useState('');
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchTerm, selectedTrip]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load trips first
      const tripsResponse = await api.get('/api/admin/trips?pageSize=1000');
      setTrips(tripsResponse.data.data || []);

      // Load videos for each trip
      const videosData = [];
      for (const trip of tripsResponse.data) {
        try {
          const videoResponse = await videoApi.getVideoByTripId(trip.id);
          if (videoResponse) {
            videosData.push({
              ...videoResponse,
              trip: trip
            });
          }
        } catch (error) {
          // Trip has no video, skip
        }
      }
      
      setVideos(videosData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.trip?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.trip?.titleEn?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by trip
    if (selectedTrip) {
      filtered = filtered.filter(video => video.tripId === parseInt(selectedTrip));
    }

    setFilteredVideos(filtered);
  };

  const handleDeleteVideo = async (videoId, tripId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      return;
    }

    try {
      await videoApi.deleteVideoByTripId(tripId);
      setVideos(videos.filter(video => video.id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('حدث خطأ أثناء حذف الفيديو');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVideoDuration = (videoUrl) => {
    // This would need to be implemented with actual video metadata
    // For now, return a placeholder
    return '00:00';
  };

  if (loading) {
    return (
      <div className="videos-dashboard">
        <div className="videos-loading">
          <div className="loading-spinner"></div>
          <p>جاري تحميل الفيديوهات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="videos-dashboard">
      {/* Header */}
      <div className="videos-header">
        <div className="header-content">
          <div className="header-title">
            <FontAwesomeIcon icon={faVideo} className="header-icon" />
            <h1>إدارة فيديوهات الطلعات</h1>
          </div>
          <p className="header-subtitle">
            عرض وإدارة الفيديوهات المرتبطة بالطلعات
          </p>
        </div>
        <div className="header-actions">
          <Link 
            to="/admin/videos/add" 
            className="btn btn-primary"
          >
            <FontAwesomeIcon icon={faPlus} />
            إضافة فيديو جديد
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="videos-filters">
        <div className="filters-row">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="البحث في الطلعات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <FontAwesomeIcon icon={faFilter} className="filter-icon" />
            <select
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
              className="filter-select"
            >
              <option value="">جميع الطلعات</option>
              {trips.map(trip => (
                <option key={trip.id} value={trip.id}>
                  {trip.title || trip.titleEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="videos-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faVideo} />
          </div>
          <div className="stat-content">
            <h3>{videos.length}</h3>
            <p>إجمالي الفيديوهات</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faRoute} />
          </div>
          <div className="stat-content">
            <h3>{trips.length}</h3>
            <p>إجمالي الطلعات</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faPlay} />
          </div>
          <div className="stat-content">
            <h3>{trips.length - videos.length}</h3>
            <p>طلعات بدون فيديو</p>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="videos-content">
        {filteredVideos.length === 0 ? (
          <div className="no-videos">
            <div className="no-videos-icon">
              <FontAwesomeIcon icon={faVideo} />
            </div>
            <h3>لا توجد فيديوهات</h3>
            <p>
              {searchTerm || selectedTrip 
                ? 'لا توجد فيديوهات تطابق معايير البحث'
                : 'لم يتم رفع أي فيديوهات بعد'
              }
            </p>
            {!searchTerm && !selectedTrip && (
              <Link to="/admin/videos/upload" className="btn btn-primary">
                <FontAwesomeIcon icon={faPlus} />
                إضافة أول فيديو
              </Link>
            )}
          </div>
        ) : (
          <div className="videos-grid">
            {filteredVideos.map(video => (
              <div key={video.id} className="video-card">
                <div className="video-thumbnail">
                  <video 
                    src={video.videoUrl} 
                    className="video-preview"
                    muted
                    onLoadedMetadata={(e) => {
                      // Set video duration when metadata loads
                      e.target.currentTime = 1; // Seek to 1 second for thumbnail
                    }}
                  />
                  <div className="video-overlay">
                    <button className="play-btn">
                      <FontAwesomeIcon icon={faPlay} />
                    </button>
                  </div>
                  <div className="video-duration">
                    {getVideoDuration(video.videoUrl)}
                  </div>
                </div>
                
                <div className="video-info">
                  <div className="video-title">
                    <h3>{video.trip?.title || video.trip?.titleEn || 'Untitled Trip'}</h3>
                    <span className="video-id">#{video.id}</span>
                  </div>
                  
                  <div className="video-meta">
                    <div className="meta-item">
                      <FontAwesomeIcon icon={faUser} />
                      <span>{video.trip?.providerName || 'Unknown Provider'}</span>
                    </div>
                    <div className="meta-item">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{new Date(video.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                  
                  <div className="video-actions">
                    <Link 
                      to={`/admin/trips/${video.tripId}`} 
                      className="btn btn-secondary btn-sm"
                      title="عرض الطلعة"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Link>
                    <Link 
                      to={`/admin/videos/edit/${video.id}`} 
                      className="btn btn-primary btn-sm"
                      title="تعديل الفيديو"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                    <button 
                      onClick={() => handleDeleteVideo(video.id, video.tripId)}
                      className="btn btn-danger btn-sm"
                      title="حذف الفيديو"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>اختر الطلعة لرفع الفيديو</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="trip-selection">
                {trips.filter(trip => !videos.find(v => v.tripId === trip.id)).map(trip => (
                  <Link 
                    key={trip.id}
                    to={`/admin/videos/upload/${trip.id}`}
                    className="trip-option"
                    onClick={() => setShowUploadModal(false)}
                  >
                    <div className="trip-option-info">
                      <h4>{trip.title || trip.titleEn || 'Untitled Trip'}</h4>
                      <p>{trip.providerName || 'Unknown Provider'}</p>
                      <span className="trip-price">{trip.price} ريال</span>
                    </div>
                    <div className="trip-option-action">
                      <FontAwesomeIcon icon={faUpload} />
                    </div>
                  </Link>
                ))}
                {trips.filter(trip => !videos.find(v => v.tripId === trip.id)).length === 0 && (
                  <div className="no-trips-message">
                    <p>جميع الطلعات لديها فيديوهات بالفعل</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosDashboard; 