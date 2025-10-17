import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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
  faUserSlash,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import SuccessModal from '../SuccessModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
import './CustomersList.css';
import CustomTable from '../common/CustomTable';
import { exportCustomersListCSV, printCustomersListPDF } from '../../utils/exportHelpers';

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}/${imagePath}`;
};

const CustomersList = ({ onViewCustomer, onEditCustomer, onCreateCustomer }) => {
  const [customers, setCustomers] = useState([]);
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
    cityId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isVisible: false,
    message: ''
  });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isVisible: false,
    customerId: null,
    customerName: ''
  });

  useEffect(() => {
    fetchCustomers();
    fetchCities();
  }, [pagination.currentPage, filters]);

  // Handle clicking outside city dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const cityContainer = document.querySelector('.city-search-container');
      if (cityContainer && !cityContainer.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        role: 'customer'
      });

      // Handle status filter - if NotActive, we need to exclude Active status
      if (filters.status === 'NotActive') {
        // Add all non-active statuses to the filter
        params.append('excludeStatus', 'Active');
      } else if (filters.status) {
        params.append('status', filters.status);
      }

      // Add other filters
      if (filters.search) params.append('search', filters.search);
      if (filters.cityId) params.append('cityId', filters.cityId);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await api.get(`/api/admin/users?${params}`);
      setCustomers(response.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
        totalCount: response.data.pagination.totalCount
      }));
    } catch (err) {
      setError('فشل في تحميل بيانات العملاء');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await api.get('/api/cities');
      setCities(response.data);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
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

  const handleStatusChange = async (customerId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);

      console.log('Sending status update:', { customerId, status: newStatus });

      await api.put(`/api/admin/users/${customerId}/status`, formData);
      fetchCustomers();
      showSuccessMessage('تم تحديث حالة العميل بنجاح');
    } catch (err) {
      setError('فشل في تحديث حالة العميل');
      console.error('Error updating status:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  //PDF
  const printCustomers = () => {
    printCustomersListPDF(customers, getStatusText, formatDate, setError);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'Active': 'نشط',
      'Pending': 'في الانتظار',
      'Suspended': 'معلق',
      'Deleted': 'محذوف'
    };
    return statusMap[status] || status;
  };

  const handleDelete = async (customerId) => {
    try {
      await api.delete(`/api/admin/users/${customerId}`);
      fetchCustomers();
      showSuccessMessage('تم حذف العميل بنجاح');
    } catch (err) {


      const validationError = err.response?.data?.message
      const message = validationError || 'فشل في حذف العميل';

      setError(message);
      setTimeout(() => {
        setError(null)
      }, 4500)
    }
  };

  //CSV
  const exportCustomers = async () => {
    exportCustomersListCSV(filters || {}, setError)
  }

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
      'Suspended': {
        class: 'status-suspended',
        text: 'معلق',
        icon: faTimesCircle
      },
      'Deleted': {
        class: 'status-deleted',
        text: 'محذوف',
        icon: faUserSlash
      }
    };

    const config = statusConfig[status] || {
      class: 'status-default',
      text: status,
      icon: faUserSlash
    };

    return (
      <span className={`status-badge ${config.class}`}>
        <FontAwesomeIcon icon={config.icon} />
        {config.text}
      </span>
    );
  };

  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return <FontAwesomeIcon icon={faSort} />;
    return filters.sortOrder === 'asc' ?
      <FontAwesomeIcon icon={faSortUp} /> :
      <FontAwesomeIcon icon={faSortDown} />;
  };

  // Filter cities based on search
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCitySelect = (cityId, cityName) => {
    handleFilterChange('cityId', cityId);
    setCitySearch(cityName);
    setShowCityDropdown(false);
  };

  const handleCitySearchChange = (e) => {
    setCitySearch(e.target.value);
    setShowCityDropdown(true);
    if (!e.target.value) {
      handleFilterChange('cityId', '');
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessModal({
      isVisible: true,
      message: message
    });
  };

  const closeSuccessModal = () => {
    setSuccessModal({
      isVisible: false,
      message: ''
    });
  };

  const showDeleteConfirmModal = (customerId, customerName) => {
    setDeleteConfirmModal({
      isVisible: true,
      customerId: customerId,
      customerName: customerName
    });
  };

  const closeDeleteConfirmModal = () => {
    setDeleteConfirmModal({
      isVisible: false,
      customerId: null,
      customerName: ''
    });
  };

  // Helper to generate condensed pagination
  const getPaginationRange = () => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const delta = 2; // how many pages to show around current
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  if (loading && customers.length === 0) {
    return (
      <div className="customers-list-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">جاري تحميل قائمة العملاء...</div>
      </div>
    );
  }


  const columns = [

    {
      key: "fullName",
      label: "الاسم الكامل",
      sortable: true,
      render: (value, customer) => {
        // pick random avatar if profileImage is missing
        const randomAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        const imageSrc = getImageUrl(customer.profileImage) || randomAvatar;

        return (
          <div className="provider-info">
            <img
              src={imageSrc}
              alt={customer.fullName}
              className="provider-avatar"
              onError={(e) => {
                e.target.src = randomAvatar;
              }}
            />
            <span>{customer.fullName}</span>
          </div>
        );
      },
    },

    { key: 'userName', label: 'رقم الهاتف', sortable: true },
    { key: 'email', label: 'البريد الإلكتروني', sortable: true },
    {
      key: 'status',
      label: 'الحالة',
      sortable: true,
      render: (v, c) => (
        <div className="status-toggle">
          <input
            type="checkbox"
            id={`status-${c.id}`}
            className="status-toggle-input"
            checked={c.status === 'Active'}
            onChange={(e) =>
              handleStatusChange(c.id, e.target.checked ? 'Active' : 'Suspended')
            }
          />
          <label htmlFor={`status-${c.id}`} className="status-toggle-label">
            <span className="status-toggle-slider"></span>
            <span className="status-toggle-text">
              {c.status === 'Active' ? 'نشط' : 'معلق'}
            </span>
          </label>
        </div>
      )
    },
    { key: 'cityName', label: 'المدينة' },
    { key: 'bookingsCount', label: 'عدد الحجوزات', sortable: true },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      sortable: true,
      render: (v) => formatDate(v)
    }
  ];

  return (
    <div className="customers-list">
      <div className="customers-header">
        <div className="customers-title">
          <h2>إدارة العملاء</h2>
          <p>عرض وإدارة جميع العملاء في النظام</p>
        </div>

        <div className="customers-actions">
          <button className="btn btn-print" onClick={printCustomers}>
            <FontAwesomeIcon icon={faPrint} />
            طباعة
          </button>
          <button className="btn btn-export" onClick={exportCustomers}>
            <FontAwesomeIcon icon={faDownload} />
            تصدير
          </button>
          <button className="btn btn-primary" onClick={onCreateCustomer}>
            <FontAwesomeIcon icon={faPlus} />
            إضافة عميل جديد
          </button>
        </div>
      </div>

      <div className="customers-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="البحث في العملاء..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>

        <div className="filter-group">
          <div className="select-wrap">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">جميع الحالات</option>
              <option value="Active">نشط</option>
              <option value="NotActive">غير نشط</option>
            </select>
          </div>

        </div>

        <div className="filter-group">
          <div className="city-search-container">
            <div className="select-wrap">

              <div className="city-search-input">
                <input
                  type="text"
                  placeholder="البحث في المدن..."
                  value={citySearch}
                  onChange={handleCitySearchChange}
                  onFocus={() => setShowCityDropdown(true)}
                />
                <button
                  type="button"
                  className="city-clear-btn"
                  onClick={() => {
                    setCitySearch('');
                    handleFilterChange('cityId', '');
                    setShowCityDropdown(false);
                  }}
                  style={{ display: citySearch ? 'block' : 'none' }}
                >
                  ×
                </button>
              </div>
            </div>

            {showCityDropdown && (
              <div className="city-dropdown">
                {filteredCities.length > 0 ? (
                  filteredCities.map(city => (
                    <div
                      key={city.id}
                      className={`city-option ${filters.cityId === city.id.toString() ? 'selected' : ''}`}
                      onClick={() => handleCitySelect(city.id.toString(), city.name)}
                    >
                      {city.name}
                    </div>
                  ))
                ) : (
                  <div className="city-no-results">لا توجد نتائج</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <CustomTable
        columns={columns}
        data={customers}
        loading={loading}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSort={handleSort}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: handlePageChange
        }}
        noDataMessage="لا توجد بيانات لعرضها"
        renderActions={(customer) => (
          <div className="categories-action-buttons">
            <button
              className="categories-btn-action categories-btn-view"
              onClick={() => onViewCustomer(customer.id)}
              title="عرض التفاصيل"
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button
              className="categories-btn-action categories-btn-edit"
              onClick={() => onEditCustomer(customer.id)}
              title="تعديل"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="categories-btn-action categories-btn-delete"
              onClick={() =>
                showDeleteConfirmModal(customer.id, customer.fullName)
              }
              title="حذف"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      />

      <SuccessModal
        message={successModal.message}
        isVisible={successModal.isVisible}
        onClose={closeSuccessModal}
      />

      <DeleteConfirmModal
        isVisible={deleteConfirmModal.isVisible}
        onClose={closeDeleteConfirmModal}
        onConfirm={() => {
          handleDelete(deleteConfirmModal.customerId);
          closeDeleteConfirmModal();
        }}
        title="تأكيد حذف العميل"
        message="هل أنت متأكد من أنك تريد حذف العميل"
        itemName={deleteConfirmModal.customerName}
      />
    </div>
  );
};

export default CustomersList; 