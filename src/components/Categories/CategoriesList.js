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
  faTimes,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faBan
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';
import ShimmerLoading from '../ShimmerLoading';
import SuccessModal from '../SuccessModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
import './CategoriesList.css';

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
      fetchCategories();
    } catch (err) {
      setError('حدث خطأ أثناء تحديث حالة الفئة');
      console.error('Error updating category status:', err);
    }
  };

  const handleDelete = async (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/admin/categories/${categoryToDelete.id}`);
      
      setSuccessMessage('تم حذف الفئة بنجاح');
      setShowSuccessModal(true);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      setError('حدث خطأ أثناء حذف الفئة');
      console.error('Error deleting category:', err);
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html dir="rtl">
        <head>
          <title>قائمة الفئات</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .status-active { color: #059669; }
            .status-inactive { color: #dc2626; }
            h1 { color: #1fc1de; text-align: center; }
            .print-date { text-align: left; color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>قائمة الفئات</h1>
          <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الاسم بالإنجليزية</th>
                <th>الحالة</th>
                <th>عدد الرحلات</th>
                <th>عدد الحجوزات</th>
                <th>إجمالي الإيرادات</th>
                <th>تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map(category => `
                <tr>
                  <td>${category.name}</td>
                  <td>${category.nameEn || '-'}</td>
                  <td class="${category.active ? 'status-active' : 'status-inactive'}">
                    ${category.active ? 'نشط' : 'غير نشط'}
                  </td>
                  <td>${category.tripsCount}</td>
                  <td>${category.bookingsCount}</td>
                  <td>${category.totalRevenue || 0} ريال</td>
                  <td>${formatDate(category.createdAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

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
          <button className="categories-btn categories-btn-export">
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

      <div className="categories-table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                <FontAwesomeIcon icon={getSortIcon('id')} />
                المعرف
              </th>
              <th onClick={() => handleSort('name')}>
                <FontAwesomeIcon icon={getSortIcon('name')} />
                اسم الفئة
              </th>
              <th onClick={() => handleSort('nameEn')}>
                <FontAwesomeIcon icon={getSortIcon('nameEn')} />
                الاسم بالإنجليزية
              </th>
              <th onClick={() => handleSort('active')}>
                <FontAwesomeIcon icon={getSortIcon('active')} />
                الحالة
              </th>
              <th onClick={() => handleSort('tripscount')}>
                <FontAwesomeIcon icon={getSortIcon('tripscount')} />
                عدد الرحلات
              </th>
              <th onClick={() => handleSort('bookingscount')}>
                <FontAwesomeIcon icon={getSortIcon('bookingscount')} />
                عدد الحجوزات
              </th>
              <th>إجمالي الإيرادات</th>
              <th onClick={() => handleSort('createdAt')}>
                <FontAwesomeIcon icon={getSortIcon('createdAt')} />
                تاريخ الإنشاء
              </th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              renderShimmerRows()
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <span className="category-id">#{category.id}</span>
                  </td>
                  <td>
                    <div className="category-info">
                      <img
                        src={getImageUrl(category.image)}
                        alt={category.name}
                        className="category-avatar"
                        onError={(e) => {
                          e.target.src = '/assets/images/category.png';
                        }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </td>
                  <td>{category.nameEn || '-'}</td>
                  <td>
                    <div className="categories-status-toggle">
                      <input
                        type="checkbox"
                        id={`status-${category.id}`}
                        className="categories-status-toggle-input"
                        checked={category.active}
                        onChange={() => handleStatusToggle(category.id, category.active)}
                      />
                      <label htmlFor={`status-${category.id}`} className="categories-status-toggle-label">
                        <div className="categories-status-toggle-slider"></div>
                        <span className="categories-status-toggle-text">
                          {category.active ? 'نشط' : 'غير نشط'}
                        </span>
                      </label>
                    </div>
                  </td>
                  <td>{category.tripsCount}</td>
                  <td>{category.bookingsCount}</td>
                  <td>{category.totalRevenue || 0} ريال</td>
                  <td>{formatDate(category.createdAt)}</td>
                  <td>
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="categories-no-data">
                  <p>لا توجد فئات</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="categories-pagination">
          <button
            className="categories-btn-page"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            السابق
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`categories-btn-page ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className="categories-btn-page"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            التالي
          </button>
        </div>
      )}

      <SuccessModal
        isVisible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      <DeleteConfirmModal
        isVisible={showDeleteModal}
        title="حذف الفئة"
        message={`هل أنت متأكد من حذف الفئة "${categoryToDelete?.name}"؟`}
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