import React, { useState, useEffect } from 'react';
import { bannersApi } from '../../services/bannersApi';
import DeleteConfirmModal from '../DeleteConfirmModal';
import SuccessModal from '../SuccessModal';
import ShimmerLoading from '../ShimmerLoading';
import './BannersList.css';
import { API_CONFIG } from '../../constants/config';
import CustomTable from '../../components/common/CustomTable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const BannersList = ({ onViewBanner, onEditBanner, onCreateBanner }) => {
  const [banners, setBanners] = useState([]);
  console.log('Banners state:', banners);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('CreatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannersApi.getBannersList({
        pageNumber,
        pageSize,
        searchTerm,
        sortBy,
        sortOrder
      });

      setBanners(response.data.banners);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء جلب البيانات');
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [pageNumber, pageSize, searchTerm, sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPageNumber(1);
    fetchBanners();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPageNumber(1);
  };

  const handlePageChange = (newPage) => {
    setPageNumber(newPage);
  };

  const handleDeleteBanner = (banner) => {
    setBannerToDelete(banner);
    console.log('Banner to delete:', banner);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await bannersApi.deleteBanner(bannerToDelete.id);
      console.log('Deleted banner ID:', bannerToDelete.id);

      setSuccessMessage('تم حذف البانر بنجاح');
      setShowDeleteModal(false);
      setBannerToDelete(null);

      await fetchBanners();
      setShowSuccessModal(true);
    } catch (err) {
      setError('حدث خطأ أثناء حذف البانر');
      console.error('Error deleting banner:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'fa-sort';
    return sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  };

  if (loading && banners.length === 0) {
    return <ShimmerLoading />;
  }

  // custom table variable
  const columns = [
    {
      key: 'createdAt',
      label: 'التاريخ',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'image',
      label: 'الصورة',
      render: (value, row) => (
        <div className="banner-image">
          {row.image ? (
            <img
              src={row.image.startsWith('http')
                ? row.image
                : `${API_CONFIG.BASE_URL}${row.image}`}
              alt={row.title || 'Banner'}
            />
          ) : (
            <div className="no-image">لا توجد صورة</div>
          )}
        </div>
      )
    },
    { key: 'title', label: 'العنوان', sortable: true },
    { key: 'subtitle', label: 'العنوان الفرعي' },
    {
      key: 'link',
      label: 'الرابط',
      render: (value) =>
        value ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value.length > 30 ? `${value.substring(0, 30)}...` : value}
          </a>
        ) : (
          '-'
        )
    },
    {
      key: 'tripIds',
      label: 'الطلعات المرتبطة',
      render: (value) =>
        value ? <span>{value.split(',').length} طلعة</span> : '-'
    }
  ];


  return (
    <div className="banners-list">
      <div className="banners-header">
        <div className="banners-title">
          <h2>إدارة البانرات</h2>
          <p>إدارة البانرات والعروض الترويجية</p>
        </div>
        <button className="btn btn-primary" onClick={onCreateBanner}>
          <span className="fa fa-plus"></span>
          إضافة بانر جديد
        </button>
      </div>

      <div className="banners-filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input">
            <input
              type="text"
              placeholder="البحث في البانرات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <span className="fa fa-search"></span>
            </button>
          </div>
        </form>

        <div className="filters-controls">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="page-size-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="fa fa-exclamation-triangle"></span>
          {error}
        </div>
      )}

      {/* <div className="banners-table-container">
        <table className="banners-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('CreatedAt')} className="sortable">
                التاريخ
                <span className={`fa ${getSortIcon('CreatedAt')}`}></span>
              </th>
              <th>الصورة</th>
              <th onClick={() => handleSort('Title')} className="sortable">
                العنوان
                <span className={`fa ${getSortIcon('Title')}`}></span>
              </th>
              <th>العنوان الفرعي</th>
              <th>الرابط</th>
              <th>الطلعات المرتبطة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td>{formatDate(banner.createdAt)}</td>
                <td>
                  <div className="banner-image">
                    {banner.image ? (
                      <img
                        src={banner.image.startsWith('http') ? `${API_CONFIG.BASE_URL}${banner.image}` : `${API_CONFIG.BASE_URL}${banner.image}`}
                        alt={banner.title || 'Banner'}
                      />
                    ) : (
                      <div className="no-image">لا توجد صورة</div>
                    )}
                  </div>
                </td>
                <td>{banner.title || '-'}</td>
                <td>{banner.subtitle || '-'}</td>
                <td>
                  {banner.link ? (
                    <a href={banner.link} target="_blank" rel="noopener noreferrer">
                      {banner.link.length > 30 ? `${banner.link.substring(0, 30)}...` : banner.link}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {banner.tripIds ? (
                    <span className="trip-count">
                      {banner.tripIds.split(',').length} طلعة
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => onViewBanner(banner.id)}
                      title="عرض التفاصيل"
                    >
                      <span className="fa fa-eye"></span>
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => onEditBanner(banner.id)}
                      title="تعديل"
                    >
                      <span className="fa fa-edit"></span>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteBanner(banner)}
                      title="حذف"
                    >
                      <span className="fa fa-trash"></span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {banners.length === 0 && !loading && (
          <div className="no-data">
            <span className="fa fa-inbox"></span>
            <p>لا توجد بانرات</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-sm"
            disabled={pageNumber === 1}
            onClick={() => handlePageChange(pageNumber - 1)}
          >
            <span className="fa fa-chevron-left"></span>
            السابق
          </button>

          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (pageNumber <= 3) {
                pageNum = i + 1;
              } else if (pageNumber >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = pageNumber - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`btn btn-sm ${pageNumber === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="btn btn-sm"
            disabled={pageNumber === totalPages}
            onClick={() => handlePageChange(pageNumber + 1)}
          >
            التالي
            <span className="fa fa-chevron-right"></span>
          </button>
        </div>
      )}

      <div className="pagination-info">
        <span>
          عرض {((pageNumber - 1) * pageSize) + 1} إلى {Math.min(pageNumber * pageSize, totalCount)} من {totalCount} بانر
        </span>
      </div> */}

      <CustomTable
        columns={columns}
        data={banners}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={{
          currentPage: pageNumber,
          totalPages: totalPages,
          onPageChange: handlePageChange
        }}
        noDataMessage="لا توجد بانرات"
        renderActions={(banner) => (
          <div className="categories-action-buttons">
            <button
              className="categories-btn-action categories-btn-view"

              onClick={() => onViewBanner(banner.id)}
              title="عرض التفاصيل"
            >
              <span className="fa fa-eye"></span>
            </button>
            <button
              className="categories-btn-action categories-btn-edit"
              onClick={() => onEditBanner(banner.id)}
              title="تعديل"
            >
              <span className="fa fa-edit"></span>
            </button>
            <button
              className="categories-btn-action categories-btn-delete"
              onClick={() => handleDeleteBanner(banner)}
              title="حذف"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      />


      <DeleteConfirmModal
        isVisible={showDeleteModal}
        title="حذف البانر"
        message={`هل أنت متأكد من حذف البانر "${bannerToDelete?.title || 'غير محدد'}"؟`}
        onConfirm={confirmDelete}
        onClose={() => {
          setShowDeleteModal(false)
          setBannerToDelete(null)
        }}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </div>
  );
};

export default BannersList; 