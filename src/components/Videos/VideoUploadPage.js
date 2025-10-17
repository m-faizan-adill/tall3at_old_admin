import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faVideo, 
  faUpload,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import VideoUpload from '../Trips/VideoUpload';
import api from '../../services/api';
import './VideoUploadPage.css';

const VideoUploadPage = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tripId) {
      loadTrip();
    }
  }, [tripId]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/trips/${tripId}`);
      setTrip(response.data);
    } catch (error) {
      setError('حدث خطأ أثناء تحميل بيانات الطلعة');
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUploaded = (videoData) => {
    // Show success message and redirect
    alert('تم رفع الفيديو بنجاح!');
    navigate('/admin/videos');
  };

  const handleVideoDeleted = () => {
    // Show success message and redirect
    alert('تم حذف الفيديو بنجاح!');
    navigate('/admin/videos');
  };

  const handleBack = () => {
    navigate('/admin/videos');
  };

  if (loading) {
    return (
      <div className="video-upload-page">
        <div className="upload-loading">
          <div className="loading-spinner"></div>
          <p>جاري تحميل بيانات الطلعة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-upload-page">
        <div className="upload-error">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <h3>حدث خطأ</h3>
          <p>{error}</p>
          <button onClick={handleBack} className="btn btn-primary">
            <FontAwesomeIcon icon={faArrowLeft} />
            العودة إلى الفيديوهات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-upload-page">
      {/* Header */}
      <div className="upload-header">
        <div className="header-content">
          <button onClick={handleBack} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} />
            العودة
          </button>
          <div className="header-title">
            <FontAwesomeIcon icon={faVideo} className="header-icon" />
            <h1>رفع فيديو للطلعة</h1>
          </div>
        </div>
      </div>

      {/* Trip Info */}
      {trip && (
        <div className="trip-info-card">
          <div className="trip-header">
            <h2>{trip.title || trip.titleEn || 'Untitled Trip'}</h2>
            <span className="trip-id">#{trip.id}</span>
          </div>
          <div className="trip-details">
            <div className="trip-meta">
              <div className="meta-item">
                <strong>المزود:</strong> {trip.providerName || 'غير محدد'}
              </div>
              <div className="meta-item">
                <strong>السعر:</strong> {trip.price} ريال
              </div>
              <div className="meta-item">
                <strong>الموقع:</strong> {trip.location || 'غير محدد'}
              </div>
            </div>
            {trip.description && (
              <div className="trip-description">
                <strong>الوصف:</strong>
                <p>{trip.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="upload-section">
        <div className="upload-info">
          <FontAwesomeIcon icon={faUpload} className="upload-icon" />
          <h3>رفع فيديو للطلعة</h3>
          <p>يمكنك رفع فيديو يوضح تفاصيل الطلعة وجمالياتها</p>
        </div>

        <div className="upload-requirements">
          <h4>متطلبات الفيديو:</h4>
          <ul>
            <li>
              <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
              صيغ مدعومة: MP4, AVI, MOV, WMV, FLV, WEBM
            </li>
            <li>
              <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
              الحد الأقصى لحجم الملف: 100 ميجابايت
            </li>
            <li>
              <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
              يفضل استخدام صيغة MP4 للحصول على أفضل جودة
            </li>
            <li>
              <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
              يمكنك معاينة الفيديو قبل الرفع
            </li>
          </ul>
        </div>

        <VideoUpload 
          tripId={parseInt(tripId)}
          onVideoUploaded={handleVideoUploaded}
          onVideoDeleted={handleVideoDeleted}
        />
      </div>

      {/* Tips Section */}
      <div className="tips-section">
        <h4>نصائح لرفع فيديو جيد:</h4>
        <div className="tips-grid">
          <div className="tip-card">
            <h5>📹 جودة الفيديو</h5>
            <p>استخدم دقة عالية (1080p أو أعلى) لعرض أفضل للطلعة</p>
          </div>
          <div className="tip-card">
            <h5>⏱️ مدة الفيديو</h5>
            <p>يفضل أن تكون مدة الفيديو بين 30 ثانية إلى 3 دقائق</p>
          </div>
          <div className="tip-card">
            <h5>🎬 المحتوى</h5>
            <p>ركز على عرض الأماكن والأنشطة المميزة في الطلعة</p>
          </div>
          <div className="tip-card">
            <h5>🔊 الصوت</h5>
            <p>تأكد من جودة الصوت أو استخدم موسيقى خلفية مناسبة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadPage; 