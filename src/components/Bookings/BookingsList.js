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
  faBan,

} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import SuccessModal from '../SuccessModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
import './BookingsList.css';
import CustomTable from '../common/CustomTable';
import { exportBookingsListCSV, printBookingsListPDF } from '../../utils/exportHelpers';

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
    filterType: '', // 🆕 upcoming / blank

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

  //CSV
  const exportBookings = async () => {
    await exportBookingsListCSV(setError)
  }

  //Print PDF
  const printBookings = () => {
    printBookingsListPDF(bookings, statusMap, formatDate, setError);
  }

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
      const validationError = err.response?.data?.message
      const message = validationError || 'فشل في حذف الحجز';
      setError(message);
      setTimeout(() => {
        setError(null)
      }, 4500)
    }
  };

  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return <FontAwesomeIcon icon={faSort} />;
    return filters.sortOrder === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />;
  };

  const columns = [
    { key: 'id', label: 'المعرف', sortable: true, render: (value) => <span className="booking-id">#{value}</span> },
    { key: 'tripTitle', label: 'الرحلة', sortable: true },
    { key: 'userName', label: 'المستخدم', sortable: true },
    { key: 'providerName', label: 'المزود', sortable: true },
    {
      key: 'status',
      label: 'الحالة',
      render: (value, row) => (
        <select
          value={row.status}
          onChange={e => handleStatusChange(row.id, e.target.value)}
          className={`status-dropdown status-${row.status.toLowerCase().replace(' ', '-')}`}
        >

          <option value="Provider Pending" className="status-provider-pending">في انتظار المزود</option>
          <option value="Pending Payment" className="status-pending-payment">في انتظار الدفع</option>
          <option value="Paid" className="status-paid">مدفوع</option>
          <option value="Completed" className="status-completed">مكتمل</option>
          <option value="Canceled" className="status-canceled">ملغي</option>
        </select>
      )
    }, { key: 'totalCost', label: 'التكلفة', sortable: true },
    { key: 'startTime', label: 'وقت البدء', sortable: true, render: (v) => formatTime(v) },
    { key: 'endTime', label: 'وقت الانتهاء', sortable: true, render: (v) => formatTime(v) },
    { key: 'bookingDate', label: 'تاريخ الحجز', sortable: true, render: (v) => formatDate(v) },
  ];

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
          <button className="btn btn-export" onClick={exportBookings}>
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
        <div className="categories-search-box">
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

        <button
          className={`btn ${filters.filterType === 'upcoming' ? 'btn-secondary' : 'btn-light'}`}
          onClick={() => {
            setPagination(prev => ({ ...prev, currentPage: 1 }));
            setFilters(prev => ({
              ...prev,
              filterType: prev.filterType === 'upcoming' ? '' : 'upcoming' // toggle
            }));
          }}
        >
          <FontAwesomeIcon icon={faClock} />
          الحجوزات القادمة
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

      <CustomTable
        columns={columns}
        data={bookings}
        loading={loading}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSort={handleSort}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: handlePageChange
        }}
        renderActions={(row) => (
          <div className="categories-action-buttons">
            <button
              className="categories-btn-action categories-btn-view"
              onClick={() => onViewBooking(row.id)}
              title="عرض التفاصيل"
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button
              className="categories-btn-action categories-btn-edit"
              onClick={() => onEditBooking(row.id)}
              title="تعديل"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="categories-btn-action categories-btn-delete"
              onClick={() => showDeleteConfirmModal(row.id)}
              title="حذف"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      />
      {/* custom table component ended */}

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