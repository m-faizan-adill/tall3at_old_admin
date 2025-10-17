import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
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

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
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

  const printCustomers = () => {
    try {
      // Create a print-friendly version of the customers table
      const printWindow = window.open('', '_blank');
      const printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>قائمة العملاء - طلعات</title>
          <style>
            body { 
              font-family: 'Cairo', 'Tajawal', 'Noto Kufi Arabic', Arial, sans-serif; 
              margin: 20px; 
              direction: rtl;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #1fc1de; 
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #1fc1de; 
              margin: 0; 
              font-size: 24px;
            }
            .header p { 
              color: #666; 
              margin: 5px 0 0 0; 
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: right;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
              color: #1fc1de;
            }
            .status-active { color: #10b981; font-weight: bold; }
            .status-pending { color: #f59e0b; font-weight: bold; }
            .status-suspended { color: #ef4444; font-weight: bold; }
            .status-deleted { color: #6b7280; font-weight: bold; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>قائمة العملاء</h1>
            <p>تطبيق طلعات - ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>الاسم الكامل</th>
                <th>رقم الهاتف</th>
                <th>البريد الإلكتروني</th>
                <th>الحالة</th>
                <th>المدينة</th>
                <th>عدد الحجوزات</th>
                <th>إجمالي الإنفاق</th>
                <th>تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(customer => `
                <tr>
                  <td>${customer.fullName}</td>
                  <td>${customer.userName}</td>
                  <td>${customer.email}</td>
                  <td class="status-${customer.status.toLowerCase()}">${getStatusText(customer.status)}</td>
                  <td>${customer.cityName || 'غير محدد'}</td>
                  <td>${customer.bookingsCount}</td>
                  <td>${customer.totalSpent?.toFixed(2) || '0'} ريال</td>
                  <td>${formatDate(customer.createdAt)}</td>
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
      console.error('Error printing customers:', err);
    }
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
      setError('فشل في حذف العميل');
    }
  };

  const exportCustomers = async () => {
    try {
      const params = new URLSearchParams({
        role: 'customer',
        status: filters.status,
        cityId: filters.cityId,
        format: 'csv'
      });
      
      const response = await api.get(`/api/admin/users/export?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customers.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('فشل في تصدير البيانات');
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

  const getSelectedCityName = () => {
    const selectedCity = cities.find(city => city.id.toString() === filters.cityId);
    return selectedCity ? selectedCity.name : '';
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
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">جميع الحالات</option>
            <option value="Active">نشط</option>
            <option value="NotActive">غير نشط</option>
          </select>
        </div>

        <div className="filter-group">
          <div className="city-search-container">
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

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('fullName')}>
                الاسم الكامل {getSortIcon('fullName')}
              </th>
              <th onClick={() => handleSort('userName')}>
                رقم الهاتف {getSortIcon('userName')}
              </th>
              <th onClick={() => handleSort('email')}>
                البريد الإلكتروني {getSortIcon('email')}
              </th>
              <th onClick={() => handleSort('status')}>
                الحالة {getSortIcon('status')}
              </th>
              <th>المدينة</th>
              <th>عدد الحجوزات</th>
              <th>إجمالي الإنفاق</th>
              <th onClick={() => handleSort('createdAt')}>
                تاريخ الإنشاء {getSortIcon('createdAt')}
              </th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div className="customer-info">
                    {getImageUrl(customer.profileImage) ? (
                      <img 
                        src={getImageUrl(customer.profileImage)} 
                        alt={customer.fullName}
                        className="customer-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {(!getImageUrl(customer.profileImage) || !customer.profileImage) && (
                      <div className="customer-avatar-placeholder">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                    <span>{customer.fullName}</span>
                  </div>
                </td>
                <td>{customer.userName}</td>
                <td>{customer.email}</td>
                <td>
                  <div className="status-toggle">
                    <input
                      type="checkbox"
                      id={`status-${customer.id}`}
                      className="status-toggle-input"
                      checked={customer.status === 'Active'}
                      onChange={(e) => {
                        const newStatus = e.target.checked ? 'Active' : 'Suspended';
                        handleStatusChange(customer.id, newStatus);
                      }}
                    />
                    <label htmlFor={`status-${customer.id}`} className="status-toggle-label">
                      <span className="status-toggle-slider"></span>
                      <span className="status-toggle-text">
                        {customer.status === 'Active' ? 'نشط' : 'معلق'}
                      </span>
                    </label>
                  </div>
                </td>
                <td>{customer.cityName}</td>
                <td>{customer.bookingsCount}</td>
                <td>{customer.totalSpent?.toFixed(2) || '0'} ريال</td>
                <td>{formatDate(customer.createdAt)}</td>
                <td>
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
                      onClick={() => showDeleteConfirmModal(customer.id, customer.fullName)}
                      title="حذف"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {customers.length === 0 && !loading && (
        <div className="no-data">
          <p>لا توجد عملاء للعرض</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn-page"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            السابق
          </button>
          {
            getPaginationRange().map((page, idx) =>
              page === '...'
                ? <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>
                : <button
                    key={page}
                    className={`btn-page ${page === pagination.currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
            )
          }
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