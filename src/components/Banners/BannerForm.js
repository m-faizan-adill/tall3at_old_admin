import React, { useState, useEffect } from 'react';
import { bannersApi } from '../../services/bannersApi';
import api from '../../services/api';
import ShimmerLoading from '../ShimmerLoading';
import SuccessModal from '../SuccessModal';
import './BannerForm.css';

const BannerForm = ({ bannerId, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    link: '',
    tripIds: '',
    image: ''
  });
  console.log('BannerForm bannerId:', formData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  console.log('BannerForm imagePreview:', imagePreview);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Trips multi-select state
  const [trips, setTrips] = useState([]);
  console.log('BannerForm trips:', trips);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsSearchTerm, setTripsSearchTerm] = useState('');
  const [showTripsModal, setShowTripsModal] = useState(false);

  const isEditing = !!bannerId;

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (isEditing && trips.length > 0) {
      fetchBannerData();
    }
  }, [bannerId, trips]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowTripsModal(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const fetchTrips = async () => {
    try {
      setTripsLoading(true);
      const response = await api.get('/api/admin/trips?pageSize=1000');
      setTrips(response.data.data || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setTripsLoading(false);
    }
  };

  const fetchBannerData = async () => {
    try {
      setFetching(true);
      const response = await bannersApi.getBanner(bannerId);
      const banner = response.data;

      console.log('Raw banner data from API:', response.data);

      console.log('Fetched banner data:', banner);

      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        link: banner.link || '',
        tripIds: banner.tripIds || '',
        image: banner.image || ''
      });

      if (banner.image) {
        setImagePreview(banner.image);
      }

      // Set selected trips if banner has tripIds
      if (banner.tripIds) {
        const tripIds = banner.tripIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        const selectedTripsData = trips.filter(trip => tripIds.includes(trip.id));
        setSelectedTrips(selectedTripsData);
      }

      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء جلب بيانات البانر');
      console.error('Error fetching banner:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTripsSearch = (e) => {
    setTripsSearchTerm(e.target.value);
  };

  const handleTripSelect = (trip) => {
    const isSelected = selectedTrips.some(selectedTrip => selectedTrip.id === trip.id);
    if (isSelected) {
      setSelectedTrips(selectedTrips.filter(selectedTrip => selectedTrip.id !== trip.id));
    } else {
      setSelectedTrips([...selectedTrips, trip]);
    }
  };

  const handleTripRemove = (tripId) => {
    setSelectedTrips(selectedTrips.filter(trip => trip.id !== tripId));
  };

  const handleOpenTripsModal = () => {
    setShowTripsModal(true);
  };

  const handleCloseTripsModal = () => {
    setShowTripsModal(false);
  };

  const handleConfirmTripsSelection = () => {
    setShowTripsModal(false);
  };

  const getFilteredTrips = () => {
    if (!tripsSearchTerm) return trips;
    return trips.filter(trip =>
      (trip.title && trip.title.toLowerCase().includes(tripsSearchTerm.toLowerCase())) ||
      (trip.cityName && trip.cityName.toLowerCase().includes(tripsSearchTerm.toLowerCase())) ||
      (trip.categoryName && trip.categoryName.toLowerCase().includes(tripsSearchTerm.toLowerCase()))
    );
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/images/default-trip.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5030'}${imagePath}`;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, GIF, WEBP');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
        return;
      }

      setImageFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return formData.image;

    try {
      setUploadingImage(true);
      const response = await bannersApi.uploadBannerImage(imageFile);
      console.log('Image upload response:', response.data);
      return response.data.imageUrl;
    } catch (err) {
      throw new Error('فشل في رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image && !imageFile) {
      setError('الصورة مطلوبة');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await handleImageUpload();
      }

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('subtitle', formData.subtitle);
      submitData.append('link', formData.link);
      submitData.append('tripIds', selectedTrips.map(trip => trip.id).join(','));
      submitData.append('image', imageUrl);

      console.log('Submitting banner data:', {
        title: formData.title,
        subtitle: formData.subtitle,
        link: formData.link,
        tripIds: selectedTrips.map(trip => trip.id).join(','),
        image: imageUrl
      });

      if (isEditing) {
        await bannersApi.updateBanner(bannerId, submitData);
        setSuccessMessage('تم تحديث البانر بنجاح');
      } else {
        await bannersApi.createBanner(submitData);
        setSuccessMessage('تم إنشاء البانر بنجاح');
      }

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        onSuccess();   // ✅ page refresh ya list reload ke liye
      }, 1200);
    } catch (err) {
      // setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ البانر');
      console.error('Error saving banner:', err);
      if(err.response?.data?.errors){
        const validationError = Object.entries(err.response.data.errors).map(([field, messages]) => `${field}: ${messages.join(', ')}`).join('\n')
        setError(validationError)

      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onSuccess();
  };

  if (fetching) {
    return <ShimmerLoading />;
  }

  return (
    <div className="banner-form">
      <div className="banner-form-header">
        <div className="banner-form-title">
          <h2>{isEditing ? 'تعديل البانر' : 'إضافة بانر جديد'}</h2>
          <p>{isEditing ? 'تعديل معلومات البانر' : 'إنشاء بانر جديد للعروض الترويجية'}</p>
        </div>
        <button className="btn btn-secondary" onClick={onBack}>
          <span className="fa fa-arrow-right"></span>
          العودة للقائمة
        </button>
      </div>

      <form onSubmit={handleSubmit} className="banner-form-content">
        {error && (
          <div className="error-message">
            <span className="fa fa-exclamation-triangle"></span>
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-main">
            <div className="form-section">
              <h3>معلومات البانر</h3>
              <div className="form-group">
                <label htmlFor="title">العنوان *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="أدخل عنوان البانر"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subtitle">العنوان الفرعي</label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="أدخل العنوان الفرعي (اختياري)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="link">الرابط</label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
                <small>رابط خارجي للبانر (اختياري)</small>
              </div>

              <div className="form-group">
                <label htmlFor="tripIds">الطلعات المرتبطة</label>
                <div className="trips-select-container">
                  <div
                    className="trips-select-input"
                    onClick={handleOpenTripsModal}
                  >
                    <div className="selected-trips">
                      {selectedTrips.length > 0 ? (
                        selectedTrips.map(trip => (
                          <span key={trip.id} className="selected-trip-tag">
                            {trip.title}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTripRemove(trip.id);
                              }}
                              className="remove-trip-btn"
                            >
                              <span className="fa fa-times"></span>
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="placeholder-text">اختر الطلعات المرتبطة بالبانر</span>
                      )}
                    </div>
                    <span className="fa fa-chevron-right select-arrow"></span>
                  </div>
                </div>
                <small>اختر الطلعات التي تريد ربطها بالبانر (اختياري)</small>
              </div>
            </div>
          </div>

          <div className="form-sidebar">
            <div className="form-section">
              <h3>صورة البانر</h3>
              <div className="image-upload-section">
                <div className="image-preview">
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img
                        src={imagePreview.startsWith('data:') ? imagePreview :
                          imagePreview.startsWith('http') ? imagePreview :
                            `${process.env.REACT_APP_API_URL || 'http://localhost:5030'}${imagePreview}`}
                        alt="Banner preview"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={handleRemoveImage}
                        title="إزالة الصورة"
                      >
                        <span className="fa fa-times"></span>
                      </button>
                    </div>
                  ) : (
                    <div className="image-upload-placeholder">
                      <span className="fa fa-cloud-upload"></span>
                      <p>اختر صورة البانر</p>
                      <small>JPG, PNG, GIF, WEBP - الحد الأقصى 5MB</small>
                    </div>
                  )}
                </div>

                <div className="image-upload-controls">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <label htmlFor="image" className="file-input-label">
                    <span className="fa fa-upload"></span>
                    {imagePreview ? 'تغيير الصورة' : 'اختيار صورة'}
                  </label>
                </div>

                {uploadingImage && (
                  <div className="upload-progress">
                    <span className="fa fa-spinner fa-spin"></span>
                    جاري رفع الصورة...
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>معلومات إضافية</h3>
              <div className="info-cards">
                <div className="info-card">
                  <div className="info-icon">
                    <span className="fa fa-image"></span>
                  </div>
                  <div className="info-content">
                    <h4>صورة البانر</h4>
                    <p>يجب أن تكون الصورة بجودة عالية وبأبعاد مناسبة</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">
                    <span className="fa fa-link"></span>
                  </div>
                  <div className="info-content">
                    <h4>الرابط</h4>
                    <p>يمكن إضافة رابط خارجي للبانر للانتقال إليه عند النقر</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">
                    <span className="fa fa-route"></span>
                  </div>
                  <div className="info-content">
                    <h4>الطلعات المرتبطة</h4>
                    <p>ربط البانر بطلعات محددة لعرضها مع البانر</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            disabled={loading}
          >
            <span className="fa fa-times"></span>
            إلغاء
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || uploadingImage}
          >
            {loading ? (
              <>
                <span className="fa fa-spinner fa-spin"></span>
                جاري الحفظ...
              </>
            ) : (
              <>
                <span className="fa fa-save"></span>
                {isEditing ? 'تحديث البانر' : 'إنشاء البانر'}
              </>
            )}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        message={successMessage}
      />

      {/* Trips Selection Modal */}
      {showTripsModal && (
        <div className="trips-modal-overlay" onClick={handleCloseTripsModal}>
          <div className="trips-modal" onClick={(e) => e.stopPropagation()}>
            <div className="trips-modal-header">
              <h3>اختر الطلعات المرتبطة</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseTripsModal}
              >
                <span className="fa fa-times"></span>
              </button>
            </div>

            <div className="trips-modal-search">
              <div className="search-input-container">
                <span className="fa fa-search search-icon"></span>
                <input
                  type="text"
                  placeholder="البحث في الطلعات..."
                  value={tripsSearchTerm}
                  onChange={handleTripsSearch}
                  className="trips-modal-search-input"
                />
              </div>
            </div>

            <div className="trips-modal-content">
              {tripsLoading ? (
                <div className="trips-loading">
                  <span className="fa fa-spinner fa-spin"></span>
                  جاري تحميل الطلعات...
                </div>
              ) : getFilteredTrips().length > 0 ? (
                <div className="trips-grid">
                  {getFilteredTrips().map(trip => (
                    <div
                      key={trip.id}
                      className={`trip-grid-item ${selectedTrips.some(selectedTrip => selectedTrip.id === trip.id) ? 'selected' : ''}`}
                      onClick={() => handleTripSelect(trip)}
                    >
                      <div className="trip-grid-image">
                        <img
                          src={getImageUrl(trip.images?.split(',')[0])}
                          alt={trip.title}
                          onError={(e) => {
                            e.target.src = '/assets/images/default-trip.png';
                          }}
                        />
                        <div className="trip-selection-overlay">
                          <span className={`fa ${selectedTrips.some(selectedTrip => selectedTrip.id === trip.id) ? 'fa-check-circle' : 'fa-circle'}`}></span>
                        </div>
                      </div>
                      <div className="trip-grid-info">
                        <h4 className="trip-grid-title">{trip.title}</h4>
                        <div className="trip-grid-meta">
                          <span className="trip-grid-city">
                            <span className="fa fa-map-marker-alt"></span>
                            {trip.cityName || 'غير محدد'}
                          </span>
                          <span className="trip-grid-category">
                            <span className="fa fa-tag"></span>
                            {trip.categoryName || 'غير محدد'}
                          </span>
                        </div>
                        <div className="trip-grid-price">
                          <span className="price-label">السعر:</span>
                          <span className="price-value">
                            {trip.packages && trip.packages.length > 0
                              ? Math.min(...trip.packages.map(pkg => pkg.cost))
                              : 0}
                            ريال


                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-trips">
                  <span className="fa fa-info-circle"></span>
                  <p>لا توجد طلعات</p>
                </div>
              )}
            </div>

            <div className="trips-modal-footer">
              <div className="selected-count">
                تم اختيار {selectedTrips.length} طلعة
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseTripsModal}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmTripsSelection}
                >
                  تأكيد الاختيار
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerForm; 