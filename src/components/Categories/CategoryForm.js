import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faSave, 
  faTimes, 
  faUpload,
  faSpinner,
  faCamera,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import { API_CONFIG } from '../../constants/config';
import ShimmerLoading from '../ShimmerLoading';
import SuccessModal from '../SuccessModal';
import './CategoryForm.css';

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-category.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}/images/categories/${imagePath}`;
};

const CategoryForm = ({ categoryId, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isEditing = !!categoryId;

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/admin/categories/${categoryId}`);
      const category = response.data;
      setFormData({
        name: category.name,
        nameEn: category.nameEn || '',
        active: category.active
      });
      if (category.image) {
        setImagePreview(getImageUrl(category.image));
      }
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل بيانات الفئة');
      console.error('Error fetching category:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('يرجى اختيار ملف صورة صحيح');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Clear the file input
    const fileInput = document.getElementById('category-image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('اسم الفئة مطلوب');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('nameEn', formData.nameEn);
      formDataToSend.append('active', formData.active);
      
      if (imageFile) {
        formDataToSend.append('imageFile', imageFile);
      }

      if (isEditing) {
        await api.put(`/api/admin/categories/${categoryId}`, formDataToSend);
        setSuccessMessage('تم تحديث الفئة بنجاح');
      } else {
        await api.post('/api/admin/categories', formDataToSend);
        setSuccessMessage('تم إنشاء الفئة بنجاح');
      }
      
      setShowSuccessModal(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err) {
      // Handle different error response formats
      let errorMessage = 'حدث خطأ أثناء حفظ الفئة';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        } else if (typeof err.response.data === 'object') {
          // If it's an object, try to extract meaningful error info
          const errorObj = err.response.data;
          if (errorObj.errors && typeof errorObj.errors === 'object') {
            // Handle validation errors
            const errorKeys = Object.keys(errorObj.errors);
            if (errorKeys.length > 0) {
              const firstError = errorObj.errors[errorKeys[0]];
              // Ensure we get a string, even if the error is an object
              if (typeof firstError === 'string') {
                errorMessage = firstError;
              } else if (typeof firstError === 'object' && firstError.message) {
                errorMessage = firstError.message;
              } else if (Array.isArray(firstError)) {
                errorMessage = firstError[0] || 'خطأ في التحقق من البيانات';
              } else {
                errorMessage = JSON.stringify(firstError);
              }
            }
          } else {
            // Convert object to string for display
            errorMessage = JSON.stringify(errorObj);
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error saving category:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="category-form">
        <div className="category-form-header">
          <button className="btn-back" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowRight} />
            العودة للقائمة
          </button>
        </div>
        <div className="category-form-content">
          <ShimmerLoading type="form" />
        </div>
      </div>
    );
  }

  return (
    <div className="category-form">
      <div className="category-form-header">
        <button className="category-form-btn-back" onClick={onBack}>
          <FontAwesomeIcon icon={faArrowRight} />
          العودة للقائمة
        </button>
        <h2>{isEditing ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</h2>
      </div>

      <div className="category-form-content">
        <form onSubmit={handleSubmit} className="category-form-container">
          {error && (
            <div className="category-form-error-message">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="category-form-section">
            <h3>معلومات الفئة</h3>
            <div className="category-form-grid">
              <div className="category-form-group">
                <label htmlFor="name">اسم الفئة *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم الفئة"
                  required
                />
              </div>

              <div className="category-form-group">
                <label htmlFor="nameEn">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  id="nameEn"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  placeholder="Enter category name in English"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="category-form-section">
            <h3>صورة الفئة</h3>
            <div className="category-image-upload-container">
              <div className="category-image-preview">
                {imagePreview ? (
                  <div className="category-image-preview-wrapper">
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="category-preview-image"
                    />
                    <button
                      type="button"
                      className="category-remove-image-btn"
                      onClick={removeImage}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ) : (
                  <div className="category-upload-placeholder">
                    <FontAwesomeIcon icon={faUpload} />
                    <p>اضغط لاختيار صورة</p>
                    <span>الحد الأقصى 5 ميجابايت</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="category-image"
                accept="image/*"
                onChange={handleImageChange}
                className="category-file-input"
              />
            </div>
          </div>

          {/* Status */}
          <div className="category-form-section">
            <h3>حالة الفئة</h3>
            <div className="category-form-group">
              <label className="category-checkbox-label">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
                <span className="category-checkmark"></span>
                تفعيل الفئة
              </label>
              <p className="category-help-text">
                الفئات المفعلة ستظهر للمستخدمين ويمكن ربط الرحلات بها
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="category-form-actions">
            <button
              type="button"
              className="category-form-btn-cancel"
              onClick={onBack}
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="category-form-btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  {isEditing ? 'تحديث الفئة' : 'إنشاء الفئة'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <SuccessModal
        isVisible={showSuccessModal}
        message={successMessage}
        onClose={() => {
          setShowSuccessModal(false);
        }}
      />
    </div>
  );
};

export default CategoryForm; 