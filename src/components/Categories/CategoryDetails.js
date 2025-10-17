import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faEdit, 
  faTrash, 
  faCalendarAlt,
  faCalendar,
  faMapMarkerAlt,
  faUser,
  faMoneyBillWave,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faBan,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import ShimmerLoading from '../ShimmerLoading';
import './CategoryDetails.css';

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-category.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const CategoryDetails = ({ categoryId, onBack, onEdit }) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryDetails();
    }
  }, [categoryId]);

  const fetchCategoryDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/admin/categories/${categoryId}`);
      setCategory(response.data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل تفاصيل الفئة');
      console.error('Error fetching category details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#10b981';
      case 'Pending':
        return '#f59e0b';
      case 'Completed':
        return '#3b82f6';
      case 'Canceled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Active':
        return 'نشط';
      case 'Pending':
        return 'في الانتظار';
      case 'Completed':
        return 'مكتمل';
      case 'Canceled':
        return 'ملغي';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="category-details">
        <div className="category-details-header">
          <button className="category-details-btn-back" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowRight} />
            العودة للقائمة
          </button>
        </div>
        <div className="category-details-content">
          <div className="category-profile">
            <ShimmerLoading type="details" />
          </div>
          <div className="category-stats">
            <ShimmerLoading type="details" />
          </div>
          <div className="category-recent">
            <ShimmerLoading type="details" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-details">
        <div className="category-details-header">
          <button className="category-details-btn-back" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowRight} />
            العودة للقائمة
          </button>
        </div>
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-details">
        <div className="category-details-header">
          <button className="category-details-btn-back" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowRight} />
            العودة للقائمة
          </button>
        </div>
        <div className="no-data">
          <p>لم يتم العثور على الفئة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-details">
      <div className="category-details-header">
        <button className="category-details-btn-back" onClick={onBack}>
          <FontAwesomeIcon icon={faArrowRight} />
          العودة للقائمة
        </button>
        <button className="category-details-btn-edit" onClick={() => onEdit(category.id)}>
          تعديل الفئة
        </button>
      </div>

      <div className="category-details-content">
        {/* Category Profile */}
        <div className="category-profile">
          <div className="category-avatar-section">
            <img
              src={getImageUrl(category.image)}
              alt={category.name}
              className="category-avatar"
              onError={(e) => {
                e.target.src = '/assets/images/category.png';
              }}
            />
            <div className="category-status">
              <span className={`category-status-badge ${category.active ? 'active' : 'inactive'}`}>
                {category.active ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>
          <div className="category-info">
            <h2>{category.name}</h2>
            <p className="category-name-en">{category.nameEn}</p>
            <div className="category-meta">
              <span>
                <FontAwesomeIcon icon={faCalendar} />
                تاريخ الإنشاء: {formatDate(category.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="category-stats">
          <h3>إحصائيات الفئة</h3>
          <div className="category-stats-grid">
            <div className="category-stat-card">
              <div className="category-stat-icon trips">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <div className="category-stat-content">
                <h4>إجمالي الرحلات</h4>
                <p>{category.statistics.totalTrips}</p>
                <span className="category-stat-subtitle">
                  {category.statistics.activeTrips} نشط
                </span>
              </div>
            </div>

            <div className="category-stat-card">
              <div className="category-stat-icon bookings">
                <FontAwesomeIcon icon={faCalendar} />
              </div>
              <div className="category-stat-content">
                <h4>إجمالي الحجوزات</h4>
                <p>{category.statistics.totalBookings}</p>
                <span className="category-stat-subtitle">
                  {category.statistics.completedBookings} مكتمل
                </span>
              </div>
            </div>

            <div className="category-stat-card">
              <div className="category-stat-icon revenue">
                <FontAwesomeIcon icon={faMoneyBillWave} />
              </div>
              <div className="category-stat-content">
                <h4>إجمالي الإيرادات</h4>
                <p>{category.statistics.totalRevenue || 0} ريال</p>
                <span className="category-stat-subtitle">
                  من الحجوزات المكتملة
                </span>
              </div>
            </div>

            <div className="category-stat-card">
              <div className="category-stat-icon rating">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="category-stat-content">
                <h4>متوسط التقييم</h4>
                <p>{category.statistics.averageRating}</p>
                <span className="category-stat-subtitle">
                  من {category.statistics.totalReviews} تقييم
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Content */}
        <div className="category-recent">
          <div className="category-recent-trips">
            <h3>أحدث الرحلات</h3>
            <div className="category-recent-list">
              {category.recentTrips.length > 0 ? (
                category.recentTrips.map((trip) => (
                  <div key={trip.id} className="category-recent-item">
                    <div className="category-item-info">
                      <h4>{trip.title}</h4>
                      <p className="category-item-meta">
                        <span className="provider">
                          <FontAwesomeIcon icon={faUser} />
                          {trip.providerName}
                        </span>
                        <span className="price">
                          <FontAwesomeIcon icon={faMoneyBillWave} />
                          {trip.price} ريال
                        </span>
                      </p>
                    </div>
                    <div className="category-item-status">
                      <span 
                        className="category-status-badge"
                        style={{ backgroundColor: getStatusColor(trip.status) }}
                      >
                        {getStatusText(trip.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="category-no-data">
                  <p>لا توجد رحلات حديثة</p>
                </div>
              )}
            </div>
          </div>

          <div className="category-recent-bookings">
            <h3>أحدث الحجوزات</h3>
            <div className="category-recent-list">
              {category.recentBookings.length > 0 ? (
                category.recentBookings.map((booking) => (
                  <div key={booking.id} className="category-recent-item">
                    <div className="category-item-info">
                      <h4>{booking.tripTitle}</h4>
                      <p className="category-item-meta">
                        <span className="customer">
                          <FontAwesomeIcon icon={faUser} />
                          {booking.customerName}
                        </span>
                        <span className="cost">
                          <FontAwesomeIcon icon={faMoneyBillWave} />
                          {booking.totalCost} ريال
                        </span>
                      </p>
                    </div>
                    <div className="category-item-status">
                      <span 
                        className="category-status-badge"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="category-no-data">
                  <p>لا توجد حجوزات حديثة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetails; 