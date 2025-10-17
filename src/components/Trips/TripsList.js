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
  faBan,
  faMapMarkerAlt,
  faTag,
  faUsers,
  faCalendarAlt,
  faArrowsAlt,
  faSearch,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import SuccessModal from '../SuccessModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
import './TripsList.css';

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-trip.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const TripsList = ({ onViewTrip, onEditTrip, onCreateTrip }) => {
  const [trips, setTrips] = useState([]);
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
    cityId: '',
    categoryId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [citySearch, setCitySearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isVisible: false,
    message: ''
  });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isVisible: false,
    tripId: null,
    tripName: ''
  });

  // Reorder modal state
  const [reorderModal, setReorderModal] = useState({
    isVisible: false,
    trips: [],
    searchTerm: '',
    loading: false,
    saving: false
  });
  const [draggedTrip, setDraggedTrip] = useState(null);

  useEffect(() => {
    fetchTrips();
    fetchCities();
    fetchCategories();
  }, [pagination.currentPage, filters]);

  // Handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const cityContainer = document.querySelector('.city-search-container');
      const categoryContainer = document.querySelector('.category-search-container');
      
      if (cityContainer && !cityContainer.contains(event.target)) {
        setShowCityDropdown(false);
      }
      if (categoryContainer && !categoryContainer.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      
      // Build query parameters, only include non-empty values
      const queryParams = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      // Only add search parameter if it's not empty
      if (filters.search && filters.search.trim()) {
        queryParams.search = filters.search.trim();
      }

      // Only add cityId if it's not empty
      if (filters.cityId && filters.cityId.trim()) {
        queryParams.cityId = filters.cityId;
      }

      // Only add categoryId if it's not empty
      if (filters.categoryId && filters.categoryId.trim()) {
        queryParams.categoryId = filters.categoryId;
      }

      const params = new URLSearchParams(queryParams);
      
      console.log('Search params:', queryParams); // Debug log
      console.log('URL params:', params.toString()); // Debug log

      const response = await api.get(`/api/admin/trips?${params}`);
      console.log('API response:', response.data); // Debug log
      
      setTrips(response.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
        totalCount: response.data.pagination.totalCount
      }));
    } catch (err) {
      console.error('Error fetching trips:', err);
      console.error('Error response:', err.response?.data); // Log the error response
      setError('فشل في تحميل بيانات الرحلات');
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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

  const handleStatusChange = async (tripId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      
      await api.put(`/api/admin/trips/${tripId}/status`, formData);
      fetchTrips();
      showSuccessMessage('تم تحديث حالة الرحلة بنجاح');
    } catch (err) {
      setError('فشل في تحديث حالة الرحلة');
      console.error('Error updating status:', err);
    }
  };

  const printTrips = () => {
    try {
      const printWindow = window.open('', '_blank');
      const printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>قائمة الرحلات - طلعات</title>
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
            .status-inactive { color: #ef4444; font-weight: bold; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>قائمة الرحلات</h1>
            <p>تطبيق طلعات - ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>العنوان</th>
                <th>المدينة</th>
                <th>الفئة</th>
                <th>الحالة</th>
                <th>عدد الأشخاص</th>
                <th>تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              ${trips.map(trip => `
                <tr>
                  <td>${trip.title}</td>
                  <td>${trip.cityName || 'غير محدد'}</td>
                  <td>${trip.categoryName || 'غير محدد'}</td>
                  <td class="status-${trip.status.toLowerCase()}">${getStatusText(trip.status)}</td>
                  <td>${trip.maxPersons}</td>
                  <td>${formatDate(trip.createdAt)}</td>
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
      console.error('Error printing trips:', err);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'Active': 'نشط',
      'Pending': 'في الانتظار',
      'Inactive': 'غير نشط',
      'Deleted': 'محذوف'
    };
    return statusMap[status] || status;
  };

  const handleDelete = async (tripId) => {
    try {
      await api.delete(`/api/admin/trips/${tripId}`);
      fetchTrips();
      showSuccessMessage('تم حذف الرحلة بنجاح');
    } catch (err) {
      setError('فشل في حذف الرحلة');
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
      'Inactive': { 
        class: 'status-inactive', 
        text: 'غير نشط',
        icon: faTimesCircle
      },
      'Deleted': { 
        class: 'status-deleted', 
        text: 'محذوف',
        icon: faBan
      }
    };
    
    const config = statusConfig[status] || { 
      class: 'status-default', 
      text: status,
      icon: faBan
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

  // Filter cities and categories based on search
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleCitySelect = (cityId, cityName) => {
    handleFilterChange('cityId', cityId);
    setCitySearch(cityName);
    setShowCityDropdown(false);
  };

  const handleCategorySelect = (categoryId, categoryName) => {
    handleFilterChange('categoryId', categoryId);
    setCategorySearch(categoryName);
    setShowCategoryDropdown(false);
  };

  const handleCitySearchChange = (e) => {
    setCitySearch(e.target.value);
    setShowCityDropdown(true);
    if (!e.target.value) {
      handleFilterChange('cityId', '');
    }
  };

  const handleCategorySearchChange = (e) => {
    setCategorySearch(e.target.value);
    setShowCategoryDropdown(true);
    if (!e.target.value) {
      handleFilterChange('categoryId', '');
    }
  };

  const getSelectedCityName = () => {
    const selectedCity = cities.find(city => city.id.toString() === filters.cityId);
    return selectedCity ? selectedCity.name : '';
  };

  const getSelectedCategoryName = () => {
    const selectedCategory = categories.find(category => category.id.toString() === filters.categoryId);
    return selectedCategory ? selectedCategory.name : '';
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

  const showDeleteConfirmModal = (tripId, tripName) => {
    setDeleteConfirmModal({
      isVisible: true,
      tripId: tripId,
      tripName: tripName
    });
  };

  const closeDeleteConfirmModal = () => {
    setDeleteConfirmModal({
      isVisible: false,
      tripId: null,
      tripName: ''
    });
  };

  // Reorder modal functions
  const openReorderModal = async () => {
    try {
      setReorderModal(prev => ({ ...prev, isVisible: true, loading: true }));
      
      // Fetch all trips for reordering (without pagination)
      const response = await api.get('/api/admin/trips?pageSize=1000&sortBy=order&sortOrder=asc');
      
      // Add safety checks for the response
      const tripsData = response?.data?.data || [];
      const validTrips = Array.isArray(tripsData) ? tripsData.filter(trip => trip && trip.id) : [];
      
      setReorderModal(prev => ({
        ...prev,
        trips: validTrips,
        loading: false
      }));
    } catch (err) {
      console.error('Error fetching trips for reorder:', err);
      setReorderModal(prev => ({ 
        ...prev, 
        trips: [],
        loading: false 
      }));
      setError('فشل في تحميل الرحلات لإعادة الترتيب');
    }
  };

  const closeReorderModal = () => {
    setReorderModal({
      isVisible: false,
      trips: [],
      searchTerm: '',
      loading: false,
      saving: false
    });
    setDraggedTrip(null);
  };

  const handleReorderSearch = (e) => {
    setReorderModal(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const getFilteredReorderTrips = () => {
    const { trips, searchTerm } = reorderModal;
    if (!trips || !Array.isArray(trips)) return [];
    if (!searchTerm) return trips;
    
    return trips.filter(trip => {
      if (!trip) return false;
      return (
        (trip.title && trip.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trip.cityName && trip.cityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trip.categoryName && trip.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  };

  // Drag and drop functions
  const handleDragStart = (e, trip) => {
    console.log('Drag start:', trip.id); // Debug log
    setDraggedTrip(trip);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', trip.id.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTrip) => {
    e.preventDefault();
    console.log('Drop on:', targetTrip.id); // Debug log
    
    if (!draggedTrip || draggedTrip.id === targetTrip.id) {
      console.log('Invalid drop - same trip or no dragged trip');
      return;
    }
    
    const { trips } = reorderModal;
    const draggedIndex = trips.findIndex(t => t.id === draggedTrip.id);
    const targetIndex = trips.findIndex(t => t.id === targetTrip.id);
    
    console.log('Dragged index:', draggedIndex, 'Target index:', targetIndex); // Debug log
    
    if (draggedIndex === -1 || targetIndex === -1) {
      console.log('Invalid indices');
      return;
    }
    
    // Create new array with reordered trips
    const newTrips = [...trips];
    const [removed] = newTrips.splice(draggedIndex, 1);
    newTrips.splice(targetIndex, 0, removed);
    
    // Update order numbers
    const updatedTrips = newTrips.map((trip, index) => ({
      ...trip,
      order: index + 1
    }));
    
    console.log('Updated trips:', updatedTrips.map(t => ({ id: t.id, order: t.order }))); // Debug log
    
    setReorderModal(prev => ({ ...prev, trips: updatedTrips }));
    setDraggedTrip(null);
  };

  const handleDragEnd = () => {
    console.log('Drag end'); // Debug log
    setDraggedTrip(null);
  };

  // Function to check if a trip matches search
  const isTripSearchMatch = (trip, searchTerm) => {
    if (!searchTerm || !trip) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (trip.title && trip.title.toLowerCase().includes(searchLower)) ||
      (trip.cityName && trip.cityName.toLowerCase().includes(searchLower)) ||
      (trip.categoryName && trip.categoryName.toLowerCase().includes(searchLower))
    );
  };

  // Get all trips for display (no filtering, just highlighting)
  const getDisplayTrips = () => {
    const { trips, searchTerm } = reorderModal;
    if (!trips || !Array.isArray(trips)) return [];
    return trips;
  };

  const saveNewOrder = async () => {
    try {
      setReorderModal(prev => ({ ...prev, saving: true }));
      
      const { trips } = reorderModal;
      const tripOrders = trips.map((trip, index) => ({
        tripId: trip.id,
        order: index + 1
      }));
      
      await api.put('/api/admin/trips/update-orders', { tripOrders });
      
      showSuccessMessage('تم حفظ الترتيب الجديد بنجاح');
      closeReorderModal();
      fetchTrips(); // Refresh the main list
    } catch (err) {
      console.error('Error saving new order:', err);
      setError('فشل في حفظ الترتيب الجديد');
    } finally {
      setReorderModal(prev => ({ ...prev, saving: false }));
    }
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

  if (loading && trips.length === 0) {
    return (
      <div className="trips-list">
        <div className="trips-header">
          <div className="trips-title">
            <h2>إدارة الرحلات</h2>
            <p>عرض وإدارة جميع الرحلات في النظام</p>
          </div>
          
          <div className="trips-actions">
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
              إضافة رحلة جديدة
            </button>
          </div>
        </div>

        <div className="trips-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="البحث في الرحلات..."
              disabled
            />
          </div>

          <div className="filters-panel">
            <div className="city-search-container">
              <div className="city-search-input">
                <input
                  type="text"
                  placeholder="البحث في المدن..."
                  disabled
                />
              </div>
            </div>

            <div className="category-search-container">
              <div className="category-search-input">
                <input
                  type="text"
                  placeholder="البحث في الفئات..."
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        <div className="trips-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">جاري تحميل بيانات الرحلات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="trips-list">
      <div className="trips-header">
        <div className="trips-title">
          <h2>إدارة الرحلات</h2>
          <p>عرض وإدارة جميع الرحلات في النظام</p>
        </div>
        
        <div className="trips-actions">
          <button className="btn btn-reorder" onClick={openReorderModal}>
            <FontAwesomeIcon icon={faArrowsAlt} />
            إعادة ترتيب
          </button>
          <button className="btn btn-print" onClick={printTrips}>
            <FontAwesomeIcon icon={faPrint} />
            طباعة
          </button>
          <button className="btn btn-export" onClick={() => {}}>
            <FontAwesomeIcon icon={faDownload} />
            تصدير
          </button>
          <button className="btn btn-primary" onClick={onCreateTrip}>
            <FontAwesomeIcon icon={faPlus} />
            إضافة رحلة جديدة
          </button>
        </div>
      </div>

      <div className="trips-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="البحث في الرحلات..."
            value={filters.search}
            onChange={handleSearchInput}
          />
          {filters.search && (
            <button 
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setFilters(prev => ({ ...prev, search: '' }));
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              title="مسح البحث"
            >
              ×
            </button>
          )}
          {loading && filters.search && (
            <div className="search-loading">
              <div className="loading-spinner-small"></div>
            </div>
          )}
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

        <div className="filter-group">
          <div className="category-search-container">
            <div className="category-search-input">
              <input
                type="text"
                placeholder="البحث في الفئات..."
                value={categorySearch}
                onChange={handleCategorySearchChange}
                onFocus={() => setShowCategoryDropdown(true)}
              />
              <button 
                type="button"
                className="category-clear-btn"
                onClick={() => {
                  setCategorySearch('');
                  handleFilterChange('categoryId', '');
                  setShowCategoryDropdown(false);
                }}
                style={{ display: categorySearch ? 'block' : 'none' }}
              >
                ×
              </button>
            </div>
            
            {showCategoryDropdown && (
              <div className="category-dropdown">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map(category => (
                    <div
                      key={category.id}
                      className={`category-option ${filters.categoryId === category.id.toString() ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(category.id.toString(), category.name)}
                    >
                      {category.name}
                    </div>
                  ))
                ) : (
                  <div className="category-no-results">لا توجد نتائج</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="trips-table-container">
        <table className="trips-table">
          <thead>
            <tr>
              <th>المعرف</th>
              <th>الصورة</th>
              <th>العنوان</th>
              <th>المدينة</th>
              <th>الفئة</th>
              <th>الحالة</th>
              <th>عدد الأشخاص</th>
              <th>تاريخ الإنشاء</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => (
              <tr key={trip.id}>
                <td><span className="trip-id">#{trip.id}</span></td>
                <td>
                  <div className="trip-image-cell">
                    {trip.images && trip.images.split(',')[0] ? (
                      <img
                        src={getImageUrl(trip.images.split(',')[0])}
                        alt={trip.title}
                        className="trip-table-avatar"
                        onError={(e) => {
                          if (e.target) {
                            e.target.style.display = 'none';
                          }
                          if (e.target && e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    {(!trip.images || !trip.images.split(',')[0]) && (
                      <div className="trip-table-avatar-placeholder">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                      </div>
                    )}
                  </div>
                </td>
                <td>{trip.title ? trip.title.substring(0, 10) : ''}</td>
                <td>{trip.cityName || 'غير محدد'}</td>
                <td>{trip.categoryName || 'غير محدد'}</td>
                <td>
                  <div className="status-toggle">
                    <input
                      type="checkbox"
                      id={`status-${trip.id}`}
                      className="status-toggle-input"
                      checked={trip.status === 'Active'}
                      onChange={e => handleStatusChange(trip.id, e.target.checked ? 'Active' : 'Inactive')}
                    />
                    <label htmlFor={`status-${trip.id}`} className="status-toggle-label">
                      <span className="status-toggle-slider"></span>
                      <span className="status-toggle-text">{trip.status === 'Active' ? 'نشط' : 'غير نشط'}</span>
                    </label>
                  </div>
                </td>
                <td>{trip.maxPersons}</td>
                <td>{formatDate(trip.createdAt)}</td>
                <td>
                  <div className="categories-action-buttons">
                    <button className="categories-btn-action categories-btn-view" onClick={() => onViewTrip(trip.id)} title="عرض التفاصيل">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="categories-btn-action categories-btn-edit" onClick={() => onEditTrip(trip.id)} title="تعديل">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="categories-btn-action categories-btn-delete" onClick={() => showDeleteConfirmModal(trip.id, trip.title)} title="حذف">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trips.length === 0 && !loading && (
          <div className="no-data">
            <p>لا توجد رحلات للعرض</p>
          </div>
        )}
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
          
          {getPaginationRange().map((item, index) => (
            <React.Fragment key={index}>
              {item === '...' ? (
                <span className="pagination-ellipsis">...</span>
              ) : (
                <button
                  key={item}
                  className={`btn-page ${item === pagination.currentPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(item)}
                >
                  {item}
                </button>
              )}
            </React.Fragment>
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
          handleDelete(deleteConfirmModal.tripId);
          closeDeleteConfirmModal();
        }}
        title="تأكيد حذف الرحلة"
        message="هل أنت متأكد من أنك تريد حذف الرحلة"
        itemName={deleteConfirmModal.tripName}
      />

      {/* Reorder Modal */}
      {reorderModal.isVisible && (
        <div className="reorder-modal-overlay">
          <div className="reorder-modal">
            <div className="reorder-modal-header">
              <h3>إعادة ترتيب الرحلات</h3>
              <button className="reorder-modal-close" onClick={closeReorderModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="reorder-modal-search">
              <div className="reorder-search-input">
                <FontAwesomeIcon icon={faSearch} className="reorder-search-icon" />
                <input
                  type="text"
                  placeholder="البحث في الرحلات..."
                  value={reorderModal.searchTerm}
                  onChange={handleReorderSearch}
                />
                {reorderModal.searchTerm && (
                  <button 
                    type="button"
                    className="reorder-search-clear"
                    onClick={() => setReorderModal(prev => ({ ...prev, searchTerm: '' }))}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="reorder-modal-content">
              {reorderModal.loading ? (
                <div className="reorder-loading">
                  <div className="loading-spinner"></div>
                  <p>جاري تحميل الرحلات...</p>
                </div>
              ) : (
                <div className="reorder-grid">
                  {getDisplayTrips().map((trip, index) => {
                    const isSearchMatch = isTripSearchMatch(trip, reorderModal.searchTerm);
                    const searchClass = reorderModal.searchTerm 
                      ? (isSearchMatch ? 'search-match' : 'search-no-match')
                      : '';
                    
                    return (
                      <div
                        key={trip.id}
                        className={`reorder-trip-card ${draggedTrip?.id === trip.id ? 'dragging' : ''} ${searchClass}`}
                        draggable={true}
                        onDragStart={(e) => {
                          console.log('Drag start event fired for trip:', trip.id);
                          handleDragStart(e, trip);
                        }}
                        onDragOver={(e) => {
                          console.log('Drag over event fired for trip:', trip.id);
                          handleDragOver(e);
                        }}
                        onDrop={(e) => {
                          console.log('Drop event fired for trip:', trip.id);
                          handleDrop(e, trip);
                        }}
                        onDragEnd={(e) => {
                          console.log('Drag end event fired');
                          handleDragEnd();
                        }}
                        style={{ cursor: 'grab' }}
                      >
                        <div className="reorder-trip-order">#{index + 1}</div>
                        <div className="reorder-trip-image">
                          {trip.images && trip.images.split(',')[0] ? (
                            <img
                              src={getImageUrl(trip.images.split(',')[0])}
                              alt={trip.title}
                              onError={(e) => {
                                if (e.target) {
                                  e.target.style.display = 'none';
                                }
                                if (e.target && e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          {(!trip.images || !trip.images.split(',')[0]) && (
                            <div className="reorder-trip-placeholder">
                              <FontAwesomeIcon icon={faMapMarkerAlt} />
                            </div>
                          )}
                        </div>
                        <div className="reorder-trip-info">
                          <h4>{trip.title}</h4>
                          <p>
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            {trip.cityName || 'غير محدد'}
                          </p>
                          <p>
                            <FontAwesomeIcon icon={faTag} />
                            {trip.categoryName || 'غير محدد'}
                          </p>
                          <div className="reorder-trip-status">
                            {getStatusBadge(trip.status)}
                          </div>
                        </div>
                        <div className="reorder-trip-drag-handle">
                          <FontAwesomeIcon icon={faArrowsAlt} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {getDisplayTrips().length === 0 && !reorderModal.loading && (
                <div className="reorder-no-results">
                  <p>لا توجد رحلات للعرض</p>
                </div>
              )}
            </div>
            
            <div className="reorder-modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={closeReorderModal}
                disabled={reorderModal.saving}
              >
                إلغاء
              </button>
              <button 
                className="btn btn-primary" 
                onClick={saveNewOrder}
                disabled={reorderModal.saving || reorderModal.loading}
              >
                {reorderModal.saving ? 'جاري الحفظ...' : 'حفظ الترتيب'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsList; 