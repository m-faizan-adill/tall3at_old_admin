import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faEdit, 
  faTrash, 
  faCalendarAlt,
  faMapMarkerAlt,
  faTag,
  faUser,
  faMoneyBillWave,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faBan,
  faStar,
  faUsers,
  faClock as faTime,
  faImage,
  faPhone,
  faEnvelope,
  faBuilding,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faEye,
  faSearchPlus,
  faSearchMinus,
  faUndo,
  faBox,
  faGift,
  faShieldAlt,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import VideoManager from './VideoManager';
import './TripDetails.css';

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-trip.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const TripDetails = ({ tripId, onBack, onEdit }) => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/trips/${tripId}`);
      console.log('Trip details response:', response.data.packages);
      console.log('Provider image fields:', {
        providerProfileImage: response.data.providerProfileImage,
        providerImage: response.data.providerImage,
        provider: response.data.provider
      });
      setTrip(response.data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل تفاصيل الرحلة');
      console.error('Error fetching trip details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { 
        class: 'status-active', 
        text: 'نشط',
        icon: faCheckCircle
      },
      'Pending': { 
        class: 'status-pending', 
        text: 'في الانتظار',
        icon: faClock
      },
      'Inactive': { 
        class: 'status-inactive', 
        text: 'غير نشط',
        icon: faTimesCircle
      },
      'Deleted': { 
        class: 'status-deleted', 
        text: 'محذوف',
        icon: faBan
      }
    };
    
    const config = statusConfig[status] || { 
      class: 'status-default', 
      text: status,
      icon: faBan
    };
    
    return (
      <span className={`status-badge ${config.class}`}>
        <FontAwesomeIcon icon={config.icon} />
        {config.text}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i}
          icon={faStar} 
          className={i <= rating ? 'star-filled' : 'star-empty'}
        />
      );
    }
    return stars;
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const handleNextImage = () => {
    const images = trip.images ? trip.images.split(',').filter(img => img.trim()) : [];
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    const images = trip.images ? trip.images.split(',').filter(img => img.trim()) : [];
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleImageDrag = (e) => {
    if (zoomLevel > 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setImagePosition({ x: x * 50, y: y * 50 });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCloseModal();
    } else if (e.key === 'ArrowRight') {
      handleNextImage();
    } else if (e.key === 'ArrowLeft') {
      handlePrevImage();
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      handleZoomIn();
    } else if (e.key === '-') {
      e.preventDefault();
      handleZoomOut();
    } else if (e.key === '0') {
      e.preventDefault();
      handleResetZoom();
    }
  };

  const handleDuplicateTrip = async (tripId) => {
    try {
      // Show confirmation dialog
      if (window.confirm('هل تريد نسخ هذه الرحلة؟')) {
        console.log('Duplicating trip:', tripId);
       
        alert('تم نسخ الرحلة بنجاح');
      }
    } catch (error) {
      console.error('Error duplicating trip:', error);
      alert('حدث خطأ أثناء نسخ الرحلة');
    }
  };

  const handleViewTrip = (tripId) => {
    console.log('Viewing trip:', tripId);

  };

  const handleDeleteTrip = async (tripId) => {
    try {
      // Show confirmation dialog
      if (window.confirm('هل أنت متأكد من حذف هذه الرحلة؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        // Here you would implement the delete logic
        console.log('Deleting trip:', tripId);
        alert('تم حذف الرحلة بنجاح');
        onBack(); // Go back to the list
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('حدث خطأ أثناء حذف الرحلة');
    }
  };

  useEffect(() => {
    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal]);

  if (loading) {
    return (
      <div className="trip-details-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">جاري تحميل تفاصيل الرحلة...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trip-details">
        <div className="trip-details-header">
          <button className="btn-back" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowRight} />
            العودة للقائمة
          </button>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="trip-details">
        <div className="trip-details-header">
          <button className="btn-back" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowRight} />
            العودة للقائمة
          </button>
        </div>
        <div className="no-data">
          <p>لم يتم العثور على الرحلة</p>
        </div>
      </div>
    );
  }

  const images = trip.images ? trip.images.split(',').filter(img => img.trim()) : [];

  return (
    <div className="trip-details">
      <div className="trip-details-header">
        <button className="btn-back" onClick={onBack}>
          <FontAwesomeIcon icon={faArrowRight} />
          العودة للقائمة
        </button>
        <div className="trip-details-actions">
          <button 
            className="btn-action btn-edit" 
            onClick={() => onEdit(trip.id)}
            title="تعديل الرحلة"
          >
            <FontAwesomeIcon icon={faEdit} />
            <span>تعديل الرحلة</span>
          </button>
        </div>
      </div>

      <div className="trip-details-content">
        {/* Trip Header */}
        <div className="trip-details-header-section">
          <div className="trip-details-main-info">
            <div className="trip-details-title">
              <h1>{trip.title}</h1>
              <p>{trip.titleEn}</p>
            </div>
            <div className="trip-details-meta">
              <div className="trip-details-location">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{trip.cityName}</span>
              </div>
              <div className="trip-details-category">
                <FontAwesomeIcon icon={faTag} />
                <span>{trip.categoryName}</span>
              </div>
              <div className="trip-details-status">
                {getStatusBadge(trip.status)}
              </div>
            </div>
          </div>
          <div className="trip-details-price">
            <div className="price-main">
              {trip.packages && trip.packages.length > 0 ? (
                <span className="price-amount">
                  يبدأ من {Math.min(...trip.packages.map(pkg => pkg.cost))} ريال
                </span>
              ) : (
                <span className="price-amount">{trip.price} ريال</span>
              )}
            </div>
          </div>
        </div>


        
        {/* Trip Images Gallery */}
        {images.length > 0 && (
          <div className="trip-details-images">
            <h3>
              <FontAwesomeIcon icon={faImage} />
              صور الرحلة ({images.length})
            </h3>
            
            {/* Vertical Gallery */}
            <div className="trip-vertical-gallery">
              {/* Vertical Thumbnails List */}
              <div className="vertical-thumbnails">
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`vertical-thumb-item ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={getImageUrl(image)} 
                      alt={`${trip.title} - معاينة ${index + 1}`}
                      className="vertical-thumb-image"
                    />
                    <div className="thumb-overlay">
                      <span className="thumb-number">{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Main Image Viewer */}
              <div className="main-image-viewer">
                <img 
                  src={getImageUrl(images[currentImageIndex])} 
                  alt={`${trip.title} - صورة ${currentImageIndex + 1}`}
                  className="main-image"
                  onClick={() => handleImageClick(currentImageIndex)}
                />
                
                {/* Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button 
                      className="nav-btn prev-btn"
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    <button 
                      className="nav-btn next-btn"
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                <div className="image-counter">
                  {currentImageIndex + 1} / {images.length}
                </div>
                
                {/* Fullscreen Button */}
                <button 
                  className="fullscreen-btn"
                  onClick={() => handleImageClick(currentImageIndex)}
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trip Description */}
        <div className="trip-details-description">
          <h3>وصف الرحلة</h3>
          <div className="description-content">
            <div className="description-arabic">
              <h4>الوصف بالعربية</h4>
              <p>{trip.description || 'لا يوجد وصف متاح'}</p>
            </div>
            <div className="description-english">
              <h4>Description in English</h4>
              <p>{trip.descriptionEn || 'No description available'}</p>
            </div>
          </div>
        </div>

        {/* Trip Video */}
        <div className="trip-details-video">
          <VideoManager 
            tripId={tripId} 
            tripTitle={trip.title || trip.titleEn || 'Trip'}
            showUpload={true}
            showPlayer={true}
          />
        </div>

        {/* Trip Details Grid */}
        <div className="trip-details-grid">
          <div className="trip-details-card">
            <h3>تفاصيل الرحلة</h3>
            <div className="details-list">
              <div className="detail-item">
                <FontAwesomeIcon icon={faUsers} />
                <span>الحد الأقصى للأشخاص: {trip.maxPersons} شخص</span>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faTime} />
                <span>الحد الأدنى للحجز: {trip.minBookingHours} ساعة</span>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>متاح من: {trip.availableFrom}</span>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>متاح حتى: {trip.availableTo}</span>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>تاريخ الإنشاء: {formatDate(trip.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Simple Provider Information */}
          <div className="trip-details-card">
            <h3>معلومات المزود</h3>
            <div className="provider-simple-list">
              <div className="provider-item">
                <div className="provider-avatar-simple">
                  {trip.providerProfileImage || trip.providerImage || trip.provider?.profileImage || trip.provider?.image ? (
                    <img 
                      src={getImageUrl(trip.providerProfileImage || trip.providerImage || trip.provider?.profileImage || trip.provider?.image)} 
                      alt={trip.providerName || 'Provider'}
                      className="provider-image-simple"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="provider-image-placeholder"
                    style={{ 
                      display: !trip.providerProfileImage && !trip.providerImage && !trip.provider?.profileImage && !trip.provider?.image ? 'flex' : 'none'
                    }}
                  >
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                </div>
                <div className="provider-info-simple">
                  <h4>{trip.providerName}</h4>
                  {trip.providerAccountName && (
                    <p className="provider-company-simple">{trip.providerAccountName}</p>
                  )}
                </div>
              </div>
              <div className="provider-contact-simple">
                <div className="contact-item-simple">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>{trip.providerPhone}</span>
                </div>
                <div className="contact-item-simple">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>{trip.providerEmail}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Options */}
        {trip.serviceOptions && trip.serviceOptions.length > 0 && (
          <div className="trip-details-options">
            <h3>الخدمات الإضافية</h3>
            <div className="options-grid">
              {trip.serviceOptions.map((option) => (
                <div key={option.id} className="option-card">
                  <div className="option-header">
                    <h4>{option.name}</h4>
                    <span className="option-price">{option.price} ريال</span>
                  </div>
                  {option.nameEn && (
                    <p className="option-name-en">{option.nameEn}</p>
                  )}
                  <div className="option-stock">
                    <span>المخزون: {option.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trip Packages */}
        {trip.packages && trip.packages.length > 0 && (
          <div className="trip-details-packages">
            <h3>
              <FontAwesomeIcon icon={faBox} />
              باقات الرحلة
            </h3>
            <div className="packages-grid">
              {trip.packages.map((pkg) => (
                <div key={pkg.id} className="package-card">
                  <div className="package-header">
                    <div className="package-icon">
                      <FontAwesomeIcon icon={faGift} />
                    </div>
                    <div className="package-title">
                      <h4>الباقة #{pkg.id}</h4>
                      <p className="package-name-en">Package #{pkg.id}</p>
                    </div>
                    <div className="package-price">
                      <span className="price-amount">{pkg.cost} ريال</span>
                      <span className="price-unit">للوحدة</span>
                    </div>
                  </div>
                  
                  {pkg.notes && (
                    <div className="package-description">
                      <p>{pkg.notes}</p>
                    </div>
                  )}
                  
                  <div className="package-features">
                    <div className="features-list">
                      <h5>تفاصيل الباقة:</h5>
                      <ul>
                        <li>
                          <FontAwesomeIcon icon={faClock} className="feature-icon" />
                          <span>عدد الساعات: {pkg.numberOfHours} ساعة</span>
                        </li>
                        <li>
                          <FontAwesomeIcon icon={faUsers} className="feature-icon" />
                          <span>الحد الأدنى: {pkg.minCount} شخص</span>
                        </li>
                        <li>
                          <FontAwesomeIcon icon={faUsers} className="feature-icon" />
                          <span>الحد الأقصى: {pkg.maxCount} شخص</span>
                        </li>
                        <li>
                          <FontAwesomeIcon icon={faTag} className="feature-icon" />
                          <span>الوحدة: {pkg.unit}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="package-meta">
                    <div className="package-duration">
                      <FontAwesomeIcon icon={faClock} />
                      <span>{pkg.numberOfHours} ساعة</span>
                    </div>
                    <div className="package-persons">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{pkg.minCount}-{pkg.maxCount} أشخاص</span>
                    </div>
                    {pkg.featured && (
                      <div className="package-badge popular">
                        <FontAwesomeIcon icon={faStar} />
                        <span>مميز</span>
                      </div>
                    )}
                    {pkg.status === 'Active' && (
                      <div className="package-badge recommended">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>نشط</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        {trip.comments && trip.comments.length > 0 && (
          <div className="trip-details-comments">
            <h3>التعليقات والتقييمات</h3>
            <div className="comments-list">
              {trip.comments.map((comment) => (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <div className="comment-user">
                      <img 
                        src={getImageUrl(comment.userProfileImage)} 
                        alt={comment.userFullName}
                        className="user-avatar"
                      />
                      <div className="user-info">
                        <h4>{comment.userFullName}</h4>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    <div className="comment-rating">
                      {getRatingStars(comment.rating)}
                    </div>
                  </div>
                  <div className="comment-content">
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal" onClick={handleCloseModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={handleCloseModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            {/* Zoom Controls */}
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={handleZoomIn} title="تكبير">
                <FontAwesomeIcon icon={faSearchPlus} />
              </button>
              <button className="zoom-btn" onClick={handleZoomOut} title="تصغير">
                <FontAwesomeIcon icon={faSearchMinus} />
              </button>
              <button className="zoom-btn" onClick={handleResetZoom} title="إعادة تعيين">
                <FontAwesomeIcon icon={faUndo} />
              </button>
            </div>
            
            <div className="modal-image-container" onMouseMove={handleImageDrag}>
              <img 
                src={getImageUrl(images[currentImageIndex])} 
                alt={`${trip.title} - صورة ${currentImageIndex + 1}`}
                className="modal-image"
                style={{
                  transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  cursor: zoomLevel > 1 ? 'grab' : 'default'
                }}
              />
            </div>
            
            {images.length > 1 && (
              <>
                <button className="modal-nav-btn modal-prev" onClick={handlePrevImage}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button className="modal-nav-btn modal-next" onClick={handleNextImage}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
                
                <div className="modal-counter">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails; 