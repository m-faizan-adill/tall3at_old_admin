import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faChevronRight,
  faIdCard,
  faClock,
  faCheckCircle,
  faBan,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import SuccessModal from '../SuccessModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
// import './Bookings_List.css';
import './BookingDetails.css';
import { generateBookingDetailPDF } from '../../utils/exportHelpers';

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
  console.log('BookingDetails booking:', booking);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState({ isVisible: false, message: '' });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contentRef = useRef(null);

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

  const generatePDF = () => {
    generateBookingDetailPDF({
      booking,
      parsedAddOns,
      statusMap,
      formatDate,
      formatTime,
      extractDateFromDateTime,
      formatIdentity,
      formatPhone,
      setIsGeneratingPDF,
      setError,
      setSuccessModal,
      contentRef
    })
  }

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

  // Utility function
  const formatIdentity = (identity) => {
    if (!identity) return '-';
    return identity.slice(-6); // last 6 characters only
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';

    // Remove + sign agar kahin bhi ho
    phone = phone.replace(/\+/g, '');

    // Already starts with 966
    if (phone.startsWith('966')) {
      return phone;
    }

    // Otherwise, add 966
    return `966${phone}`;
  };

  return (
    <div className="booking-details">
      <div className="booking-details-header">
        <button className="btn-back" onClick={onBack}>
          <FontAwesomeIcon icon={faChevronRight} />
          <span>العودة للقائمة</span>
        </button>
        <h1 className="booking-details-title">
          <FontAwesomeIcon icon={faIdCard} style={{ marginLeft: '12px' }} />
          الحجز #{booking.id}
        </h1>
        <div className="booking-details-actions">
          <button
            className="btn-pdf"
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            title="تحميل PDF"
          >
            <FontAwesomeIcon icon={isGeneratingPDF ? faClock : faDownload} />
          </button>

          <button className="btn-edit" onClick={() => onEdit(booking.id)} title="تعديل الحجز">
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button className="btn-delete" onClick={() => setDeleteConfirmModal(true)} title="حذف الحجز">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      <div className="booking-details-content" ref={contentRef}>
        {/* Invoice Header - Similar to PDF */}
        <div className="invoice-header">
          <div className="company-info">
            <h1 className="company-title">تطبيق طلعات</h1>
            <p className="company-subtitle">نظام إدارة الحجوزات</p>
            <div className="invoice-meta">
              <div>رقم الحجز: #{booking.id}</div>
              <div>تاريخ الحجز: {formatDate(booking.createdAt)}</div>
              <div>الحالة: {statusMap[booking.status]?.text || booking.status}</div>
            </div>
          </div>
          <div className="booking-info">
            <h2 className="booking-title">تفاصيل الحجز</h2>
            <div className="booking-meta">
              <div>عدد الأشخاص: {booking.persons} شخص</div>
              <div>عدد الساعات: {booking.package?.numberOfHours} ساعات</div>
              <div>وقت البدء: {formatTime(booking.startTime)} - {formatDate(extractDateFromDateTime(booking.startTime))}</div>
              <div>وقت الانتهاء: {formatTime(booking.endTime)} - {formatDate(extractDateFromDateTime(booking.endTime))}</div>
            </div>
          </div>
        </div>

        {/* Centered Header - Like PDF */}
        <div className="centered-header">
          <h2 className="centered-title">
            حجز رقم #{booking.id} - {booking.trip?.title || 'رحلة غير محددة'}
          </h2>
        </div>

        {/* Cost Breakdown - Grid Layout */}
        <div className="cost-breakdown-section">
          <h3 className="section-title">تفاصيل التكاليف</h3>
          <div className="cost-grid">
            <div className="cost-item">
              <div className="cost-label">تكلفة الباكج</div>
              <div className="cost-value">{booking.cost} ريال</div>
            </div>
            <div className="cost-item">
              <div className="cost-label">الإضافات</div>
              <div className="cost-value">{booking.addOnCost} ريال</div>
            </div>
            <div className="cost-item commission">
              <div className="cost-label">عمولة التطبيق</div>
              <div className="cost-value">{booking.appCommission} ريال</div>
            </div>
            <div className="cost-item commission">
              <div className="cost-label">عمولة المزود</div>
              <div className="cost-value">{booking.providerCommission} ريال</div>
            </div>
          </div>
          <div className="total-cost">
            <div className="total-cost-text">التكلفة الإجمالية للطلعة: {booking.totalCost} ريال</div>
          </div>
        </div>

        {/* User Information Grid */}
        <div className="user-grid">
          {/* Customer Information */}
          <div className="user-card customer-card">
            <h4 className="user-card-title">معلومات العميل</h4>
            {booking.user ? (
              <div className="user-details">
                <div className="user-detail">هوية: {formatIdentity(booking.user?.id)}</div>
                <div className="user-detail">الاسم: {booking.user.fullName || 'غير محدد'}</div>
                <div className="user-detail phone"> +اسم المستخدم: {booking.user.userName ? `${formatPhone(booking.user.userName)}` : '-'}</div>
                <div className="user-detail">البريد الإلكتروني: {booking.user.email || '-'}</div>

                <div className='user-detail'> مدينه: {booking.customerCity}</div>
              </div>
            ) : (
              <div className="no-data">لا توجد بيانات العميل</div>
            )}
          </div>

          {/* Provider Information */}
          <div className="user-card provider-card">
            <h4 className="user-card-title">معلومات المزود</h4>
            {booking.provider ? (
              <div className="user-details">
                <div className="user-detail">هوية: {formatIdentity(booking.provider?.id)}</div>

                <div className="user-detail">الاسم: {booking.provider.fullName || 'غير محدد'}</div>
                <div className="user-detail phone"> +اسم المستخدم: {formatPhone(booking.provider.userName) || '-'}</div>
                <div className="user-detail">البريد الإلكتروني: {booking.provider.email || '-'}</div>

                <div className='user-detail'> مدينه: {booking.providerCity}</div>

              </div>
            ) : (
              <div className="no-data">لا توجد بيانات المزود</div>
            )}
          </div>
        </div>

        {/* Bank Details Section */}
        {booking.provider && booking.provider.bankName && (
          <div className="bank-section">
            <h3 className="section-title">معلومات البنك</h3>
            <div className="bank-details">
              <div className="bank-info">اسم البنك: <span className="bank-value">{booking.provider.bankName}</span></div>
              {booking.provider.ibanNumber && (
                <div className="bank-info">
                  رقم الآيبان: <span className="bank-value">{booking.provider.ibanNumber}</span>
                </div>
              )}            </div>
            <div className="bank-info">اسم الحساب: <span className="bank-value">{booking.provider.accountName}</span></div>
          </div>
        )}

        {/* Trip and Add-ons Row */}
        <div className="trip-addons-row">
          {/* Trip Section */}
          <div className="trip-section">
            <h3 className="section-title">تفاصيل الرحلة</h3>
            {booking.trip ? (
              <div className="trip-info">
                <div className="trip-name">{booking.trip.title}</div>

                <div className="trip-price">
                  {booking.trip.price} ريال / {booking.numOfHours} ساعات
                </div>
              </div>
            ) : (
              <div className="no-data">لا توجد بيانات رحلة متاحة</div>
            )}
          </div>

          {/* Add-ons Section */}
          <div className="addons-section">
            <h3 className="section-title">الإضافات المختارة</h3>
            {parsedAddOns && Array.isArray(parsedAddOns) && parsedAddOns.length > 0 ? (
              <div className="addons-list">
                {parsedAddOns.map((addon, index) => (
                  <div key={addon.Id || index} className="addon-item">
                    <div className="addon-name">{addon.Name || addon.NameEn || `إضافة ${index + 1}`}</div>
                    <div className="addon-details">
                      {addon.Quantity && <span>الكمية: {addon.Quantity}</span>}
                      {addon.Price && <span>السعر: {addon.Price} ريال</span>}
                      {addon.Quantity && addon.Price && (
                        <span>المجموع: {(addon.Quantity * addon.Price).toFixed(2)} ريال</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">لا توجد إضافات</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="footer-text">تم إنشاء هذا التقرير بواسطة نظام طلعات الإداري</div>
          <div className="footer-date">تاريخ الإنشاء: {formatDate(booking.createdAt)}</div>
        </div>
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