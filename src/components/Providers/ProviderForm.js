import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faSave, 
  faUpload,
  faTimes,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import ShimmerLoading from '../ShimmerLoading';
import SuccessModal from '../SuccessModal';
import './ProviderForm.css';
import { API_CONFIG } from '../../constants/config';

const ProviderForm = ({ providerId, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    cityId: '',
    profileImageFile: null,
    profileImage: null
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isVisible: false,
    message: ''
  });

  useEffect(() => {
    fetchCities();
    if (providerId) {
      setIsEdit(true);
      fetchProvider();
    }
  }, [providerId]);

  // Set city search text when cities are loaded and provider is being edited
  useEffect(() => {
    if (cities.length > 0 && isEdit && formData.cityId && !citySearch) {
      const selectedCity = cities.find(city => city.id.toString() === formData.cityId);
      if (selectedCity) {
        setCitySearch(selectedCity.name);
      }
    }
  }, [cities, isEdit, formData.cityId, citySearch]);

  // Handle clicking outside city dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const cityContainer = document.querySelector('.form-city-search-container');
      if (cityContainer && !cityContainer.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCities = async () => {
    try {
      const response = await api.get('/api/cities');
      setCities(response.data);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/images/default-avatar.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_CONFIG.BASE_URL}/images/profiles/${imagePath}`;
  };
  

  const fetchProvider = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/providers/${providerId}`);
      const provider = response.data;
      
      setFormData({
        fullName: provider.fullName || '',
        userName: provider.userName || '',
        email: provider.email || '',
        password: '',
        confirmPassword: '',
        cityId: provider.cityId?.toString() || '',
        profileImageFile: null,
        profileImage: getImageUrl(provider.profileImage) || null
      });

      // Set city search text if city is selected and cities are already loaded
      if (provider.cityId && cities.length > 0) {
        const selectedCity = cities.find(city => city.id === provider.cityId);
        if (selectedCity) {
          setCitySearch(selectedCity.name);
        }
      }
    } catch (err) {
      setError('فشل في تحميل بيانات المزود');
      console.error('Error fetching provider:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
      
      // Clear error for this field
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  const removeFile = (field) => {
    setFormData(prev => ({ ...prev, [field]: null }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Filter cities based on search
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCitySelect = (cityId, cityName) => {
    setFormData(prev => ({ ...prev, cityId: cityId }));
    setCitySearch(cityName);
    setShowCityDropdown(false);
    
    // Clear error for city field
    if (errors.cityId) {
      setErrors(prev => ({ ...prev, cityId: '' }));
    }
  };

  const handleCitySearchChange = (e) => {
    setCitySearch(e.target.value);
    setShowCityDropdown(true);
    if (!e.target.value) {
      setFormData(prev => ({ ...prev, cityId: '' }));
    }
  };

  const getSelectedCityName = () => {
    const selectedCity = cities.find(city => city.id.toString() === formData.cityId);
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }

    if (!formData.userName.trim()) {
      newErrors.userName = 'رقم الهاتف مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.cityId) {
      newErrors.cityId = 'المدينة مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'profileImageFile') {
          // Handle profile image separately
          if (formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          }
        } else if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add role for new providers only
      if (!isEdit) {
        formDataToSend.append('role', 'provider');
      }

      if (isEdit) {
        await api.put(`/api/admin/providers/${providerId}`, formDataToSend);
        showSuccessMessage('تم تحديث بيانات المزود بنجاح');
      } else {
        await api.post('/api/admin/providers', formDataToSend);
        showSuccessMessage('تم إضافة المزود بنجاح');
      }

      // Delay calling onSuccess to allow success modal to display
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      // Handle different error response formats
      let errorMessage = 'فشل في حفظ البيانات';
      
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
      console.error('Error saving provider:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <ShimmerLoading type="form" />;
  }

  return (
    <div className="provider-form">
      <div className="provider-form-header">
        <button className="btn-back" onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          العودة
        </button>
        <h2>{isEdit ? 'تعديل المزود' : 'إضافة مزود جديد'}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="provider-form-content">
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h3>المعلومات الأساسية</h3>
            
            <div className="form-group">
              <label htmlFor="fullName">
                <FontAwesomeIcon icon={faUser} />
                الاسم الكامل *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? 'error' : ''}
                placeholder="أدخل الاسم الكامل"
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="userName">
                <FontAwesomeIcon icon={faPhone} />
                رقم الهاتف *
              </label>
              <input
                type="tel"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className={errors.userName ? 'error' : ''}
                placeholder="أدخل رقم الهاتف"
              />
              {errors.userName && <span className="error-text">{errors.userName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FontAwesomeIcon icon={faEnvelope} />
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="أدخل البريد الإلكتروني"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          {/* Account Information */}
          <div className="form-section">
            <h3>معلومات الحساب</h3>
            
            <div className="form-group">
              <label htmlFor="cityId">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                المدينة *
              </label>
              <div className="form-city-search-container">
                <div className="form-city-search-input">
                  <input
                    type="text"
                    placeholder="البحث في المدن..."
                    value={citySearch}
                    onChange={handleCitySearchChange}
                    onFocus={() => setShowCityDropdown(true)}
                    className={errors.cityId ? 'error' : ''}
                  />
                  <button 
                    type="button"
                    className="form-city-clear-btn"
                    onClick={() => {
                      setCitySearch('');
                      setFormData(prev => ({ ...prev, cityId: '' }));
                      setShowCityDropdown(false);
                    }}
                    style={{ display: citySearch ? 'block' : 'none' }}
                  >
                    ×
                  </button>
                </div>
                
                {showCityDropdown && (
                  <div className="form-city-dropdown">
                    {filteredCities.length > 0 ? (
                      filteredCities.map(city => (
                        <div
                          key={city.id}
                          className={`form-city-option ${formData.cityId === city.id.toString() ? 'selected' : ''}`}
                          onClick={() => handleCitySelect(city.id.toString(), city.name)}
                        >
                          {city.name}
                        </div>
                      ))
                    ) : (
                      <div className="form-city-no-results">لا توجد نتائج</div>
                    )}
                  </div>
                )}
              </div>
              {errors.cityId && <span className="error-text">{errors.cityId}</span>}
            </div>

            <div className="form-group">
              <label>صورة الملف الشخصي</label>
              <div className="file-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profileImageFile')}
                  id="profileImageFile"
                />
                <label htmlFor="profileImageFile" className="file-upload-label">
                  <FontAwesomeIcon icon={faUpload} />
                  <span>اختر صورة</span>
                </label>
              </div>
              {(formData.profileImageFile || formData.profileImage) && (
                <div className="file-preview">
                  <img 
                    src={formData.profileImageFile instanceof File ? 
                      URL.createObjectURL(formData.profileImageFile) : 
                      (formData.profileImage || formData.profileImageFile)
                    } 
                    alt="Profile preview" 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeFile('profileImageFile')}
                    className="remove-file"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            إلغاء
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FontAwesomeIcon icon={faSave} />
            {loading ? 'جاري الحفظ...' : (isEdit ? 'تحديث' : 'حفظ')}
          </button>
        </div>
      </form>

      <SuccessModal 
        message={successModal.message}
        isVisible={successModal.isVisible}
        onClose={closeSuccessModal}
      />
    </div>
  );
};

export default ProviderForm; 