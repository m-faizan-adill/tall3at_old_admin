import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faSave, 
  faTimes, 
  faUpload,
  faSpinner,
  faCamera,
  faCheckCircle,
  faExclamationTriangle,
  faPlus,
  faTrash,
  faMapMarkerAlt,
  faTag,
  faMoneyBillWave,
  faUsers,
  faClock,
  faCalendarAlt,
  faBox,
  faGift,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import ShimmerLoading from '../ShimmerLoading';
import SuccessModal from '../SuccessModal';
import './TripForm.css';

// Utility function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-trip.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const TripForm = ({ tripId, onBack, onSuccess }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    cityId: '',
    categoryId: '',
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    availableFrom: '9:00 AM',
    availableTo: '6:00 PM',
    minBookingHours: 1,
    maxPersons: 10,
    featured: false,
    order: 0
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [options, setOptions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [citySearch, setCitySearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const isEditing = !!tripId;

  useEffect(() => {
    fetchCities();
    fetchCategories();
    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

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

  const fetchCities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/cities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCities(response.data);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTrip = async () => {
    setInitialLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/trips/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const trip = response.data;
      
      setFormData({
        cityId: trip.cityId?.toString() || '',
        categoryId: trip.categoryId?.toString() || '',
        title: trip.title || '',
        titleEn: trip.titleEn || '',
        description: trip.description || '',
        descriptionEn: trip.descriptionEn || '',
        availableFrom: trip.availableFrom || '9:00 AM',
        availableTo: trip.availableTo || '6:00 PM',
        minBookingHours: trip.minBookingHours || 1,
        maxPersons: trip.maxPersons || 10,
        featured: trip.featured || false,
        order: trip.order || 0
      });

      // Set city and category search values
      const city = cities.find(c => c.id === trip.cityId);
      const category = categories.find(c => c.id === trip.categoryId);
      if (city) setCitySearch(city.name);
      if (category) setCategorySearch(category.name);

      // Set image previews
      if (trip.images) {
        const imageUrls = trip.images.split(',').filter(img => img.trim());
        setImagePreviews(imageUrls.map(img => getImageUrl(img)));
      }

      // Set service options
      if (trip.serviceOptions) {
        setOptions(trip.serviceOptions.map(option => ({
          id: option.id,
          name: option.name,
          nameEn: option.nameEn || '',
          price: option.price?.toString() || '',
          stock: option.stock?.toString() || ''
        })));
      }

      // Set packages
      if (trip.packages) {
        setPackages(trip.packages.map(pkg => ({
          id: pkg.id,
          cost: pkg.cost?.toString() || '',
          unit: pkg.unit || '',
          minCount: pkg.minCount || 1,
          maxCount: pkg.maxCount || 1,
          numberOfHours: pkg.numberOfHours || 1,
          notes: pkg.notes || '',
          featured: pkg.featured || false
        })));
      }

      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل بيانات الرحلة');
      console.error('Error fetching trip:', err);
    } finally {
      setInitialLoading(false);
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
    const files = Array.from(e.target.files);
    
    // Validate files
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('يرجى اختيار ملفات صور صحيحة');
        return;
      }
    }

    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setError(null);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addOption = () => {
    setOptions(prev => [...prev, {
      id: Date.now(),
      name: '',
      nameEn: '',
      price: '',
      stock: ''
    }]);
  };

  const updateOption = (index, field, value) => {
    setOptions(prev => prev.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    ));
  };

  const removeOption = (index) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const addPackage = () => {
    setPackages(prev => [...prev, {
      id: Date.now(),
      cost: '',
      unit: '',
      minCount: 1,
      maxCount: 1,
      numberOfHours: 1,
      notes: '',
      featured: false
    }]);
  };

  const updatePackage = (index, field, value) => {
    setPackages(prev => prev.map((pkg, i) => 
      i === index ? { ...pkg, [field]: value } : pkg
    ));
  };

  const removePackage = (index) => {
    setPackages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('عنوان الرحلة مطلوب');
      return false;
    }
    if (!formData.cityId) {
      setError('يرجى اختيار المدينة');
      return false;
    }
    if (!formData.categoryId) {
      setError('يرجى اختيار الفئة');
      return false;
    }
    if (imageFiles.length === 0 && imagePreviews.length === 0) {
      setError('يرجى اختيار صورة واحدة على الأقل');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Validate and convert data types
      const cityId = parseInt(formData.cityId);
      const categoryId = parseInt(formData.categoryId);
      const minBookingHours = parseInt(formData.minBookingHours);
      const maxPersons = parseInt(formData.maxPersons);
      const order = parseInt(formData.order);

      // Validate required numeric fields
      if (isNaN(cityId) || cityId <= 0) {
        setError('يرجى اختيار مدينة صحيحة');
        setLoading(false);
        return;
      }

      if (isNaN(categoryId) || categoryId <= 0) {
        setError('يرجى اختيار فئة صحيحة');
        setLoading(false);
        return;
      }

      if (isNaN(minBookingHours) || minBookingHours <= 0) {
        setError('يرجى إدخال عدد ساعات صحيح');
        setLoading(false);
        return;
      }

      if (isNaN(maxPersons) || maxPersons <= 0) {
        setError('يرجى إدخال عدد أشخاص صحيح');
        setLoading(false);
        return;
      }

      if (isNaN(order) || order < 0) {
        setError('يرجى إدخال ترتيب صحيح');
        setLoading(false);
        return;
      }
      
      // Basic trip data - match backend parameter names exactly
      formDataToSend.append('cityId', cityId);
      formDataToSend.append('categoryId', categoryId);
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('titleEn', formData.titleEn.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('descriptionEn', formData.descriptionEn.trim());
      formDataToSend.append('availableFrom', formData.availableFrom);
      formDataToSend.append('availableTo', formData.availableTo);
      formDataToSend.append('minBookingHours', minBookingHours);
      formDataToSend.append('maxPersons', maxPersons);
      formDataToSend.append('featured', formData.featured ? 'true' : 'false');
      formDataToSend.append('order', order);
      
      // Images - backend expects 'images' field name
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });
      
      // Options - backend expects List<CreateOptionRequest>, send as JSON stringified array of objects
      if (options.length > 0) {
        const optionsObjects = options.map(option => ({
          name: option.name || '',
          nameEn: option.nameEn || '',
          price: parseFloat(option.price) || 0,
          stock: parseInt(option.stock) || 0
        }));
        formDataToSend.append('options', JSON.stringify(optionsObjects));
      }

      // Packages - backend expects List<CreatePackageRequest>, send as JSON stringified array of objects
      if (packages.length > 0) {
        const packagesObjects = packages.map(pkg => ({
          cost: parseFloat(pkg.cost) || 0,
          unit: pkg.unit || '',
          minCount: parseInt(pkg.minCount) || 1,
          maxCount: parseInt(pkg.maxCount) || 1,
          numberOfHours: parseInt(pkg.numberOfHours) || 1,
          notes: pkg.notes || ''
        }));
        formDataToSend.append('packages', JSON.stringify(packagesObjects));
      }

      // Debug: Log the form data being sent
      console.log('=== TRIP FORM DATA BEING SENT ===');
      console.log('Basic Form Data:');
      console.log('- cityId:', cityId);
      console.log('- categoryId:', categoryId);
      console.log('- title:', formData.title.trim());
      console.log('- titleEn:', formData.titleEn.trim());
      console.log('- description:', formData.description.trim());
      console.log('- descriptionEn:', formData.descriptionEn.trim());
      console.log('- availableFrom:', formData.availableFrom);
      console.log('- availableTo:', formData.availableTo);
      console.log('- minBookingHours:', minBookingHours);
      console.log('- maxPersons:', maxPersons);
      console.log('- featured:', formData.featured ? 'true' : 'false');
      console.log('- order:', order);
      
      console.log('\nImages:');
      console.log('- Number of image files:', imageFiles.length);
      imageFiles.forEach((file, index) => {
        console.log(`  Image ${index + 1}:`, file.name, `(${file.size} bytes)`);
      });
      
      console.log('\nOptions:');
      if (options.length > 0) {
        const optionsObjects = options.map(option => ({
          name: option.name || '',
          nameEn: option.nameEn || '',
          price: parseFloat(option.price) || 0,
          stock: parseInt(option.stock) || 0
        }));
        console.log('- Options objects:', optionsObjects);
        console.log('- Options JSON:', JSON.stringify(optionsObjects));
      } else {
        console.log('- No options');
      }
      
      console.log('\nPackages:');
      if (packages.length > 0) {
        const packagesObjects = packages.map(pkg => ({
          cost: parseFloat(pkg.cost) || 0,
          unit: pkg.unit || '',
          minCount: parseInt(pkg.minCount) || 1,
          maxCount: parseInt(pkg.maxCount) || 1,
          numberOfHours: parseInt(pkg.numberOfHours) || 1,
          notes: pkg.notes || ''
        }));
        console.log('- Packages objects:', packagesObjects);
        console.log('- Packages JSON:', JSON.stringify(packagesObjects));
      } else {
        console.log('- No packages');
      }
      
      console.log('\nFormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('=== END FORM DATA ===');

      if (isEditing) {
        const token = localStorage.getItem('token');
        console.log('=== UPDATE TRIP REQUEST ===');
        console.log('Trip ID:', tripId);
        console.log('API endpoint:', `/api/trips/${tripId}`);
        console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token found');
        console.log('Request headers:', {
          'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'No token'}`
        });
        
        const response = await api.put(`/api/trips/${tripId}`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData, let the browser set it with boundary
          }
        });
        console.log('Update response status:', response.status);
        console.log('Update response data:', response.data);
        setSuccessMessage('تم تحديث الرحلة بنجاح');
      } else {
        const token = localStorage.getItem('token');
        console.log('=== CREATE TRIP REQUEST ===');
        console.log('API endpoint:', '/api/trips');
        console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token found');
        console.log('Request headers:', {
          'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'No token'}`
        });
        
        const response = await api.post('/api/trips', formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData, let the browser set it with boundary
          }
        });
        console.log('Create response status:', response.status);
        console.log('Create response data:', response.data);
        setSuccessMessage('تم إنشاء الرحلة بنجاح');
      }
      
      setShowSuccessModal(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err) {
      console.error('Error details:', err);
      console.error('Error response:', err.response);
      
      // Handle different error response formats
      let errorMessage = 'حدث خطأ أثناء حفظ الرحلة';
      
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
    } finally {
      setLoading(false);
    }
  };

  // Filter cities and categories based on search
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleCitySelect = (cityId, cityName) => {
    setFormData(prev => ({ ...prev, cityId }));
    setCitySearch(cityName);
    setShowCityDropdown(false);
  };

  const handleCategorySelect = (categoryId, categoryName) => {
    setFormData(prev => ({ ...prev, categoryId }));
    setCategorySearch(categoryName);
    setShowCategoryDropdown(false);
  };

  const handleCitySearchChange = (e) => {
    setCitySearch(e.target.value);
    setShowCityDropdown(true);
    if (!e.target.value) {
      setFormData(prev => ({ ...prev, cityId: '' }));
    }
  };

  const handleCategorySearchChange = (e) => {
    setCategorySearch(e.target.value);
    setShowCategoryDropdown(true);
    if (!e.target.value) {
      setFormData(prev => ({ ...prev, categoryId: '' }));
    }
  };

  if (initialLoading) {
    return (
      <div className="trip-form">
        <div className="trip-form-header">
          <button className="btn-back" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowRight} />
            العودة للقائمة
          </button>
        </div>
        <div className="trip-form-content">
          <ShimmerLoading type="form" />
        </div>
      </div>
    );
  }

  return (
    <div className="trip-form">
      <div className="trip-form-header">
        <button className="trip-form-btn-back" onClick={onBack}>
          <FontAwesomeIcon icon={faArrowRight} />
          العودة للقائمة
        </button>
        <h2>{isEditing ? 'تعديل الرحلة' : 'إضافة رحلة جديدة'}</h2>
      </div>

      <div className="trip-form-content">
        <form onSubmit={handleSubmit} className="trip-form-container">
          {error && (
            <div className="trip-form-error-message">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="trip-form-section">
            <h3>معلومات الرحلة الأساسية</h3>
            <div className="trip-form-grid">
              <div className="trip-form-group">
                <label htmlFor="title">عنوان الرحلة *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="أدخل عنوان الرحلة"
                  required
                />
              </div>

              <div className="trip-form-group">
                <label htmlFor="titleEn">العنوان بالإنجليزية</label>
                <input
                  type="text"
                  id="titleEn"
                  name="titleEn"
                  value={formData.titleEn}
                  onChange={handleInputChange}
                  placeholder="Enter trip title in English"
                />
              </div>

              <div className="trip-form-group">
                <label htmlFor="maxPersons">الحد الأقصى للأشخاص</label>
                <input
                  type="number"
                  id="maxPersons"
                  name="maxPersons"
                  value={formData.maxPersons}
                  onChange={handleInputChange}
                  placeholder="10"
                  min="1"
                />
              </div>

              <div className="trip-form-group">
                <label htmlFor="minBookingHours">الحد الأدنى للحجز (ساعات)</label>
                <input
                  type="number"
                  id="minBookingHours"
                  name="minBookingHours"
                  value={formData.minBookingHours}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Location and Category */}
          <div className="trip-form-section">
            <h3>الموقع والفئة</h3>
            <div className="trip-form-grid">
              <div className="city-search-container">
                <label>المدينة *</label>
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
                      setFormData(prev => ({ ...prev, cityId: '' }));
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
                          className={`city-option ${formData.cityId === city.id.toString() ? 'selected' : ''}`}
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

              <div className="category-search-container">
                <label>الفئة *</label>
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
                      setFormData(prev => ({ ...prev, categoryId: '' }));
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
                          className={`category-option ${formData.categoryId === category.id.toString() ? 'selected' : ''}`}
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

          {/* Availability */}
          <div className="trip-form-section">
            <h3>أوقات التوفر</h3>
            <div className="trip-form-grid">
              <div className="trip-form-group">
                <label htmlFor="availableFrom">متاح من</label>
                <input
                  type="time"
                  id="availableFrom"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleInputChange}
                />
              </div>

              <div className="trip-form-group">
                <label htmlFor="availableTo">متاح حتى</label>
                <input
                  type="time"
                  id="availableTo"
                  name="availableTo"
                  value={formData.availableTo}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="trip-form-section">
            <h3>وصف الرحلة</h3>
            <div className="trip-form-grid">
              <div className="trip-form-group">
                <label htmlFor="description">الوصف بالعربية</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="أدخل وصف الرحلة بالعربية"
                  rows="4"
                />
              </div>

              <div className="trip-form-group">
                <label htmlFor="descriptionEn">الوصف بالإنجليزية</label>
                <textarea
                  id="descriptionEn"
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleInputChange}
                  placeholder="Enter trip description in English"
                  rows="4"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="trip-form-section">
            <h3>صور الرحلة</h3>
            <div className="trip-images-upload">
              <div className="trip-images-preview">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="trip-image-preview-item">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="trip-preview-image"
                    />
                    <button
                      type="button"
                      className="trip-remove-image-btn"
                      onClick={() => removeImage(index)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))}
                
                <div 
                  className="trip-upload-placeholder"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <FontAwesomeIcon icon={faUpload} />
                  <p>اضغط لاختيار صور</p>
                  <span>يمكنك اختيار صور غير محدودة</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                id="trip-images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="trip-file-input"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Service Options */}
          <div className="trip-form-section">
            <h3>الخدمات الإضافية</h3>
            <div className="trip-options">
              {options.map((option, index) => (
                <div key={option.id} className="trip-option-item">
                  <div className="trip-option-grid">
                    <div className="trip-form-group">
                      <label>اسم الخدمة</label>
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => updateOption(index, 'name', e.target.value)}
                        placeholder="اسم الخدمة"
                      />
                    </div>
                    <div className="trip-form-group">
                      <label>الاسم بالإنجليزية</label>
                      <input
                        type="text"
                        value={option.nameEn}
                        onChange={(e) => updateOption(index, 'nameEn', e.target.value)}
                        placeholder="Service name in English"
                      />
                    </div>
                    <div className="trip-form-group">
                      <label>السعر</label>
                      <input
                        type="number"
                        value={option.price}
                        onChange={(e) => updateOption(index, 'price', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="trip-form-group">
                      <label>المخزون</label>
                      <input
                        type="number"
                        value={option.stock}
                        onChange={(e) => updateOption(index, 'stock', e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <button
                      type="button"
                      className="trip-remove-option-btn"
                      onClick={() => removeOption(index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                className="trip-add-option-btn"
                onClick={addOption}
              >
                <FontAwesomeIcon icon={faPlus} />
                إضافة خدمة
              </button>
            </div>
          </div>

          {/* Trip Packages */}
          <div className="trip-form-section">
            <h3>
              <FontAwesomeIcon icon={faBox} />
              باقات الرحلة
            </h3>
            <div className="trip-packages">
              {packages.map((pkg, index) => (
                <div key={pkg.id} className="trip-package-item">
                  <div className="trip-package-grid">
                    <div className="trip-form-group">
                      <label>التكلفة</label>
                      <input
                        type="number"
                        value={pkg.cost}
                        onChange={(e) => updatePackage(index, 'cost', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="trip-form-group">
                      <label>الوحدة</label>
                      <input
                        type="text"
                        value={pkg.unit}
                        onChange={(e) => updatePackage(index, 'unit', e.target.value)}
                        placeholder="مثال: ساعة، يوم"
                      />
                    </div>
                    <div className="trip-form-group">
                      <label>عدد الساعات</label>
                      <input
                        type="number"
                        value={pkg.numberOfHours}
                        onChange={(e) => updatePackage(index, 'numberOfHours', e.target.value)}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                    <div className="trip-form-group">
                      <label>الحد الأدنى للأشخاص</label>
                      <input
                        type="number"
                        value={pkg.minCount}
                        onChange={(e) => updatePackage(index, 'minCount', e.target.value)}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                    <div className="trip-form-group">
                      <label>الحد الأقصى للأشخاص</label>
                      <input
                        type="number"
                        value={pkg.maxCount}
                        onChange={(e) => updatePackage(index, 'maxCount', e.target.value)}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                    <div className="trip-form-group">
                      <label>ملاحظات</label>
                      <textarea
                        value={pkg.notes}
                        onChange={(e) => updatePackage(index, 'notes', e.target.value)}
                        placeholder="ملاحظات إضافية للباقة"
                        rows="2"
                      />
                    </div>
                    <div className="trip-form-group">
                      <label className="trip-checkbox-label">
                        <input
                          type="checkbox"
                          checked={pkg.featured}
                          onChange={(e) => updatePackage(index, 'featured', e.target.checked)}
                        />
                        <span className="trip-checkmark"></span>
                        باقة مميزة
                      </label>
                    </div>
                    <button
                      type="button"
                      className="trip-remove-package-btn"
                      onClick={() => removePackage(index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                className="trip-add-package-btn"
                onClick={addPackage}
              >
                <FontAwesomeIcon icon={faPlus} />
                إضافة باقة
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="trip-form-section">
            <h3>الإعدادات</h3>
            <div className="trip-form-grid">
              <div className="trip-form-group">
                <label htmlFor="order">ترتيب العرض</label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="trip-form-group">
                <label className="trip-checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  <span className="trip-checkmark"></span>
                  رحلة مميزة
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="trip-form-actions">
            <button
              type="button"
              className="trip-form-btn-cancel"
              onClick={onBack}
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="trip-form-btn-submit"
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
                  {isEditing ? 'تحديث الرحلة' : 'إنشاء الرحلة'}
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

export default TripForm; 