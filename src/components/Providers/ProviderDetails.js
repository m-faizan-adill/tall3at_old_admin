import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faMapMarkerAlt, 
  faCalendar, 
  faPhone, 
  faEnvelope,
  faUser,
  faBuilding,
  faStar,
  faRoute,
  faBookmark,
  faMoneyBillWave,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faUserSlash,
  faExclamationTriangle,
  faUsers,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import './ProviderDetails.css';

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-avatar.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const ProviderDetails = ({ providerId, onBack, onViewTrip, onViewBooking }) => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProviderDetails();
  }, [providerId]);

  const fetchProviderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/providers/${providerId}`);
      console.log('Provider Details Response:', response.data);
      setProvider(response.data);
    } catch (err) {
      setError('فشل في تحميل تفاصيل المزود');
      console.error('Error fetching provider details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Utility function to get trip image URL
  const getTripImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/images/default-trip.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_CONFIG.BASE_URL}${imagePath}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { class: 'status-active', text: 'نشط', icon: faCheckCircle },
      'Pending': { class: 'status-pending', text: 'في الانتظار', icon: faClock },
      'Suspended': { class: 'status-suspended', text: 'معلق', icon: faTimesCircle },
      'Deleted': { class: 'status-deleted', text: 'محذوف', icon: faUserSlash }
    };
    
    const config = statusConfig[status] || { class: 'status-default', text: status, icon: faUser };
    return (
      <span className={`status-badge ${config.class}`}>
        <FontAwesomeIcon icon={config.icon} />
        {config.text}
      </span>
    );
  };

  const getBookingStatusBadge = (status) => {
    const statusConfig = {
      'Provider Pending': { class: 'status-pending', text: 'في انتظار المزود' },
      'Pending Payment': { class: 'status-pending', text: 'في انتظار الدفع' },
      'Paid': { class: 'status-paid', text: 'مدفوع' },
      'Completed': { class: 'status-completed', text: 'مكتمل' },
      'Canceled': { class: 'status-canceled', text: 'ملغي' }
    };
    
    const config = statusConfig[status] || { class: 'status-default', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="provider-details-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">جاري تحميل تفاصيل المزود...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="provider-details-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={onBack}>العودة</button>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="provider-details-error">
        <p>لم يتم العثور على المزود</p>
        <button className="btn btn-primary" onClick={onBack}>العودة</button>
      </div>
    );
  }

  return (
    <div className="provider-details">
      <div className="provider-details-header">
        <button className="btn-back" onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          العودة إلى قائمة المزودين
        </button>
        <h2>تفاصيل المزود</h2>
      </div>

      <div className="provider-details-content">
        {/* Provider Basic Info */}
        <div className="provider-basic-info">
          <div className="provider-profile">
            {provider.profileImage && provider.profileImage !== 'null' && provider.profileImage !== 'undefined' && provider.profileImage.trim() !== '' ? (
              <img 
                src={getImageUrl(provider.profileImage)} 
                alt={provider.fullName}
                className="provider-profile-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`provider-profile-icon ${!provider.profileImage || provider.profileImage === 'null' || provider.profileImage === 'undefined' || provider.profileImage.trim() === '' ? 'visible' : 'hidden'}`}>
              <FontAwesomeIcon icon={faUserSlash} />
            </div>
            <div className="provider-profile-info">
              <h3>{provider.fullName}</h3>
              <p className="provider-username">@{provider.userName}</p>
              {getStatusBadge(provider.status)}
            </div>
          </div>

          <div className="provider-contact-info">
            <div className="contact-item">
              <FontAwesomeIcon icon={faEnvelope} />
              <span>{provider.email}</span>
            </div>
            <div className="contact-item">
              <FontAwesomeIcon icon={faPhone} />
              <span>{provider.userName}</span>
            </div>
            <div className="contact-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>{provider.cityName}</span>
            </div>
            <div className="contact-item">
              <FontAwesomeIcon icon={faCalendar} />
              <span>انضم في {formatDate(provider.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="provider-statistics">
          <h3>الإحصائيات</h3>
          <div className="statistics-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faRoute} />
              </div>
              <div className="stat-content">
                <h4>إجمالي الرحلات</h4>
                <p className="stat-number">{provider.statistics.totalTrips}</p>
                <p className="stat-detail">
                  نشط: {provider.statistics.activeTrips} | في الانتظار: {provider.statistics.pendingTrips}
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faBookmark} />
              </div>
              <div className="stat-content">
                <h4>إجمالي الحجوزات</h4>
                <p className="stat-number">{provider.statistics.totalBookings}</p>
                <p className="stat-detail">
                  مكتمل: {provider.statistics.completedBookings} | ملغي: {provider.statistics.canceledBookings}
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faMoneyBillWave} />
              </div>
              <div className="stat-content">
                <h4>إجمالي الأرباح</h4>
                <p className="stat-number">{provider.statistics.totalEarnings?.toFixed(2) || '0'} ريال</p>
                <p className="stat-detail">من الحجوزات المكتملة</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="stat-content">
                <h4>التقييم</h4>
                <p className="stat-number">{provider.statistics.averageRating}</p>
                <p className="stat-detail">من {provider.statistics.totalReviews} تقييم</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trips Grid */}
        <div className="provider-recent-data">
          <div className="recent-trips">
            <h3>أحدث الرحلات</h3>
            {provider.recentTrips.length > 0 ? (
              <div className="trips-grid">
                {provider.recentTrips.map(trip => (
                  <div 
                    key={trip.id} 
                    className="trip-card"
                    onClick={() => onViewTrip && onViewTrip(trip.id)}
                  >
                    <div className="trip-image">
                      {trip.firstImage ? (
                        <img 
                          src={getTripImageUrl(trip.firstImage)} 
                          alt={trip.title}
                          className="trip-card-image"
                        />
                      ) : (
                        <div className="trip-no-image">
                          <FontAwesomeIcon icon={faRoute} />
                        </div>
                      )}
                      <div className="trip-status-overlay">
                        {getStatusBadge(trip.status)}
                      </div>
                    </div>
                    <div className="trip-card-content">
                      <h4 className="trip-title">{trip.title}</h4>
                      <div className="trip-bottom">
                        <span className="trip-price">{trip.price}</span>
                        <span className="trip-date">{formatDate(trip.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">لا توجد رحلات حديثة</p>
            )}
          </div>

          {/* Recent Bookings Grid */}
          <div className="recent-bookings">
            <h3>أحدث الحجوزات</h3>
            {provider.recentBookings.length > 0 ? (
              <div className="bookings-grid">
                {provider.recentBookings.map(booking => (
                  <div 
                    key={booking.id} 
                    className="booking-card enhanced-booking-card"
                    onClick={() => onViewBooking && onViewBooking(booking.id)}
                  >
                    <div className="booking-card-header">
                      <div className="booking-user-avatar">
                        {booking.userImage ? (
                          <img 
                            src={getImageUrl(booking.userImage)} 
                            alt={booking.userName}
                            className="user-avatar-large"
                          />
                        ) : (
                          <div className="user-avatar-placeholder user-avatar-large">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                        )}
                      </div>
                      <div className="booking-user-info">
                        <span className="user-name-large">{booking.userName}</span>
                        <span className="booking-id">#{booking.id}</span>
                      </div>
                      <div className="booking-status-badge">
                        {getBookingStatusBadge(booking.status)}
                      </div>
                    </div>
                    <div className="booking-card-body">
                      <div className="booking-trip-thumbnail">
                        {booking.tripFirstImage ? (
                          <img 
                            src={getTripImageUrl(booking.tripFirstImage)} 
                            alt={booking.tripTitle}
                            className="trip-thumbnail-rounded"
                          />
                        ) : (
                          <div className="trip-thumbnail-placeholder trip-thumbnail-rounded">
                            <FontAwesomeIcon icon={faRoute} />
                          </div>
                        )}
                      </div>
                      <div className="booking-trip-info">
                        <h4 className="trip-title-large">{booking.tripTitle}</h4>
                        <span className="booking-date">{formatDate(booking.bookingDate)}</span>
                      </div>
                    </div>
                    <div className="booking-card-footer">
                      <span className="total-amount-badge">{booking.totalCost} ريال</span>
                      <span className="booking-arrow-icon">
                        <FontAwesomeIcon icon={faEye} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">لا توجد حجوزات حديثة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetails; 