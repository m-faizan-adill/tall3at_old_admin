import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faEdit, 
  faUser, 
  faPhone, 
  faEnvelope, 
  faMapMarkerAlt, 
  faCalendarAlt,
  faShoppingCart,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faStar,
  faMoneyBillWave,
  faRoute
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import './CustomerDetails.css';

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const CustomerDetails = ({ customerId, onBack, onEdit, onViewBooking, onViewTrip }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/users/${customerId}`);
      setCustomer(response.data);
    } catch (err) {
      setError('فشل في تحميل بيانات العميل');
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { 
        class: 'customers-status-active', 
        text: 'نشط',
        icon: faCheckCircle
      },
      'Pending': { 
        class: 'customers-status-pending', 
        text: 'في الانتظار',
        icon: faClock
      },
      'Suspended': { 
        class: 'customers-status-suspended', 
        text: 'معلق',
        icon: faTimesCircle
      },
      'Deleted': { 
        class: 'customers-status-deleted', 
        text: 'محذوف',
        icon: faTimesCircle
      }
    };
    
    const config = statusConfig[status] || { 
      class: 'customers-status-default', 
      text: status,
      icon: faClock
    };
    
    return (
      <span className={`customers-status-badge ${config.class}`}>
        <FontAwesomeIcon icon={config.icon} />
        {config.text}
      </span>
    );
  };

  const getBookingStatusText = (status) => {
    const statusMap = {
      'Provider Pending': 'في انتظار المزود',
      'Pending Payment': 'في انتظار الدفع',
      'Paid': 'مدفوع',
      'Completed': 'مكتمل',
      'Canceled': 'ملغي'
    };
    return statusMap[status] || status;
  };

  const getBookingStatusClass = (status) => {
    const statusClassMap = {
      'Provider Pending': 'customers-booking-status-pending',
      'Pending Payment': 'customers-booking-status-pending-payment',
      'Paid': 'customers-booking-status-paid',
      'Completed': 'customers-booking-status-completed',
      'Canceled': 'customers-booking-status-canceled'
    };
    return statusClassMap[status] || 'customers-booking-status-default';
  };

  if (loading) {
    return (
      <div className="customers-details-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">جاري تحميل تفاصيل العميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customers-details">
        <div className="customers-details-header">
          <button className="customers-btn-back" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowRight} />
            العودة
          </button>
          <h2>تفاصيل العميل</h2>
        </div>
        <div className="customers-error-message">{error}</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customers-details">
        <div className="customers-details-header">
          <button className="customers-btn-back" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowRight} />
            العودة
          </button>
          <h2>تفاصيل العميل</h2>
        </div>
        <div className="customers-no-data">لم يتم العثور على العميل</div>
      </div>
    );
  }

  return (
    <div className="customers-details">
      <div className="customers-details-header">
        <div className="customers-header-left">
          <button className="customers-btn-back" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowRight} />
            العودة إلى قائمة العملاء
          </button>
          <div className="customers-header-title">
            <h2>تفاصيل العميل</h2>
            <p>عرض وإدارة معلومات العميل وحجوزاته</p>
          </div>
        </div>
        <div className="customers-header-actions">
          <button className="customers-btn customers-btn-primary" onClick={() => onEdit(customer.id)}>
            <FontAwesomeIcon icon={faEdit} />
            تعديل العميل
          </button>
        </div>
      </div>

      <div className="customers-details-content">
        {/* Profile Section */}
        <div className="customers-profile-section">
          <div className="customers-profile-header">
            <div className="customers-profile-avatar">
              {getImageUrl(customer.profileImage) ? (
                <img 
                  src={getImageUrl(customer.profileImage)} 
                  alt={customer.fullName}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {(!getImageUrl(customer.profileImage) || !customer.profileImage) && (
                <div className="customers-profile-avatar-placeholder">
                  <FontAwesomeIcon icon={faUser} />
                </div>
              )}
            </div>
            <div className="customers-profile-info">
              <h3>{customer.fullName}</h3>
              <p className="customers-role">عميل</p>
              {getStatusBadge(customer.status)}
            </div>
          </div>
        </div>

        <div className="customers-details-grid">
          {/* Basic Information */}
          <div className="customers-details-card">
            <h4>المعلومات الأساسية</h4>
            <div className="customers-info-list">
              <div className="customers-info-item">
                <FontAwesomeIcon icon={faUser} />
                <span className="customers-info-label">الاسم الكامل:</span>
                <span className="customers-info-value">{customer.fullName}</span>
              </div>
              <div className="customers-info-item">
                <FontAwesomeIcon icon={faPhone} />
                <span className="customers-info-label">رقم الهاتف:</span>
                <span className="customers-info-value">{customer.userName}</span>
              </div>
              <div className="customers-info-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <span className="customers-info-label">البريد الإلكتروني:</span>
                <span className="customers-info-value">{customer.email}</span>
              </div>
              <div className="customers-info-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span className="customers-info-label">المدينة:</span>
                <span className="customers-info-value">{customer.cityName || 'غير محدد'}</span>
              </div>
              <div className="customers-info-item">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span className="customers-info-label">تاريخ الإنشاء:</span>
                <span className="customers-info-value">{formatDate(customer.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="customers-details-card">
            <h4>الإحصائيات</h4>
            <div className="customers-stats-grid">
              <div className="customers-stat-item">
                <div className="customers-stat-icon">
                  <FontAwesomeIcon icon={faShoppingCart} />
                </div>
                <div className="customers-stat-content">
                  <span className="customers-stat-value">{customer.statistics?.totalBookings || 0}</span>
                  <span className="customers-stat-label">إجمالي الحجوزات</span>
                </div>
              </div>
              <div className="customers-stat-item">
                <div className="customers-stat-icon">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div className="customers-stat-content">
                  <span className="customers-stat-value">{customer.statistics?.completedBookings || 0}</span>
                  <span className="customers-stat-label">الحجوزات المكتملة</span>
                </div>
              </div>
              <div className="customers-stat-item">
                <div className="customers-stat-icon">
                  <FontAwesomeIcon icon={faTimesCircle} />
                </div>
                <div className="customers-stat-content">
                  <span className="customers-stat-value">{customer.statistics?.canceledBookings || 0}</span>
                  <span className="customers-stat-label">الحجوزات الملغية</span>
                </div>
              </div>
              <div className="customers-stat-item">
                <div className="customers-stat-icon">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                </div>
                <div className="customers-stat-content">
                  <span className="customers-stat-value">{customer.statistics?.totalSpent?.toFixed(2) || '0'} ريال</span>
                  <span className="customers-stat-label">إجمالي الإنفاق</span>
                </div>
              </div>
              <div className="customers-stat-item">
                <div className="customers-stat-icon">
                  <FontAwesomeIcon icon={faStar} />
                </div>
                <div className="customers-stat-content">
                  <span className="customers-stat-value">{customer.statistics?.averageRating || 0}</span>
                  <span className="customers-stat-label">متوسط التقييم</span>
                </div>
              </div>
              <div className="customers-stat-item">
                <div className="customers-stat-icon">
                  <FontAwesomeIcon icon={faRoute} />
                </div>
                <div className="customers-stat-content">
                  <span className="customers-stat-value">{customer.statistics?.totalReviews || 0}</span>
                  <span className="customers-stat-label">عدد التقييمات</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        {customer.recentTrips && customer.recentTrips.length > 0 && (
          <div className="customers-details-card">
            <h4>الرحلات الأخيرة</h4>
            <div className="customers-trips-grid">
              {customer.recentTrips.map(trip => (
                <div 
                  key={trip.id} 
                  className={`customers-trip-card ${onViewTrip ? 'clickable' : ''}`}
                  onClick={() => onViewTrip && onViewTrip(trip.id)}
                >
                  <div className="customers-trip-card-header">
                    <h5>{trip.title}</h5>
                    <span className={`customers-trip-status ${trip.status?.toLowerCase()}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="customers-trip-card-content">
                    <div className="customers-trip-card-info">
                      <div className="customers-trip-info-item">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{trip.cityName || 'غير محدد'}</span>
                      </div>
                      <div className="customers-trip-info-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>تاريخ الإنشاء: {formatDate(trip.createdAt)}</span>
                      </div>
                    </div>
                    <div className="customers-trip-card-footer">
                      <small>انقر لعرض التفاصيل</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="customers-details-card">
          <h4>الحجوزات الأخيرة</h4>
          {customer.recentBookings && customer.recentBookings.length > 0 ? (
            <div className="customers-bookings-grid">
              {customer.recentBookings.map(booking => (
                <div 
                  key={booking.id} 
                  className={`customers-booking-card ${onViewBooking ? 'clickable' : ''}`}
                  onClick={() => onViewBooking && onViewBooking(booking.id)}
                >
                  <div className="customers-booking-card-header">
                    <h5>{booking.tripTitle}</h5>
                    <span className={`customers-booking-status ${getBookingStatusClass(booking.status)}`}>
                      {getBookingStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="customers-booking-card-content">
                    <div className="customers-booking-card-info">
                      <div className="customers-booking-info-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>تاريخ الحجز: {formatDate(booking.bookingDate)}</span>
                      </div>
                      <div className="customers-booking-info-item">
                        <FontAwesomeIcon icon={faMoneyBillWave} />
                        <span>التكلفة: {booking.totalCost?.toFixed(2) || '0'} ريال</span>
                      </div>
                    </div>
                    <div className="customers-booking-card-footer">
                      <small>تم إنشاء الحجز في: {formatDate(booking.createdAt)}</small>
                      <small className="click-hint">انقر لعرض التفاصيل</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="customers-no-data">
              <p>لا توجد حجوزات حديثة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails; 