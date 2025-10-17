import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faMapMarkerAlt, faArrowLeft, faCalendarAlt, faUsers, faMoneyBillWave, faUser, faBox } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';
import SuccessModal from '../SuccessModal';
import './BookingsList.css';
import './BookingForm.css';

const getTripImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-trip.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/default-avatar.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

const initialForm = {
  tripId: '',
  userId: '',
  // providerId: '',
  packageId: null,
  status: 'Provider Pending',
  persons: 1,
  // numOfHours: 1,
  bookingDate: '',
  startTime: '',
  endTime: '',
  notes: 'TEST',
  packageQuantity: 1,
};

const BookingForm = ({ bookingId, onBack, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  // console.log('BookingForm:', form);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState({ isVisible: false, message: '' });
  const [isEdit, setIsEdit] = useState(false);

  // Trip search functionality
  const [trips, setTrips] = useState([]);
  const [tripSearch, setTripSearch] = useState('');
  const [showTripDropdown, setShowTripDropdown] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  // console.log("Selected Trip:", selectedTrip);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Customer search functionality
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Package selection
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (bookingId) {
      setIsEdit(true);
      fetchBooking();
    } else {
      setIsEdit(false);
      setForm(initialForm);
      setSelectedTrip(null);
      setSelectedCustomer(null);
      setSelectedPackage(null);
    }
    // eslint-disable-next-line
  }, [bookingId]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/api/home/home');
        const data = res.data;
        console.log("Fetched home data:", data);
        // Assume API response contains { cities: [], categories: [], trips: [] }
        setCities(data.cities || []);
        setCategories(data.categories || []);
        setTrips(data.trips || []);
      } catch (err) {
        console.error("Error fetching home data:", err);
      }
    };

    fetchHomeData();
  }, []);

  // Handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const tripContainer = document.querySelector('.trip-search-container');
      const customerContainer = document.querySelector('.customer-search-container');

      if (tripContainer && !tripContainer.contains(event.target)) {
        setShowTripDropdown(false);
      }

      if (customerContainer && !customerContainer.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchTrips = async (searchTerm = '') => {
    try {
      setLoadingTrips(true);
      const params = new URLSearchParams({
        cityId: selectedCity,
        categoryId: selectedCategory,
        page: 1,
        pageSize: 20,
        search: searchTerm,
      });
      const response = await api.get(`/api/admin/trips?${params}`);
      setTrips(response.data.data);
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const fetchCustomers = async (searchTerm = '') => {
    try {
      setLoadingCustomers(true);
      const params = new URLSearchParams({
        page: 1,
        pageSize: 20,
        search: searchTerm,
        role: 'customer'
      });
      const response = await api.get(`/api/admin/users?${params}`);
      setCustomers(response.data.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/bookings/${bookingId}`);
      const b = response.data;

      console.log('Fetched booking data:', b);

      // Set selected trip if available
      if (b.trip) {
        setSelectedTrip(b.trip);
        setTripSearch(b.trip.title);
      }

      // Set selected customer if available
      if (b.user) {
        setSelectedCustomer(b.user);
        setCustomerSearch(b.user.fullName);
      }

      // Set selected package if available
      if (b.package) {
        console.log("Setting selected package:", b.package);
        setSelectedPackage(b.package);
      }

      console.log("start and end time from API:", b.startTime, b.endTime);

      setForm({
        tripId: b.tripId || '',
        userId: b.userId || '',
        packageId: b.packageId || '',
        status: b.status || 'Provider Pending',
        persons: b.persons || 1,
        bookingDate: b.bookingDate ? b.bookingDate.split('T')[0] : '',
        startTime: b.startTime ? b.startTime.replace(' ', 'T').substring(0, 16) : '',
        endTime: b.endTime ? b.endTime.replace(' ', 'T').substring(0, 16) : '',
        packageQuantity: b.packageQuantity,
        notes: b.notes || '',
      });
    } catch (err) {
      setError('فشل في تحميل بيانات الحجز');
    } finally {
      setLoading(false);
    }
  };

  const handleTripSearch = (e) => {
    const value = e.target.value;
    setTripSearch(value);
    setShowTripDropdown(true);

    if (value.length >= 2) {
      fetchTrips(value);
    } else {
      setTrips([]);
    }

    if (!value) {
      setSelectedTrip(null);
      setSelectedPackage(null);
      setForm(prev => ({ ...prev, tripId: '', packageId: '' }));
    }
  };

  const handleTripSelect = async (trip) => {
    try {
      setSelectedTrip(trip);
      setForm(prev => ({ ...prev, tripId: trip.id }));

      const res = await api.get(`/api/trips/${trip.id}`);
      setSelectedTrip(res.data);   // full trip details with packages
      setSelectedPackage(null);

    } catch (err) {
      console.error("Error fetching trip details:", err);
    }
  };


  const clearTripSelection = () => {
    setSelectedTrip(null);
    setSelectedPackage(null);
    setTripSearch('');
    setForm(prev => ({ ...prev, tripId: '', packageId: '' }));
    setShowTripDropdown(false);
  };

  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    setShowCustomerDropdown(true);

    if (value.length >= 2) {
      fetchCustomers(value);
    } else {
      setCustomers([]);
    }

    if (!value) {
      setSelectedCustomer(null);
      setForm(prev => ({ ...prev, userId: '' }));
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.fullName);
    setForm(prev => ({ ...prev, userId: customer.id }));
    setShowCustomerDropdown(false);
  };

  const clearCustomerSelection = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setForm(prev => ({ ...prev, userId: '' }));
    setShowCustomerDropdown(false);
  };

  function toLocalDateTimeInputValue(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes())
    );
  }

  const handlePackageSelect = (packageItem) => {
    setSelectedPackage(packageItem);
    setForm((prev) => {
      let newEndTime = prev.endTime;

      if (prev.startTime && packageItem?.numberOfHours) {
        const start = new Date(prev.startTime);
        // start.setMinutes(0, 0, 0);
        const fixedStart = mergeDateAndTime(prev.bookingDate, start);
        fixedStart.setMinutes(0, 0, 0);

        const end = new Date(start);
        end.setHours(end.getHours() + packageItem.numberOfHours);

        newEndTime = toLocalDateTimeInputValue(end);
      }

      return {
        ...prev,
        packageId: packageItem.id,
        endTime: newEndTime,
      };
    });
  };

  const handleStartTimeChange = (e) => {
    const value = e.target.value; // already in "YYYY-MM-DDTHH:mm"
    setForm((prev) => {
      let newEndTime = prev.endTime;
      let newStartTime = value;

      if (selectedPackage?.numberOfHours && value) {
        // const start = new Date(value);
        const selected = new Date(value);

        const start = mergeDateAndTime(prev.bookingDate, selected);


        // ⏰ Round down to nearest hour
        start.setMinutes(0, 0, 0);

        const end = new Date(start);
        end.setHours(end.getHours() + selectedPackage.numberOfHours);

        newStartTime = toLocalDateTimeInputValue(start);
        newEndTime = toLocalDateTimeInputValue(end);
      }

      return {
        ...prev,
        startTime: newStartTime,
        endTime: newEndTime,
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  };



  const formatDateTime = (value, isEdit) => {
    if (!value) return null;
    console.log("Formatting date time:", value, "isEdit:", isEdit);
    if (isEdit) {
      // value expected: "2025-09-14T14:06" from datetime-local
      return value + ":00";  // backend ke liye "YYYY-MM-DDTHH:mm:00"
      // return value.replace('T', ' ') + ":00"; // backend ke liye "YYYY
    } else {
      return value.replace('T', ' ') + ":00"; // backend ke liye "YYYY-MM-DD HH:mm:00" (space wala)
    }
  }

  function mergeDateAndTime(dateStr, timeDateObj) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(
      year,
      month - 1,
      day,
      timeDateObj.getHours(),
      timeDateObj.getMinutes(),
      0,
      0
    );
  }


  const handleSubmit = async (e) => {
    e.preventDefault();


    if (form.status === "Completed" || form.status === "Canceled") {
      setError("لا يمكن تعديل الحجز المكتمل أو الملغي"); // Cannot update completed or canceled bookings
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const payload = {
        TripId: form.tripId,
        UserId: form.userId,
        // PackageId: form.packageId,
        PackageId: form.packageId ? Number(form.packageId) : null, // ✅ int me convert karo

        Persons: form.persons,
        BookingDate: formatDate(form.bookingDate),
        StartTime: formatDateTime(form.startTime, isEdit),
        EndTime: formatDateTime(form.endTime, isEdit),
        Notes: form.notes,
        PackageQuantity: form.packageQuantity,  // 👈 added here

      };

      console.log('Submitting booking payload:', payload);

      if (isEdit) {
        await api.put(`/api/admin/bookings/${bookingId}`, payload);
        setSuccessModal({ isVisible: true, message: 'تم تحديث الحجز بنجاح' });
      } else {
        await api.post(`/api/admin/bookings`, payload,

          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }


        );
        setSuccessModal({ isVisible: true, message: 'تم إضافة الحجز بنجاح' });
      }

      setTimeout(() => {
        setSuccessModal({ isVisible: false, message: '' });
        onSuccess();
      }, 1200);

    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          // Laravel style validation errors
          const errors = err.response.data.errors;
          const errorMessages = Object.values(errors).flat();
          setError(errorMessages);
        } else if (err.response.data.message) {
          // Single message error (e.g. "This time slot is already booked")
          setError(err.response.data.message);
        } else {
          setError('فشل في حفظ بيانات الحجز');
        }
        console.error('Error saving booking:', err.response.data);
      } else {
        setError('فشل في حفظ بيانات الحجز');
        console.error('Error saving booking:', err);
      }
    }

    finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      <div className="booking-form-card">
        <div className="booking-form-header">
          <button className="btn-back" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
            العودة
          </button>
          <h2>{isEdit ? 'تعديل الحجز' : 'إضافة حجز جديد'}</h2>
          <p>{isEdit ? 'تعديل بيانات الحجز المحدد' : 'إضافة حجز جديد للنظام'}</p>
        </div>

        <div className="booking-form-content">
          <form onSubmit={handleSubmit} className="booking-form">
            {/* Trip Selection Section */}
            <div className="booking-form-section">
              <h3 className="booking-form-section-title">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                اختيار الرحلة
              </h3>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="booking-form-select"
              >
                <option value="">اختر المدينة</option>
                {cities && cities.length > 0 && cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="booking-form-select"
              >
                <option value="">اختر الفئة</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>




              <div className="trip-search-container">
                <div className="trip-search-input">
                  <FontAwesomeIcon icon={faSearch} className="trip-search-icon" />
                  <input
                    type="text"
                    placeholder="البحث في الرحلات..."
                    value={tripSearch}
                    onChange={handleTripSearch}
                    onFocus={() => setShowTripDropdown(true)}
                    className="trip-search-field"
                  />
                  {tripSearch && (
                    <button
                      type="button"
                      className="trip-clear-btn"
                      onClick={clearTripSelection}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>

                {showTripDropdown && (
                  <div className="trip-dropdown">
                    {loadingTrips ? (
                      <div className="trip-loading">جاري البحث...</div>
                    ) : trips.length > 0 ? (
                      trips.map(trip => (
                        <div
                          key={trip.id}
                          className={`trip-option ${selectedTrip?.id === trip.id ? 'selected' : ''}`}

                          onClick={() => handleTripSelect(trip)}
                        >
                          <div className="trip-option-image">
                            {trip.images && trip.images.split(',')[0] && (
                              <img
                                src={getTripImageUrl(trip.images.split(',')[0])}
                                alt={trip.title}
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                          </div>
                          <div className="trip-option-details">
                            <div className="trip-option-title">{trip.title}</div>
                            <div className="trip-option-location">
                              <FontAwesomeIcon icon={faMapMarkerAlt} />
                              {trip.cityName}
                            </div>
                            <div className="trip-option-price">
                              <FontAwesomeIcon icon={faMoneyBillWave} />
                              {trip.cost} ريال
                            </div>
                          </div>
                        </div>
                      ))
                    ) : tripSearch.length >= 1 ? (
                      <div className="trip-no-results">لا توجد نتائج</div>
                    ) : null}
                  </div>
                )}
              </div>

              {selectedTrip && (
                <div className="selected-trip-card">
                  <div className="selected-trip-image">
                    {selectedTrip.images && selectedTrip.images.split(',')[0] && (
                      <img
                        src={getTripImageUrl(selectedTrip.images.split(',')[0])}
                        alt={selectedTrip.title}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                  <div className="selected-trip-info">
                    <h4>{selectedTrip.title}</h4>
                    <p>
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      {selectedTrip.cityName}
                    </p>

                  </div>
                </div>
              )}
            </div>

            {/* Package Selection Section */}
            {selectedTrip && selectedTrip.packages && selectedTrip.packages.length > 0 && (
              <div className="booking-form-section">
                <h3 className="booking-form-section-title">
                  <FontAwesomeIcon icon={faBox} />
                  اختيار الباقة
                </h3>

                <div className="package-selection">
                  {selectedTrip.packages.map(pkg => (
                    <div
                      key={pkg.id}
                      className={`package-option ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                      onClick={() => handlePackageSelect(pkg)}
                    >
                      <div className="package-info">
                        <h4>{pkg.name}</h4>
                        <p>{pkg.description}</p>
                        <div className="package-price">
                          <FontAwesomeIcon icon={faMoneyBillWave} />
                          {pkg.cost} ريال
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPackage && (
              <div className="booking-form-section">
                <h3 className="booking-form-section-title">
                  <FontAwesomeIcon icon={faBox} />
                  عدد الباقات
                </h3>

                <div className="package-quantity">
                  <button
                    type="button"
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        packageQuantity: Math.max(1, Number(prev.packageQuantity) - 1),
                      }))
                    }
                  >
                    -
                  </button>
                  <span style={{ margin: "0 10px" }}>{form.packageQuantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        packageQuantity: Number(prev.packageQuantity) + 1,
                      }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Customer Selection Section */}
            <div className="booking-form-section">
              <h3 className="booking-form-section-title">
                <FontAwesomeIcon icon={faUser} />
                اختيار العميل
              </h3>

              <div className="customer-search-container">
                <div className="customer-search-input">
                  <FontAwesomeIcon icon={faSearch} className="customer-search-icon" />
                  <input
                    type="text"
                    placeholder="البحث في العملاء..."
                    value={customerSearch}
                    onChange={handleCustomerSearch}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="customer-search-field"
                  />
                  {customerSearch && (
                    <button
                      type="button"
                      className="customer-clear-btn"
                      onClick={clearCustomerSelection}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>

                {showCustomerDropdown && (
                  <div className="customer-dropdown">
                    {loadingCustomers ? (
                      <div className="customer-loading">جاري البحث...</div>
                    ) : customers.length > 0 ? (
                      customers.map(customer => (
                        <div
                          key={customer.id}
                          className={`customer-option ${selectedCustomer?.id === customer.id ? 'selected' : ''}`}
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="customer-option-image">
                            {customer.profileImage ? (
                              <img
                                src={getImageUrl(customer.profileImage)}
                                alt={customer.fullName}
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            ) : (
                              <div className="customer-avatar-placeholder">
                                <FontAwesomeIcon icon={faUser} />
                              </div>
                            )}
                          </div>
                          <div className="customer-option-details">
                            <div className="customer-option-name">{customer.fullName}</div>
                            <div className="customer-option-phone">{customer.userName}</div>
                            <div className="customer-option-email">{customer.email}</div>
                          </div>
                        </div>
                      ))
                    ) : customerSearch.length >= 2 ? (
                      <div className="customer-no-results">لا توجد نتائج</div>
                    ) : null}
                  </div>
                )}
              </div>

              {selectedCustomer && (
                <div className="selected-customer-card">
                  <div className="selected-customer-image">
                    {selectedCustomer.profileImage ? (
                      <img
                        src={getImageUrl(selectedCustomer.profileImage)}
                        alt={selectedCustomer.fullName}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="customer-avatar-placeholder">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                  </div>
                  <div className="selected-customer-info">
                    <h4>{selectedCustomer.fullName}</h4>
                    <p>{selectedCustomer.userName}</p>
                    <p>{selectedCustomer.email}</p>
                    <p>
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      {selectedCustomer.cityName || "غير محدد"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Details Section */}
            <div className="booking-form-section">
              <h3 className="booking-form-section-title">
                <FontAwesomeIcon icon={faCalendarAlt} />
                تفاصيل الحجز
              </h3>

              <div className="booking-form-grid">
                <div className="booking-form-group">
                  <label className="booking-form-label">
                    <FontAwesomeIcon icon={faUsers} />
                    عدد الأشخاص:
                  </label>
                  <input
                    name="persons"
                    type="number"
                    min="1"
                    value={form.persons}
                    onChange={handleChange}
                    required
                    className="booking-form-input"
                  />
                </div>

                <div className="booking-form-group">
                  <label className="booking-form-label">تاريخ الحجز:</label>
                  <input
                    name="bookingDate"
                    type="date"
                    value={form.bookingDate}
                    onChange={handleChange}
                    required
                    className="booking-form-input"
                  />
                </div>

                <div className="booking-form-group">
                  <label className="booking-form-label">وقت البدء:</label>
                  <input
                    name="startTime"
                    type="datetime-local"
                    value={form.startTime}
                    // onChange={handleChange}
                    onChange={handleStartTimeChange}

                    className="booking-form-input"
                  />
                </div>

                <div className="booking-form-group">
                  <label className="booking-form-label">وقت الانتهاء:</label>
                  <input
                    name="endTime"
                    type="datetime-local"
                    value={form.endTime}
                    // onChange={handleChange}
                    readOnly
                    className="booking-form-input"
                  />
                </div>
              </div>

              <div className="booking-form-group booking-form-full-width">
                <label className="booking-form-label">ملاحظات:</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="booking-form-textarea"
                  placeholder="أضف أي ملاحظات إضافية..."
                  rows="4"
                />
              </div>
            </div>

            {error && <div className="booking-error">{error}</div>}

            <div className="booking-form-actions">
              <button
                type="button"
                className="booking-btn booking-btn-secondary"
                onClick={onBack}
                disabled={loading}
              >
                رجوع
              </button>
              <button
                type="submit"
                className="booking-btn booking-btn-primary"
                disabled={loading}

              >
                {loading ? 'جاري الحفظ...' : (isEdit ? 'تحديث الحجز' : 'إضافة الحجز')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SuccessModal
        message={successModal.message}
        isVisible={successModal.isVisible}
        onClose={() => setSuccessModal({ isVisible: false, message: '' })}
      />
    </div>
  );
};

export default BookingForm;


















