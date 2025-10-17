import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faEye,
  faEdit,
  faTrash,
  faPlus,
  faDownload,
  faPrint,
  faSort,
  faSortUp,
  faSortDown,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faBan,
  faUser,
  faUserTie,
  faUsers,
  faCalendarAlt,
  faMoneyBillWave,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import SuccessModal from '../SuccessModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
import './BookingsList.css';

// Utility function to get trip image URL
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

// Function to format date and time together
const formatDateTime = (date, time) => {
  if (!date || !time) return '-';
  const formattedTime = formatTime(time);
  const formattedDate = formatDate(date);
  return `${formattedTime} - ${formattedDate}`;
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

const BookingsList = ({ onViewBooking, onEditBooking, onCreateBooking }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    tripId: '',
    userId: '',
    providerId: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [successModal, setSuccessModal] = useState({ isVisible: false, message: '' });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isVisible: false, bookingId: null });

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, [pagination.currentPage, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...filters
      });
      const response = await api.get(`/api/admin/bookings?${params}`);
      setBookings(response.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
        totalCount: response.data.pagination.totalCount
      }));
    } catch (err) {
      setError('فشل في تحميل بيانات الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (key, value) => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, sortBy, sortOrder: newSortOrder }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      await api.put(`/api/admin/bookings/${bookingId}/status`, formData);
      fetchBookings();
      showSuccessMessage('تم تحديث حالة الحجز بنجاح');
    } catch (err) {
      setError('فشل في تحديث حالة الحجز');
    }
  };

  const printBookings = () => {
    try {
      const printWindow = window.open('', '_blank');
      const printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>قائمة الحجوزات - طلعات</title>
          <style>
            body { font-family: 'Cairo', 'Tajawal', 'Noto Kufi Arabic', Arial, sans-serif; margin: 20px; direction: rtl; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1fc1de; padding-bottom: 20px; }
            .header h1 { color: #1fc1de; margin: 0; font-size: 24px; }
            .header p { color: #666; margin: 5px 0 0 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f8f9fa; font-weight: bold; color: #1fc1de; }
            .status-completed { color: #10b981; font-weight: bold; }
            .status-pending { color: #f59e0b; font-weight: bold; }
            .status-canceled { color: #ef4444; font-weight: bold; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>قائمة الحجوزات</h1>
            <p>تطبيق طلعات - ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>المعرف</th>
                <th>الرحلة</th>
                <th>المستخدم</th>
                <th>المزود</th>
                <th>الحالة</th>
                <th>التكلفة</th>
                <th>عدد الأشخاص</th>
                <th>تاريخ الحجز</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(b => `
                <tr>
                  <td>${b.id}</td>
                  <td>${b.tripTitle || '-'}</td>
                  <td>${b.userName || '-'}</td>
                  <td>${b.providerName || '-'}</td>
                  <td>${statusMap[b.status]?.text || b.status}</td>
                  <td>${b.totalCost} ريال</td>
                  <td>${b.persons}</td>
                  <td>${formatDate(b.bookingDate)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } catch (err) {
      setError('فشل في طباعة البيانات');
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessModal({ isVisible: true, message });
  };

  const closeSuccessModal = () => {
    setSuccessModal({ isVisible: false, message: '' });
  };

  const showDeleteConfirmModal = (bookingId) => {
    setDeleteConfirmModal({ isVisible: true, bookingId });
  };

  const closeDeleteConfirmModal = () => {
    setDeleteConfirmModal({ isVisible: false, bookingId: null });
  };

  const handleDelete = async (bookingId) => {
    try {
      await api.delete(`/api/admin/bookings/${bookingId}`);
      fetchBookings();
      showSuccessMessage('تم حذف الحجز بنجاح');
    } catch (err) {
      setError('فشل في حذف الحجز');
    }
  };

  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return <FontAwesomeIcon icon={faSort} />;
    return filters.sortOrder === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />;
  };

  return (
    <div className="bookings-list">
      <div className="trips-header">
        <div className="trips-title">
          <h2>إدارة الحجوزات</h2>
          <p>عرض وإدارة جميع الحجوزات في النظام</p>
        </div>
        <div className="trips-actions">
          <button className="btn btn-print" onClick={printBookings}>
            <FontAwesomeIcon icon={faPrint} />
            طباعة
          </button>
          <button className="btn btn-export" onClick={() => {}}>
            <FontAwesomeIcon icon={faDownload} />
            تصدير
          </button>
          <button className="btn btn-primary" onClick={onCreateBooking}>
            <FontAwesomeIcon icon={faPlus} />
            إضافة حجز جديد
          </button>
        </div>
      </div>
      <div className="trips-filters">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="البحث في الحجوزات..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
        <button
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FontAwesomeIcon icon={faFilter} />
          تصفية
        </button>
      </div>
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>الحالة:</label>
            <select
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <option value="">جميع الحالات</option>
              <option value="Provider Pending">في انتظار المزود</option>
              <option value="Pending Payment">في انتظار الدفع</option>
              <option value="Paid">مدفوع</option>
              <option value="Completed">مكتمل</option>
              <option value="Canceled">ملغي</option>
            </select>
          </div>
          <div className="filter-group">
            <label>معرف الرحلة:</label>
            <input
              type="text"
              value={filters.tripId}
              onChange={e => handleFilterChange('tripId', e.target.value)}
              placeholder="معرف الرحلة"
            />
          </div>
          <div className="filter-group">
            <label>معرف المستخدم:</label>
            <input
              type="text"
              value={filters.userId}
              onChange={e => handleFilterChange('userId', e.target.value)}
              placeholder="معرف المستخدم"
            />
          </div>
          <div className="filter-group">
            <label>معرف المزود:</label>
            <input
              type="text"
              value={filters.providerId}
              onChange={e => handleFilterChange('providerId', e.target.value)}
              placeholder="معرف المزود"
            />
          </div>
          <div className="filter-group">
            <label>من تاريخ:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>إلى تاريخ:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      <div className="trips-table-container">
        <table className="trips-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>المعرف {getSortIcon('id')}</th>
              <th onClick={() => handleSort('tripTitle')}>الرحلة {getSortIcon('tripTitle')}</th>
              <th onClick={() => handleSort('userName')}>المستخدم {getSortIcon('userName')}</th>
              <th onClick={() => handleSort('providerName')}>المزود {getSortIcon('providerName')}</th>
              <th>الحالة</th>
              <th onClick={() => handleSort('totalCost')}>التكلفة {getSortIcon('totalCost')}</th>
              <th onClick={() => handleSort('startTime')}>وقت البدء {getSortIcon('startTime')}</th>
              <th onClick={() => handleSort('endTime')}>وقت الانتهاء {getSortIcon('endTime')}</th>
              <th onClick={() => handleSort('bookingDate')}>تاريخ الحجز {getSortIcon('bookingDate')}</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="loading-row">
                  <div className="loading-spinner"></div>
                  <p>جاري تحميل البيانات...</p>
                </td>
              </tr>
            ) : bookings.length > 0 ? (
              bookings.map(booking => (
                <tr key={booking.id}>
                  <td><span className="booking-id">#{booking.id}</span></td>
                  <td>
                    <div className="trip-info">
                      <span className="trip-title">{booking.tripTitle || '-'}</span>
                      {booking.trip?.cityName && (
                        <span className="trip-location">{booking.trip.cityName}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{booking.userName || '-'}</span>
                      {booking.userPhone && (
                        <span className="user-phone">{booking.userPhone}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="provider-info">
                      <span className="provider-name">{booking.providerName || '-'}</span>
                      {booking.providerPhone && (
                        <span className="provider-phone">{booking.providerPhone}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      value={booking.status}
                      onChange={e => handleStatusChange(booking.id, e.target.value)}
                      className={`status-dropdown status-${booking.status.toLowerCase().replace(' ', '-')}`}
                    >
                      <option value="Provider Pending" className="status-provider-pending">في انتظار المزود</option>
                      <option value="Pending Payment" className="status-pending-payment">في انتظار الدفع</option>
                      <option value="Paid" className="status-paid">مدفوع</option>
                      <option value="Completed" className="status-completed">مكتمل</option>
                      <option value="Canceled" className="status-canceled">ملغي</option>
                    </select>
                  </td>
                  <td>
                    <span className="cost-amount">{booking.totalCost}</span>
                  </td>
                  <td>
                    <div className="time-info">
                      <span className="time-value">{formatTime(booking.startTime)}</span>
                      {booking.startTime && (
                        <span className="date-value">{formatDate(extractDateFromDateTime(booking.startTime))}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="time-info">
                      <span className="time-value">{formatTime(booking.endTime)}</span>
                      {booking.endTime && (
                        <span className="date-value">{formatDate(extractDateFromDateTime(booking.endTime))}</span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(booking.bookingDate)}</td>
                  <td>
                    <div className="categories-action-buttons">
                      <button
                        className="categories-btn-action categories-btn-view"
                        onClick={() => onViewBooking(booking.id)}
                        title="عرض التفاصيل"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="categories-btn-action categories-btn-edit"
                        onClick={() => onEditBooking(booking.id)}
                        title="تعديل"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="categories-btn-action categories-btn-delete"
                        onClick={() => showDeleteConfirmModal(booking.id)}
                        title="حذف"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">
                  <p>لا توجد حجوزات للعرض</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-page"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            السابق
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`btn-page ${page === pagination.currentPage ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="btn-page"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            التالي
          </button>
        </div>
      )}
      <SuccessModal
        message={successModal.message}
        isVisible={successModal.isVisible}
        onClose={closeSuccessModal}
      />
      <DeleteConfirmModal
        isVisible={deleteConfirmModal.isVisible}
        onClose={closeDeleteConfirmModal}
        onConfirm={() => {
          handleDelete(deleteConfirmModal.bookingId);
          closeDeleteConfirmModal();
        }}
        title="تأكيد حذف الحجز"
        message="هل أنت متأكد من أنك تريد حذف الحجز؟"
      />
    </div>
  );
};

export default BookingsList; 