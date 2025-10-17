import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faSave,
  faTimes,
  faUpload,
  faSpinner,
  faPlus,
  faTrash,
  faBox,
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import ShimmerLoading from '../ShimmerLoading';
import SuccessModal from '../SuccessModal';
import Select from "react-select";
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
    featured: 0,
    order: 0
  });
  // const [imageFiles, setImageFiles] = useState([]);
  // const [imagePreviews, setImagePreviews] = useState([]);

  const [imageItems, setImageItems] = useState([]);


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
  const dragFrom = React.useRef(null);
  const dragTo = React.useRef(null);

  const [selectedProvider, setSelectedProvider] = useState(null);

  const [providers, setProviders] = useState([]);
  // console.log("providers:____ ", providers)
  const [reordered, setReordered] = useState(false);

  // console.log("providers detaills information: ", providers)

  const isEditing = !!tripId;

  useEffect(() => {
    fetchCities();
    fetchCategories();
    fetchProviders();
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

      // console.log("trip form fetch: ", response.data)
      const trip = response.data;
      console.log("this is the trip details: ", trip)

      if (trip.providerId) {
        // console.log("providers in trip: ", trip.providers)
        setSelectedProvider(trip.providerId)
      }



      setFormData({
        cityId: trip.cityId?.toString() || '',
        categoryId: trip.categoryId?.toString() || '',
        // providerId: trip.providers?.providerId || '', //added tthis
        title: trip.title || '',
        titleEn: trip.titleEn || '',
        description: trip.description || '',
        descriptionEn: trip.descriptionEn || '',
        availableFrom: trip.availableFrom || '9:00 AM',
        availableTo: trip.availableTo || '6:00 PM',
        minBookingHours: trip.minBookingHours || 1,
        maxPersons: trip.maxPersons || 10,
        featured: trip.featured ? 1 : 0,
        order: trip.order || 0
      });

      // Set city and category search values
      // const city = cities.find(c => c.id === trip.cityId);
      // const category = categories.find(c => c.id === trip.categoryId);

      setCitySearch(trip.cityName || '');
      setCategorySearch(trip.categoryName || '');

      if (trip.images) {

        const urls = trip.images.split(',').map(s => s.trim()).filter(Boolean);
        setImageItems(urls.map(u => ({
          id: `ex-${u}`,
          type: 'existing',
          preview: getImageUrl(u),
          url: u
        })));
      } else {
        setImageItems([])
      }

      // Set service options
      if (trip.serviceOptions) {
        setOptions(trip.serviceOptions.map(option => ({
          id: option.id,
          name: option.name,
          nameEn: option.nameEn || '',
          price: option.price?.toString() || '',
          originalPrice: option.price?.toString() || '', // add this

          stock: option.stock?.toString() || ''
        })));
      }

      // Set packages
      if (trip.packages) {
        setPackages(trip.packages.map(pkg => ({
          id: pkg.id,
          cost: pkg.cost?.toString() || '',
          originalCost: pkg.cost?.toString() || '',  // add this
          unit: pkg.unit || '',
          minCount: pkg.minCount || 1,
          maxCount: pkg.maxCount || 1,
          numberOfHours: pkg.numberOfHours || 1,
          notes: pkg.notes || '',
          featured: pkg.featured ? 1 : 0
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

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/trips/providers/details?page=1&pageSize=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetched providers:", response.data);

      // if (response.data && response.data.data) {
      //   setProviders(response.data.data); // ✅ API me providers "data" key ke andar aa rahe hain
      // }
      if (response.data && response.data.data) {
        const formatted = response.data.data.map((p) => ({
          value: p.id,
          label: `${p.fullName} | ${p.phoneNumber}`,
        }));

        // console.log("formatted providers: ", formatted)
        setProviders(formatted);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
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

    const newItems = files.map((file) => ({
      id: `new-${Date.now()}-${file.name}`,
      type: 'new',
      preview: URL.createObjectURL(file),
      file
    }));

    setImageItems(prev => [...prev, ...newItems]);
    setError(null);
  };

  const removeImage = (index) => {
    setImageItems(prev => {
      const item = prev[index];
      // memory cleanup for object URLs
      if (item?.type === 'new' && item.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(item.preview);
      }
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };


  const addOption = () => {
    setOptions(prev => [...prev, {
      // id: Date.now(),
      id: 'new-' + Date.now(),

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

  const removeOption = async (optionId) => {
    try {
      if (typeof optionId === "number") {
        const token = localStorage.getItem("token");
        await api.delete(`/api/admin/trips/options/${optionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Update frontend state to remove option locally
      setOptions((prev) => prev.filter((opt) => opt.id !== optionId));
    } catch (error) {
      console.error("Failed to delete option:", error);
      alert("Failed to delete option. Please try again.");
    }
  };

  const addPackage = () => {
    setPackages(prev => [...prev, {
      // id: Date.now(),
      id: 'new-' + Date.now(),
      cost: '',
      unit: '',
      minCount: 1,
      maxCount: 1,
      numberOfHours: 1,
      notes: '',
      featured: 0 || false
    }]);
  };

  const updatePackage = (index, field, value) => {
    setPackages(prev => prev.map((pkg, i) =>
      i === index ? { ...pkg, [field]: value } : pkg
    ));
  };

  const removePackage = async (index) => {
    const pkg = packages[index];
    // console.log('Removing package:', pkg);
    if (pkg.id && typeof pkg.id === 'number') {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/api/trips/no-booking/packages/${pkg.id}`, {

          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // Agar delete successful ho to state update karein
        setPackages(prev => prev.filter((_, i) => i !== index));
      } catch (err) {
        console.error('Error details:', err);
        console.error('Error response:', err.response);

        let errorMessage = 'حدث خطأ أثناء حفظ الرحلة'; // default

        // ✅ Pehle backend ka "message" field check karo
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.status === 400 && err.response.data?.errors) {
          const errors = err.response.data.errors;
          const firstKey = Object.keys(errors)[0];
          const firstError = errors[firstKey];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        } else if (typeof err.response?.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }

    } else {
      // Agar package abhi server pe nahi hai (naya package), toh sirf state se hata dein
      setPackages(prev => prev.filter((_, i) => i !== index));
    }
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

    if (imageItems.length === 0) {
      setError('يرجى اختيار صورة واحدة على الأقل');
      return false;
    }


    // ✅ Provider required only on create
    if (!isEditing && !selectedProvider) {
      setError('يرجى اختيار المزود');
      return false;
    }

    // ✅ Packages must exist only for create mode
    if (!isEditing && packages.length === 0) {
      setError('يرجى إضافة باقة واحدة على الأقل');
      return false;
    }

    // ✅ Availability required (both create & update)
    if (!formData.availableFrom) {
      setError('يرجى تحديد وقت البداية');
      return false;
    }
    if (!formData.availableTo) {
      setError('يرجى تحديد وقت النهاية');
      return false;
    }

    return true;
  };

  // --- image upload helpers (INSIDE TripForm, before handleSubmit) ---
  const urlToFile = async (url, filenameHint = 'reupload.jpg') => {
    const res = await fetch(url);
    const blob = await res.blob();
    const name = filenameHint || 'reupload.jpg';
    return new File([blob], name, { type: blob.type || 'image/jpeg' });
  };

  const appendImagesToFormData = async (fd, isEditing) => {
    const desired = imageItems;

    // sabhi existing images ki list preserve karo (order me)
    const existingList = desired
      .filter(i => i.type === 'existing')
      .map(i => i.url);

    // nayi files
    const uploadFiles = desired
      .filter(i => i.type === 'new')
      .map(i => i.file);

    if (isEditing) {
      // ✅ Update Trip
      fd.append('existingImages', existingList.join(','));
      for (const f of uploadFiles) {
        fd.append('images', f);
      }

      // Agar reorder-only case ho (sirf existing hain, koi new nahi)
      if (uploadFiles.length === 0 && desired.length > 0 && reordered) {
        const pick = desired.find(i => i.type === 'existing');
        if (pick) {
          const filename = (pick.url?.split('/').pop()) || 'reupload.jpg';
          const f = await urlToFile(pick.url, filename);
          fd.append('images', f);
        }
        setReordered(false)
      }
    } else {
      // ✅ Create Trip
      for (const f of uploadFiles) {
        fd.append('ImageFiles', f);
      }
    }

    console.groupCollapsed('[Images] FormData snapshot');
    // console.log('existingImages:', existingList.join(','));
    // uploadFiles.forEach((f, i) =>
    //   console.log(`${isEditing ? 'images' : 'ImageFiles'}[${i}] -> ${f?.name} (${f?.size} bytes)`)
    // );
    console.groupEnd();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log('handleSubmit called');
    // console.log('isEditing:', isEditing);
    // console.log('packages:', packages);

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
      formDataToSend.append('providerId', selectedProvider); //add this
      formDataToSend.append('titleEn', formData.titleEn.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('descriptionEn', formData.descriptionEn.trim());
      formDataToSend.append('availableFrom', formData.availableFrom);
      formDataToSend.append('availableTo', formData.availableTo);
      formDataToSend.append('minBookingHours', minBookingHours);
      formDataToSend.append('maxPersons', maxPersons);
      formDataToSend.append('featured', formData.featured == 1 ? 1 : 0);

      formDataToSend.append('order', order);

      await appendImagesToFormData(formDataToSend, isEditing);

      //---------------000000
      if (options.length > 0) {
        if (isEditing) {
          // ✅ Update Trip -> JSON stringify
          const optionsObjects = options.map(option => {
            const originalPriceNum = parseFloat(option.originalPrice) || 0;
            const currentPriceNum = parseFloat(option.price) || 0;
            let finalPrice = currentPriceNum;

            // sirf tab commission add karo jab price change hui ho
            if (currentPriceNum !== originalPriceNum) {
              finalPrice = currentPriceNum * 1.15;
            }

            return {
              id: option.id,
              name: option.name || '',
              nameEn: option.nameEn || '',
              price: finalPrice,
              stock: parseInt(option.stock) || 0
            };
          });
          formDataToSend.append('options', JSON.stringify(optionsObjects));
        } else {
          // ✅ Create Trip -> indexed keys
          options.forEach((option, i) => {
            const basePrice = parseFloat(option.price) || 0;
            const finalPrice = basePrice * 1.15; // new create par hamesha commission
            formDataToSend.append(`Options[${i}].Name`, option.name || '');
            formDataToSend.append(`Options[${i}].NameEn`, option.nameEn || '');
            formDataToSend.append(`Options[${i}].Price`, finalPrice.toString());
            formDataToSend.append(`Options[${i}].Stock`, (parseInt(option.stock) || 0).toString());
          });
        }
      }

      //both create and udpate packages
      if (packages.length > 0) {
        if (isEditing) {
          console.log('Appending packages for update:', packages);

          // Update کے لیے: JSON stringify والا logic
          const packagesObjects = packages.map(pkg => {
            const originalCostNum = parseFloat(pkg.originalCost) || 0;
            const currentCostNum = parseFloat(pkg.cost) || 0;
            let finalCost = currentCostNum;
            if (currentCostNum !== originalCostNum) {
              finalCost = currentCostNum * 1.15; // 15% commission add
            }
            console.log("pkg featured: ",pkg.featured)
            return {
              id: pkg.id, // اگر موجود ہو
              cost: finalCost,
              unit: pkg.unit || '',
              minCount: parseInt(pkg.minCount) || 1,
              maxCount: parseInt(pkg.maxCount) || 1,
              numberOfHours: parseInt(pkg.numberOfHours) || 1,
              notes: pkg.notes || '',
              featured: pkg.featured ? 1 : 0
            };
          });
          formDataToSend.append('packages', JSON.stringify(packagesObjects));
        } else {

          // Create کے لیے: indexed keys والا logic
          packages.forEach((pkg, i) => {
            const originalCostNum = parseFloat(pkg.originalCost) || 0;
            const currentCostNum = parseFloat(pkg.cost) || 0;
            let finalCost = currentCostNum;
            if (currentCostNum !== originalCostNum) {
              finalCost = currentCostNum * 1.15; // 15% commission add
            }
            formDataToSend.append(`Packages[${i}].Cost`, finalCost.toString());
            formDataToSend.append(`Packages[${i}].Unit`, pkg.unit || '');
            formDataToSend.append(`Packages[${i}].NumberOfHours`, (parseInt(pkg.numberOfHours) || 1).toString());
            formDataToSend.append(`Packages[${i}].MinCount`, (parseInt(pkg.minCount) || 1).toString());
            formDataToSend.append(`Packages[${i}].MaxCount`, (parseInt(pkg.maxCount) || 1).toString());
            if (pkg.notes) {
              formDataToSend.append(`Packages[${i}].Notes`, pkg.notes);
            }
            formDataToSend.append(`Packages[${i}].Featured`, pkg.featured ? 1 : 0);
          });
                    console.log('Appending packages for create:', packages,packages.featured);


          // console.log(formDataToSend)
        }
      }



      // Debug: Log the form data being sent
      // console.log('=== TRIP FORM DATA BEING SENT ===');
      // console.log('Basic Form Data:');
      // console.log('- cityId:', cityId);
      // console.log('- categoryId:', categoryId);
      // console.log('- title:', formData.title.trim());
      // console.log('- titleEn:', formData.titleEn.trim());
      // console.log('- description:', formData.description.trim());
      // console.log('- descriptionEn:', formData.descriptionEn.trim());
      // console.log('- availableFrom:', formData.availableFrom);
      // console.log('- availableTo:', formData.availableTo);
      // console.log('- minBookingHours:', minBookingHours);
      // console.log('- maxPersons:', maxPersons);
      console.log('- featured:', formData.featured ? 1 : 0);
      // console.log('- order:', order);

      // console.log('\nImages:');

      // console.log('\nOptions:');
      if (options.length > 0) {
        const optionsObjects = options.map(option => ({
          name: option.name || '',
          nameEn: option.nameEn || '',
          price: parseFloat(option.price) || 0,
          stock: parseInt(option.stock) || 0
        }));
        // console.log('- Options objects:', optionsObjects);
        // console.log('- Options JSON:', JSON.stringify(optionsObjects));
      } else {
        console.log('- No options');
      }

      // console.log('\nPackages:');
      // if (packages.length > 0) {
      //   const packagesObjects = packages.map(pkg => ({
      //     cost: parseFloat(pkg.cost) || 0,
      //     unit: pkg.unit || '',
      //     minCount: parseInt(pkg.minCount) || 1,
      //     maxCount: parseInt(pkg.maxCount) || 1,
      //     numberOfHours: parseInt(pkg.numberOfHours) || 1,
      //     notes: pkg.notes || '',
      //     featured: pkg.featured ? 'true' : 'false'
      //   }));
      //   // console.log('- Packages objects:', packagesObjects);
      //   console.log('- Packages JSON:', JSON.stringify(packagesObjects));
      // } else {
      //   console.log('- No packages');
      // }

      // console.log('\nFormData entries:');
      // for (let [key, value] of formDataToSend.entries()) {
      //   console.log(`${key}:`, value);
      // }
      // console.log('=== END FORM DATA ===');

      if (isEditing) {
        const token = localStorage.getItem('token');
        // console.log('=== UPDATE TRIP REQUEST ===');
        // console.log('Trip ID:', tripId);
        // console.log('API endpoint:', `/api/trips/${tripId}`);
        // console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token found');
        // console.log('Request headers:', {
        //   'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'No token'}`
        // });

        const response = await api.put(`/api/trips/${tripId}`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData, let the browser set it with boundary
          }
        });
        console.log('Update response status:', response.status);
        // console.log('Update response data:', response.data);
        setSuccessMessage('تم تحديث الرحلة بنجاح');
      } else {
        const token = localStorage.getItem('token');
        // console.log('=== CREATE TRIP REQUEST ===');
        // console.log('API endpoint:', '/api/trips');
        // console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token found');
        // console.log('Request headers:', {
          // 'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'No token'}`
        // });

        const response = await api.post('/api/trips', formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData, let the browser set it with boundary
          }
        });
        console.log("response: ", response)
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

      // ✅ Extra: agar 400 Bad Request aaye to directly validation error show karo
      if (err.response?.status === 400 && err.response.data?.errors) {
        const errors = err.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        const firstError = errors[firstKey];

        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        }
      } else if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        } else if (typeof err.response.data === 'object') {
          const errorObj = err.response.data;
          if (errorObj.errors && typeof errorObj.errors === 'object') {
            const errorKeys = Object.keys(errorObj.errors);
            if (errorKeys.length > 0) {
              const firstError = errorObj.errors[errorKeys[0]];
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



  const onDragStart = (index) => () => { dragFrom.current = index; };
  const onDragEnter = (index) => (e) => { e.preventDefault(); dragTo.current = index; };
  const onDragOver = (e) => e.preventDefault();
  const onDragEnd = () => {
    const from = dragFrom.current;
    const to = dragTo.current;
    dragFrom.current = dragTo.current = null;
    if (from == null || to == null || from === to) return;

    setImageItems(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);

      console.groupCollapsed('[Images] Reordered by drag');
      console.table(arr.map((it, idx) => ({
        idx,
        type: it.type,
        name: it.file?.name || it.url
      })));
      setReordered(true);
      console.groupEnd();

      return arr;
    });
  };


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


          <div className="trip-form-section">
            <h3>مقدم الخدمة</h3>
            <div className="trip-form-group">

              <Select
                options={providers}
                value={providers.find((p) => p.value === selectedProvider) || null}
                onChange={(option) => setSelectedProvider(option?.value || "")}
                placeholder="اختر المزود"
                isSearchable={true}
                isClearable={true}
                filterOption={(option, input) =>
                  (option?.label || "").toLowerCase().includes(input.toLowerCase())
                }
              />

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
                  required
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
                  required
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
                  required
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
                  required
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="trip-form-section">
            <h3>صور الرحلة</h3>

            {/* 🆕 Remove All Button */}
            {imageItems.length > 0 && (
              <button
                type="button"
                className="trip-remove-all-btn"
                onClick={() => setImageItems([])}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 08px',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  alignSelf: 'flex-start'
                }}
              >
                حذف جميع الصور
              </button>
            )}
            <div className="trip-images-upload">

              <div className="trip-images-preview">
                {imageItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="trip-image-preview-item"
                    draggable
                    onDragStart={onDragStart(index)}
                    onDragEnter={onDragEnter(index)}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                    title="Drag to reorder"
                  >

                    {item.preview && (
                      <img src={item.preview} alt={`Preview ${index + 1}`} className="trip-preview-image" />
                    )}

                    <button type="button" className="trip-remove-image-btn" onClick={() => removeImage(index)}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <span className="trip-drag-handle">⋮⋮</span>
                  </div>
                ))}

                <div className="trip-upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                  <FontAwesomeIcon icon={faUpload} />
                  <p>اضغط لاختيار صور</p>
                  <span>يمكنك اختيار صور غير محدودة</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
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
                        required
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
                      onClick={() => removeOption(option.id)}
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


              {packages.map((pkg, index) => {

                return (
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
                          min="1"
                          required
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


                )
              })}

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
      </div >

      <SuccessModal
        isVisible={showSuccessModal}
        message={successMessage}
        onClose={() => {
          setShowSuccessModal(false);
        }}
      />
    </div >
  );
};

export default TripForm; 