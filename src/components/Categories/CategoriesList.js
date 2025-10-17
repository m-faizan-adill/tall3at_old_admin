import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faDownload,
  faPrint,
  faSort,
  faSortUp,
  faSortDown,

} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import ShimmerLoading from '../ShimmerLoading';
import SuccessModal from '../SuccessModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
import './CategoriesList.css';
import CustomTable from '../common/CustomTable';
import { exportCategoriesListCSV, printCategoriesListPDF } from '../../utils/exportHelpers';

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-category.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const CategoriesList = ({ onViewDetails, onEdit }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm, activeFilter, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(activeFilter !== null && { active: activeFilter }),
        sortBy,
        sortOrder
      });

      const response = await api.get(`/api/admin/categories?${params}`);
      setCategories(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل الفئات');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (categoryId, currentStatus) => {
    try {
      const formData = new FormData();
      formData.append('active', !currentStatus);

      await api.put(`/api/admin/categories/${categoryId}/status`, formData);

      setSuccessMessage('تم تحديث حالة الفئة بنجاح');
      setShowSuccessModal(true);
      await fetchCategories();
    } catch (err) {
      setError('حدث خطأ أثناء تحديث حالة الفئة');
      console.error('Error updating category status:', err);
    }
  };

  //CSV
  const exportCategories = async () => {
    exportCategoriesListCSV(setError)
  }

  const handleDelete = async (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setShowDeleteModal(false);
      await api.delete(`/api/admin/categories/${categoryToDelete.id}`);

      setCategoryToDelete(null);
      await fetchCategories();

      setSuccessMessage('تم حذف الفئة بنجاح');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(null)
      }, 2000)

    } catch (err) {

      const validationError = err.response?.data?.message
      const message = validationError || 'حدث خطأ أثناء حذف الفئة';

      setError(message);
      setTimeout(() => {
        setError(null)
      }, 4500)

    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return faSort;
    return sortOrder === 'asc' ? faSortUp : faSortDown;
  };

  //PDF Print
  const handlePrint = () => {
    printCategoriesListPDF(categories, formatDate, setError);
  }

  const renderShimmerRows = () => {
    return Array.from({ length: pageSize }).map((_, index) => (
      <tr key={index} className="shimmer-table-row">
        <td><ShimmerLoading type="table-row" /></td>
        <td><ShimmerLoading type="table-row" /></td>
        <td><ShimmerLoading type="table-row" /></td>
        <td><ShimmerLoading type="table-row" /></td>
        <td><ShimmerLoading type="table-row" /></td>
        <td><ShimmerLoading type="table-row" /></td>
        <td><ShimmerLoading type="table-row" /></td>
        <td><ShimmerLoading type="table-row" /></td>
        <td><ShimmerLoading type="table-row" /></td>
      </tr>
    ));
  };

  const columns = [
    {
      key: 'id',
      label: 'المعرف',
      sortable: true,
      render: (value) => <span className="category-id">#{value}</span>
    },
    {
      key: 'name',
      label: 'اسم الفئة',
      sortable: true,
      render: (value, row) => (
        <div className="provider-info">
          <img
            src={getImageUrl(row.image)}
            alt={row.name}
            className="provider-avatar"
            onError={(e) => {
              e.target.src = '/assets/images/category.png';
            }}
          />
          <span>{row.name}</span>
        </div>
      )
    },
    {
      key: 'nameEn',
      label: 'الاسم بالإنجليزية',
      sortable: true
    },
    {
      key: 'active',
      label: 'الحالة',
      sortable: true,
      render: (value, row) => (
        <div className="categories-status-toggle">
          <input
            type="checkbox"
            id={`status-${row.id}`}
            className="categories-status-toggle-input"
            checked={row.active}
            onChange={() => handleStatusToggle(row.id, row.active)}
          />
          <label htmlFor={`status-${row.id}`} className="categories-status-toggle-label">
            <div className="categories-status-toggle-slider"></div>
            <span className="categories-status-toggle-text">
              {row.active ? 'نشط' : 'غير نشط'}
            </span>
          </label>
        </div>
      )
    },
    {
      key: 'tripsCount',
      label: 'عدد الرحلات',
      sortable: true
    },
    {
      key: 'bookingsCount',
      label: 'عدد الحجوزات',
      sortable: true
    },
    {
      key: 'totalRevenue',
      label: 'إجمالي الإيرادات',
      render: (value) => `${value || 0} ريال`
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      sortable: true,
      render: (value) => formatDate(value)
    }
  ];

  return (
    <div className="categories-list">
      <div className="categories-header">
        <div className="categories-title">
          <h2>إدارة الفئات</h2>
          <p>عرض وإدارة فئات الرحلات</p>
        </div>
        <div className="categories-actions">
          <button className="categories-btn categories-btn-print" onClick={handlePrint}>
            <FontAwesomeIcon icon={faPrint} />
            طباعة
          </button>
          <button className="categories-btn categories-btn-export" onClick={exportCategories}>
            <FontAwesomeIcon icon={faDownload} />
            تصدير
          </button>
          <button className="categories-btn categories-btn-primary" onClick={() => onEdit()}>
            <FontAwesomeIcon icon={faPlus} />
            إضافة فئة جديدة
          </button>
        </div>
      </div>

      <div className="categories-filters">
        <div className="categories-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="البحث في الفئات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className={`categories-filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FontAwesomeIcon icon={faFilter} />
          فلاتر
        </button>
      </div>

      {showFilters && (
        <div className="categories-filters-panel">
          <div className="categories-filter-group">
            <label>الحالة:</label>
            <select
              value={activeFilter === null ? '' : activeFilter.toString()}
              onChange={(e) => setActiveFilter(e.target.value === '' ? null : e.target.value === 'true')}
            >
              <option value="">جميع الحالات</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
          </div>
        </div>
      )}

      {error && (
        <div className="categories-error-message">
          {error}
        </div>
      )}

      <CustomTable
        columns={columns}
        data={categories}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: (page) => setCurrentPage(page)
        }}
        noDataMessage="لا توجد فئات"
        renderActions={(category) => (
          <div className="categories-action-buttons">
            <button
              className="categories-btn-action categories-btn-view"
              onClick={() => onViewDetails(category.id)}
              title="عرض التفاصيل"
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button
              className="categories-btn-action categories-btn-edit"
              onClick={() => onEdit(category.id)}
              title="تعديل"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="categories-btn-action categories-btn-delete"
              onClick={() => handleDelete(category)}
              title="حذف"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      />


      <SuccessModal
        isVisible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      <DeleteConfirmModal
        isVisible={showDeleteModal}
        title="حذف الفئة"
        message={`هل أنت متأكد من حذف الفئة "${categoryToDelete?.name || ''}"؟`}
        onConfirm={confirmDelete}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
};

export default CategoriesList; 