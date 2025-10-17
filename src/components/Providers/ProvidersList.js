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
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomTable from '../common/CustomTable';
import { exportProvidersListCSV, printProvidersListPDF } from '../../utils/exportHelpers';

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === 'null' || imagePath === 'undefined' || imagePath.trim() === '') {
    return `${API_CONFIG.BASE_URL}/assets/images/default-avatar.png`;
  }
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const ProvidersList = ({ onViewProvider, onEditProvider, onCreateProvider }) => {
  const [providers, setProviders] = useState([]);
  console.log('ProvidersList render, providers:', providers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get("page")) || 1,
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
  // const [deleteConfirmModal, setDeleteConfirmModal] = useState({
  //   isVisible: false,
  //   providerId: null,
  //   providerName: ''

  // });
  const [deleteModal, setDeleteModal] = useState({ isVisible: false, providerId: null, providerName: '' });

  const navigate = useNavigate();

  useEffect(() => {
    // const queryParams = new URLSearchParams(window.location.search);
    //in progress
    const page = parseInt(searchParams.get('page')) || 1;
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchProviders();
    fetchCities();
  }, [pagination.currentPage, filters, searchParams]);

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
    // e.preventDefault();
    const value = e.target.value
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setFilters(prev => ({ ...prev, search: value }));
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
    navigate(`/admin/providers?page=${page}`);
    fetchProviders(page);
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

  //PDF
  const printProviders = () => {
    printProvidersListPDF(providers, getStatusText, formatDate, setError);
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

  //CSV
  const exportProviders = async () => {
    exportProvidersListCSV(filters || {}, setError)
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

  const showDeleteConfirmModal = (providerId, providerName) => {
    setDeleteModal({
      isVisible: true,
      providerId: providerId,
      providerName: providerName
    });
  };

  const closeDeleteConfirmModal = () => {
    setDeleteModal({
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

  const columns = [
    {
      key: "fullName",
      label: "الاسم الكامل",
      sortable: true,
      render: (value, provider) => {
        // pick random avatar if profileImage is missing
        const randomAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        const imageSrc = getImageUrl(provider.profileImage) || randomAvatar;

        return (
          <div className="provider-info">
            <img
              src={imageSrc}
              alt={provider.fullName}
              className="provider-avatar"
              onError={(e) => {
                e.target.src = randomAvatar;
              }}
            />
            <span>{provider.fullName}</span>
          </div>
        );
      },
    },
    { key: 'userName', label: 'رقم الهاتف', sortable: true },
    {
      key: 'status',
      label: 'الحالة',
      sortable: true,
      render: (_, p) => (
        <div className="status-toggle">
          <input
            type="checkbox"
            id={`status-${p.id}`}
            className="status-toggle-input"
            checked={p.status === 'Active'}
            onChange={(e) => handleStatusChange(p.id, e.target.checked ? 'Active' : 'Suspended')}
          />
          <label htmlFor={`status-${p.id}`} className="status-toggle-label">
            <span className="status-toggle-slider"></span>
            <span className="status-toggle-text">{p.status === 'Active' ? 'نشط' : 'معلق'}</span>
          </label>
        </div>
      )
    },
    { key: 'cityName', label: 'المدينة' },
    { key: 'tripsCount', label: 'عدد الرحلات' },
    { key: 'bookingsCount', label: 'عدد الحجوزات', sortable: true },
    {
      key: 'totalEarnings',
      label: 'إجمالي الأرباح',
      render: (v) => `${v?.toFixed(2) || '0'} ريال`
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      sortable: true,
      render: (v) => formatDate(v)
    }
  ];

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
          <div className="filters-panels">
            <div className="select-wrap">

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

            </div>

            <div className="city-search-container">
              <div className="city-search-input select-wrap">
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

      {/* <div className="providers-table-container">
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
              <th onClick={() => handleSort('bookingsCount')}>عدد الحجوزات {getSortIcon('bookingsCount')}</th>
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
      )} */}

      {/* {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-page"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            السابق
          </button>

          {(() => {
            let pages = [];
            let total = pagination.totalPages;
            let current = pagination.currentPage;

            if (current > 3) {
              pages.push(1);
              if (current > 4) pages.push("...");
            }

            let start = Math.max(1, current - 2);
            let end = Math.min(total, current + 2);

            for (let i = start; i <= end; i++) {
              if (i !== 1 && i !== total) pages.push(i);
            }

            if (current < total - 2) {
              if (current < total - 3) pages.push("...");
              pages.push(total);
            }

            return pages.map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="dots">...</span>
              ) : (
                <button
                  key={p}
                  className={`btn-page ${p === current ? 'active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              )
            );
          })()}

          <button
            className="btn-page"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            التالي
          </button>
        </div>
      )} */}

      <CustomTable
        columns={columns}
        data={providers}
        loading={loading}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSort={handleSort}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: handlePageChange
        }}
        noDataMessage="لا توجد بيانات مزودين متاحة"
        renderActions={(provider) => (
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
              onClick={() => setDeleteModal({ isVisible: true, providerId: provider.id, providerName: provider.fullName })}
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
        isVisible={deleteModal.isVisible}
        onClose={closeDeleteConfirmModal}
        onConfirm={() => {
          handleDelete(deleteModal.providerId);
          closeDeleteConfirmModal();
        }}
        title="تأكيد حذف المزود"
        message="هل أنت متأكد من أنك تريد حذف المزود"
        itemName={deleteModal.providerName}
      />
    </div>
  );
};

export default ProvidersList; 