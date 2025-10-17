import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faEdit,
  faTrash,
  faUser,
  faUserTie,
  faUsers,
  faCalendarAlt,
  faMoneyBillWave,
  faInfoCircle,
  faChevronRight,
  faPhone,
  faEnvelope,
  faIdCard,
  faClock,
  faStickyNote,
  faMapMarkerAlt,
  faTag,
  faCheckCircle,
  faBan,
  faRoute,
  faEye,
  faExternalLinkAlt,
  faPrint,
  faBuilding,
  faUserCircle,
  faCreditCard,
  faUniversity,
  faHashtag,
  faBox
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import SuccessModal from '../SuccessModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
import './BookingsList.css';
import './BookingDetails.css';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-avatar.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const getTripImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-trip.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

// Function to format time as AM/PM
const formatTime = (time) => {
  if (!time) return '-';
  try {
    // Handle datetime format: "2025-07-13 04:00:00.000"
    let timeString = time;
    if (time.includes(' ')) {
      timeString = time.split(' ')[1]; // Extract time part after space
    }
    
    // Remove milliseconds if present
    if (timeString.includes('.')) {
      timeString = timeString.split('.')[0];
    }
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
};

// Function to extract date from datetime string
const extractDateFromDateTime = (datetime) => {
  if (!datetime) return null;
  if (datetime.includes(' ')) {
    return datetime.split(' ')[0];
  }
  return datetime;
};

const statusMap = {
  'Provider Pending': { text: 'في انتظار المزود', color: '#f59e0b', icon: faClock },
  'Pending Payment': { text: 'في انتظار الدفع', color: '#f59e0b', icon: faClock },
  'Paid': { text: 'مدفوع', color: '#1fc1de', icon: faCheckCircle },
  'Completed': { text: 'مكتمل', color: '#10b981', icon: faCheckCircle },
  'Canceled': { text: 'ملغي', color: '#ef4444', icon: faBan },
};

const BookingDetails = ({ bookingId, onBack, onEdit, onViewCustomer, onViewProvider, onViewTrip }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [successModal, setSuccessModal] = useState({ isVisible: false, message: '' });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (err) {
      setError('فشل في تحميل تفاصيل الحجز');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/admin/bookings/${bookingId}`);
      setSuccessModal({ isVisible: true, message: 'تم حذف الحجز بنجاح' });
      setTimeout(() => {
        setSuccessModal({ isVisible: false, message: '' });
        onBack();
      }, 1200);
    } catch (err) {
      setError('فشل في حذف الحجز');
    }
  };

  const printBooking = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="booking-details-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">جاري تحميل تفاصيل الحجز...</div>
      </div>
    );
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  if (!booking) {
    return null;
  }

  // Process trip images and get only the first one
  const tripImages = booking.trip?.images ? booking.trip.images.split(',').filter(img => img.trim()) : [];
  const firstTripImage = tripImages.length > 0 ? tripImages[0] : null;

  // Parse addOns from JSON string to array
  let parsedAddOns = [];
  try {
    if (booking.addOns && typeof booking.addOns === 'string') {
      parsedAddOns = JSON.parse(booking.addOns);
    } else if (Array.isArray(booking.addOns)) {
      parsedAddOns = booking.addOns;
    }
  } catch (error) {
    console.error('Error parsing addOns JSON:', error);
    parsedAddOns = [];
  }

  return (
    <div className="booking-details">
      <div className="booking-details-header">
        <button className="btn-back" onClick={onBack}>
          <FontAwesomeIcon icon={faChevronRight} /> رجوع
        </button>
        <h1 className="booking-details-title">الحجز #{booking.id}</h1>
        <div className="booking-details-actions">
          <button className="btn-print" onClick={printBooking} title="طباعة">
            <FontAwesomeIcon icon={faPrint} />
          </button>
          <button className="btn-edit" onClick={() => onEdit(booking.id)} title="تعديل">
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button className="btn-delete" onClick={() => setDeleteConfirmModal(true)} title="حذف">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
      
      <div className="booking-details-content">
        {/* Costs Section - At the top */}
        <div className="booking-costs-section">
          <div className="costs-header">
            <FontAwesomeIcon icon={faMoneyBillWave} />
            <h3>التكاليف</h3>
          </div>
          <div className="costs-content">
            <div className="total-cost-card">
              <div className="total-cost-header">
                <h4>التكلفة الإجمالية</h4>
              </div>
              <div className="total-cost-amount">{booking.totalCost} ريال</div>
            </div>
            
            <div className="cost-breakdown-grid">
              <div className="cost-breakdown-item">
                <span className="cost-label">تكلفة الرحلة:</span>
                <span className="cost-value">{booking.cost} ريال</span>
              </div>
              <div className="cost-breakdown-item">
                <span className="cost-label">الإضافات:</span>
                <span className="cost-value">{booking.addOnCost} ريال</span>
              </div>
              <div className="cost-breakdown-item">
                <span className="cost-label">عمولة التطبيق:</span>
                <span className="cost-value">{booking.appCommission} ريال</span>
              </div>
              <div className="cost-breakdown-item">
                <span className="cost-label">عمولة المزود:</span>
                <span className="cost-value">{booking.providerCommission} ريال</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Details and Add-ons Row */}
        <div className="booking-details-row">
          {/* Trip Section */}
          <div className="booking-trip-section">
            <div className="trip-header">
              <FontAwesomeIcon icon={faRoute} />
              <h3>تفاصيل الرحلة</h3>
              {onViewTrip && (
                <button 
                  className="view-btn view-btn-primary"
                  onClick={() => onViewTrip(booking.trip.id)}
                  title="عرض تفاصيل الرحلة"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                  عرض تفاصيل الرحلة
                </button>
              )}
            </div>
            
            {booking.trip ? (
              <div className="trip-content">
                {firstTripImage && (
                  <div className="trip-image-section">
                    <div className="trip-image-container">
                      <img 
                        src={getTripImageUrl(firstTripImage)} 
                        alt={`${booking.trip?.title || 'الرحلة'}`}
                        className="trip-image"
                      />
                      <div className="trip-image-overlay">
                        <div className="trip-image-info">
                          <span className="trip-image-count">
                            {tripImages.length} صورة
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="trip-details-grid">
                  <div className="trip-detail-card">
                    <h4>{booking.trip.title}</h4>
                    <div className="trip-meta">
                      <div className="trip-meta-item">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{booking.trip.city?.name || '-'}</span>
                      </div>
                      <div className="trip-meta-item">
                        <FontAwesomeIcon icon={faTag} />
                        <span>{booking.trip.category?.name || '-'}</span>
                      </div>
                      <div className="trip-meta-item">
                        <FontAwesomeIcon icon={faMoneyBillWave} />
                        <span>{booking.trip.price} ريال</span>
                      </div>
                      <div className="trip-meta-item">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>الحد الأقصى: {booking.trip.maxPersons} شخص</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="no-data">لا توجد بيانات رحلة</p>
            )}
          </div>

          {/* Add-ons Section */}
          {parsedAddOns && Array.isArray(parsedAddOns) && parsedAddOns.length > 0 && (
            <div className="booking-addons-section">
              <div className="addons-header">
                <FontAwesomeIcon icon={faTag} />
                <h3>الإضافات المختارة</h3>
              </div>
              <div className="addons-list">
                {parsedAddOns.map((addon, index) => (
                  <div key={addon.Id || index} className="addon-item">
                    <div className="addon-info">
                      <div className="addon-name">
                        <FontAwesomeIcon icon={faTag} />
                        <span>{addon.Name || addon.NameEn || `إضافة ${index + 1}`}</span>
                      </div>
                      <div className="addon-details">
                        <div className="addon-meta">
                          {addon.Quantity && (
                            <span className="addon-quantity">
                              <FontAwesomeIcon icon={faHashtag} />
                              الكمية: {addon.Quantity}
                            </span>
                          )}
                          {addon.Price && (
                            <span className="addon-price">
                              <FontAwesomeIcon icon={faMoneyBillWave} />
                              السعر: {addon.Price} ريال
                            </span>
                          )}
                          {addon.Stock !== undefined && (
                            <span className="addon-stock">
                              <FontAwesomeIcon icon={faBox} />
                              المخزون: {addon.Stock}
                            </span>
                          )}
                        </div>
                        {addon.Quantity && addon.Price && (
                          <div className="addon-subtotal">
                            <span className="subtotal-label">المجموع الفرعي:</span>
                            <span className="subtotal-value">{(addon.Quantity * addon.Price).toFixed(2)} ريال</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="addons-total">
                <div className="addons-total-item">
                  <span className="total-label">إجمالي الإضافات:</span>
                  <span className="total-value">{booking.addOnCost} ريال</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Overview Section */}
        <div className="booking-overview-section">
          <div className="booking-status-card">
            <div className="status-header">
              <FontAwesomeIcon icon={faIdCard} />
              <h3>معلومات الحجز</h3>
            </div>
            <div className="status-content">
              <div className="status-badge-large">
                <FontAwesomeIcon icon={statusMap[booking.status]?.icon} />
                <span>{statusMap[booking.status]?.text || booking.status}</span>
              </div>
              <div className="booking-meta">
                <div className="meta-item">
                  <span className="meta-label">رقم الحجز:</span>
                  <span className="meta-value">#{booking.id}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">تاريخ الحجز:</span>
                  <span className="meta-value">{formatDate(booking.bookingDate)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">عدد الأشخاص:</span>
                  <span className="meta-value">{booking.persons} شخص</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">عدد الساعات:</span>
                  <span className="meta-value">{booking.numOfHours} ساعة</span>
                </div>
              </div>
            </div>
          </div>

          <div className="booking-timing-card">
            <div className="timing-header">
              <FontAwesomeIcon icon={faClock} />
              <h3>التوقيت</h3>
            </div>
            <div className="timing-content">
              <div className="timing-item">
                <div className="timing-icon">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <div className="timing-info">
                  <span className="timing-label">وقت البدء</span>
                  <span className="timing-value">{formatTime(booking.startTime)}</span>
                  <span className="timing-date">{formatDate(extractDateFromDateTime(booking.startTime))}</span>
                </div>
              </div>
              <div className="timing-item">
                <div className="timing-icon">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <div className="timing-info">
                  <span className="timing-label">وقت الانتهاء</span>
                  <span className="timing-value">{formatTime(booking.endTime)}</span>
                  <span className="timing-date">{formatDate(extractDateFromDateTime(booking.endTime))}</span>
                </div>
              </div>
              <div className="timing-item">
                <div className="timing-icon">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <div className="timing-info">
                  <span className="timing-label">تاريخ الإنشاء</span>
                  <span className="timing-value">{formatDate(booking.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="booking-users-section">
          <div className="users-header">
            <FontAwesomeIcon icon={faUsers} />
            <h3>المستخدمين</h3>
          </div>
          <div className="users-list">
            {/* User Details */}
            <div className="user-list-item">
              <div className="user-list-header">
                <div className="user-list-avatar">
                  {booking.user?.profileImage ? (
                    <img 
                      src={getImageUrl(booking.user.profileImage)} 
                      alt="صورة المستخدم" 
                      className="user-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <FontAwesomeIcon 
                    icon={faUserCircle} 
                    className="user-avatar-placeholder"
                    style={{ display: booking.user?.profileImage ? 'none' : 'flex' }}
                  />
                </div>
                <div className="user-list-info">
                  <h4 className="user-list-name">{booking.user?.fullName || 'مستخدم غير محدد'}</h4>
                  <span className="user-list-role">مستخدم</span>
                </div>
                {onViewCustomer && booking.user && (
                  <button 
                    className="view-btn"
                    onClick={() => onViewCustomer(booking.user.id)}
                    title="عرض تفاصيل العميل"
                  >
                    <FontAwesomeIcon icon={faEye} />
                    عرض التفاصيل
                  </button>
                )}
              </div>
              {booking.user && (
                <div className="user-list-details">
                  <div className="user-detail-item">
                    <FontAwesomeIcon icon={faPhone} />
                    <span className="detail-label">اسم المستخدم:</span>
                    <span className="detail-value">{booking.user.userName}</span>
                  </div>
                  <div className="user-detail-item">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span className="detail-label">البريد الإلكتروني:</span>
                    <span className="detail-value">{booking.user.email}</span>
                  </div>
                  {booking.user.phoneNumber && (
                    <div className="user-detail-item">
                      <FontAwesomeIcon icon={faPhone} />
                      <span className="detail-label">رقم الهاتف:</span>
                      <span className="detail-value">{booking.user.phoneNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Provider Details */}
            <div className="user-list-item">
              <div className="user-list-header">
                <div className="user-list-avatar">
                  {booking.provider?.profileImage ? (
                    <img 
                      src={getImageUrl(booking.provider.profileImage)} 
                      alt="صورة المزود" 
                      className="user-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <FontAwesomeIcon 
                    icon={faUserCircle} 
                    className="user-avatar-placeholder"
                    style={{ display: booking.provider?.profileImage ? 'none' : 'flex' }}
                  />
                </div>
                <div className="user-list-info">
                  <h4 className="user-list-name">{booking.provider?.fullName || 'مزود غير محدد'}</h4>
                  <span className="user-list-role">مزود الخدمة</span>
                </div>
                {onViewProvider && booking.provider && (
                  <button 
                    className="view-btn"
                    onClick={() => onViewProvider(booking.provider.id)}
                    title="عرض تفاصيل المزود"
                  >
                    <FontAwesomeIcon icon={faEye} />
                    عرض التفاصيل
                  </button>
                )}
              </div>
              {booking.provider && (
                <div className="user-list-details">
                  <div className="user-detail-item">
                    <FontAwesomeIcon icon={faPhone} />
                    <span className="detail-label">اسم المستخدم:</span>
                    <span className="detail-value">{booking.provider.userName}</span>
                  </div>
                  <div className="user-detail-item">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span className="detail-label">البريد الإلكتروني:</span>
                    <span className="detail-value">{booking.provider.email}</span>
                  </div>
                  {booking.provider.phoneNumber && (
                    <div className="user-detail-item">
                      <FontAwesomeIcon icon={faPhone} />
                      <span className="detail-label">رقم الهاتف:</span>
                      <span className="detail-value">{booking.provider.phoneNumber}</span>
                    </div>
                  )}
                  {booking.provider.accountName && (
                    <div className="user-detail-item">
                      <FontAwesomeIcon icon={faBuilding} />
                      <span className="detail-label">اسم الحساب:</span>
                      <span className="detail-value">{booking.provider.accountName}</span>
                    </div>
                  )}
                  {booking.provider.ibanNumber && (
                    <div className="user-detail-item">
                      <FontAwesomeIcon icon={faCreditCard} />
                      <span className="detail-label">أيبان</span>
                      <span className="detail-value">{booking.provider.ibanNumber}</span>
                    </div>
                  )}
                  {booking.provider.bankName && (
                    <div className="user-detail-item">
                      <FontAwesomeIcon icon={faUniversity} />
                      <span className="detail-label">اسم البنك:</span>
                      <span className="detail-value">{booking.provider.bankName}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {booking.notes && (
          <div className="booking-notes-section">
            <div className="notes-header">
              <FontAwesomeIcon icon={faStickyNote} />
              <h3>الملاحظات</h3>
            </div>
            <div className="notes-content">
              {booking.notes}
            </div>
          </div>
        )}
      </div>

      <SuccessModal
        message={successModal.message}
        isVisible={successModal.isVisible}
        onClose={() => setSuccessModal({ isVisible: false, message: '' })}
      />
      <DeleteConfirmModal
        isVisible={deleteConfirmModal}
        onClose={() => setDeleteConfirmModal(false)}
        onConfirm={handleDelete}
        title="تأكيد حذف الحجز"
        message="هل أنت متأكد من أنك تريد حذف الحجز؟"
      />
    </div>
  );
};

export default BookingDetails; 