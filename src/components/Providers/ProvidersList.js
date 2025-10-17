import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
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
  faUserSlash
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import SuccessModal from '../SuccessModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
import './ProvidersList.css';

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === 'null' || imagePath === 'undefined' || imagePath.trim() === '') {
    return '/assets/images/default-avatar.png';
  }
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const ProvidersList = ({ onViewProvider, onEditProvider, onCreateProvider }) => {
  const [providers, setProviders] = useState([]);
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
  const [showFilters, setShowFilters] = useState(false);
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isVisible: false,
    message: ''
  });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isVisible: false,
    providerId: null,
    providerName: ''
  });

  useEffect(() => {
    fetchProviders();
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

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...filters
      });

      const response = await api.get(`/api/admin/providers?${params}`);
      setProviders(response.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
        totalCount: response.data.pagination.totalCount
      }));
    } catch (err) {
      setError('فشل في تحميل بيانات المزودين');
      console.error('Error fetching providers:', err);
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

  const handleStatusChange = async (providerId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      
      console.log('Sending status update:', { providerId, status: newStatus });
      
      await api.put(`/api/admin/providers/${providerId}/status`, formData);
      fetchProviders();
      showSuccessMessage('تم تحديث حالة المزود بنجاح');
    } catch (err) {
      setError('فشل في تحديث حالة المزود');
      console.error('Error updating status:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  const printProviders = () => {
    try {
      // Create a print-friendly version of the providers table
      const printWindow = window.open('', '_blank');
      const printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>قائمة المزودين - طلعات</title>
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
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              color: #666; 
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>قائمة المزودين</h1>
            <p>نظام إدارة طلعات - ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>الاسم الكامل</th>
                <th>رقم الهاتف</th>
                <th>الحالة</th>
                <th>المدينة</th>
                <th>عدد الرحلات</th>
                <th>عدد الحجوزات</th>
                <th>إجمالي الأرباح</th>
                <th>تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              ${providers.map(provider => `
                <tr>
                  <td>${provider.fullName}</td>
                  <td>${provider.userName}</td>
                  <td class="status-${provider.status.toLowerCase()}">${getStatusText(provider.status)}</td>
                  <td>${provider.cityName}</td>
                  <td>${provider.tripsCount}</td>
                  <td>${provider.bookingsCount}</td>
                  <td>${provider.totalEarnings?.toFixed(2) || '0'} ريال</td>
                  <td>${formatDate(provider.createdAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>تم الطباعة في: ${new Date().toLocaleString('ar-SA')}</p>
            <p>إجمالي المزودين: ${providers.length}</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
      };
    } catch (err) {
      setError('فشل في طباعة البيانات');
      console.error('Error printing providers:', err);
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

  const handleDelete = async (providerId) => {
    try {
      await api.delete(`/api/admin/providers/${providerId}`);
      fetchProviders();
      showSuccessMessage('تم حذف المزود بنجاح');
    } catch (err) {
      setError('فشل في حذف المزود');
    }
  };

  const exportProviders = async () => {
    try {
      const params = new URLSearchParams({
        status: filters.status,
        cityId: filters.cityId,
        format: 'csv'
      });
      
      const response = await api.get(`/api/admin/providers/export?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'providers.csv');
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

  const showDeleteConfirmModal = (providerId, providerName) => {
    setDeleteConfirmModal({
      isVisible: true,
      providerId: providerId,
      providerName: providerName
    });
  };

  const closeDeleteConfirmModal = () => {
    setDeleteConfirmModal({
      isVisible: false,
      providerId: null,
      providerName: ''
    });
  };

  if (loading && providers.length === 0) {
    return (
      <div className="providers-list">
        <div className="providers-header">
          <div className="providers-title">
            <h2>إدارة المزودين</h2>
            <p>عرض وإدارة جميع مزودي الخدمات في النظام</p>
          </div>
          
          <div className="providers-actions">
            <button className="btn btn-print" disabled>
              <FontAwesomeIcon icon={faPrint} />
              طباعة
            </button>
            <button className="btn btn-export" disabled>
              <FontAwesomeIcon icon={faDownload} />
              تصدير
            </button>
            <button className="btn btn-primary" disabled>
              <FontAwesomeIcon icon={faPlus} />
              إضافة مزود جديد
            </button>
          </div>
        </div>

        <div className="providers-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="البحث في المزودين..."
              disabled
            />
          </div>

          <button className="filter-toggle" disabled>
            <FontAwesomeIcon icon={faFilter} />
            تصفية
          </button>
        </div>

        <div className="providers-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">جاري تحميل بيانات المزودين...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="providers-list">
      <div className="providers-header">
        <div className="providers-title">
          <h2>إدارة المزودين</h2>
          <p>عرض وإدارة جميع مزودي الخدمات في النظام</p>
        </div>
        
        <div className="providers-actions">
          <button className="btn btn-print" onClick={printProviders}>
            <FontAwesomeIcon icon={faPrint} />
            طباعة
          </button>
          <button className="btn btn-export" onClick={exportProviders}>
            <FontAwesomeIcon icon={faDownload} />
            تصدير
          </button>
          <button className="btn btn-primary" onClick={onCreateProvider}>
            <FontAwesomeIcon icon={faPlus} />
            إضافة مزود جديد
          </button>
        </div>
      </div>

      <div className="providers-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="البحث في المزودين..."
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

        {showFilters && (
          <div className="filters-panel">
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">جميع الحالات</option>
              <option value="Active">نشط</option>
              <option value="Pending">في الانتظار</option>
              <option value="Suspended">معلق</option>
              <option value="Deleted">محذوف</option>
            </select>

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
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="providers-table-container">
        <table className="providers-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('fullName')}>
                الاسم الكامل {getSortIcon('fullName')}
              </th>
              <th onClick={() => handleSort('userName')}>
                رقم الهاتف {getSortIcon('userName')}
              </th>
              <th onClick={() => handleSort('status')}>
                الحالة {getSortIcon('status')}
              </th>
              <th>المدينة</th>
              <th>عدد الرحلات</th>
              <th>عدد الحجوزات</th>
              <th>إجمالي الأرباح</th>
              <th onClick={() => handleSort('createdAt')}>
                تاريخ الإنشاء {getSortIcon('createdAt')}
              </th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(provider => (
              <tr key={provider.id}>
                <td>
                  <div className="provider-info">
                    {provider.profileImage && provider.profileImage !== 'null' && provider.profileImage !== 'undefined' && provider.profileImage.trim() !== '' ? (
                      <img 
                        src={getImageUrl(provider.profileImage)} 
                        alt={provider.fullName}
                        className="provider-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`provider-avatar-icon ${!provider.profileImage || provider.profileImage === 'null' || provider.profileImage === 'undefined' || provider.profileImage.trim() === '' ? 'visible' : 'hidden'}`}>
                      <FontAwesomeIcon icon={faUserSlash} />
                    </div>
                    <span>{provider.fullName}</span>
                  </div>
                </td>
                <td>{provider.userName}</td>
                <td>
                  <div className="status-toggle">
                    <input
                      type="checkbox"
                      id={`status-${provider.id}`}
                      className="status-toggle-input"
                      checked={provider.status === 'Active'}
                      onChange={(e) => {
                        const newStatus = e.target.checked ? 'Active' : 'Suspended';
                        handleStatusChange(provider.id, newStatus);
                      }}
                    />
                    <label htmlFor={`status-${provider.id}`} className="status-toggle-label">
                      <span className="status-toggle-slider"></span>
                      <span className="status-toggle-text">
                        {provider.status === 'Active' ? 'نشط' : 'معلق'}
                      </span>
                    </label>
                  </div>
                </td>
                <td>{provider.cityName}</td>
                <td>{provider.tripsCount}</td>
                <td>{provider.bookingsCount}</td>
                <td>{provider.totalEarnings?.toFixed(2) || '0'} ريال</td>
                <td>{formatDate(provider.createdAt)}</td>
                <td>
                  <div className="categories-action-buttons">
                    <button 
                      className="categories-btn-action categories-btn-view"
                      onClick={() => onViewProvider(provider.id)}
                      title="عرض التفاصيل"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button 
                      className="categories-btn-action categories-btn-edit"
                      onClick={() => onEditProvider(provider.id)}
                      title="تعديل"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="categories-btn-action categories-btn-delete"
                      onClick={() => showDeleteConfirmModal(provider.id, provider.fullName)}
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

      {providers.length === 0 && !loading && (
        <div className="no-data">
          <p>لا توجد مزودين للعرض</p>
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
          handleDelete(deleteConfirmModal.providerId);
          closeDeleteConfirmModal();
        }}
        title="تأكيد حذف المزود"
        message="هل أنت متأكد من أنك تريد حذف المزود"
        itemName={deleteConfirmModal.providerName}
      />
    </div>
  );
};

export default ProvidersList; 