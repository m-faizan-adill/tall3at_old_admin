import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faMapMarkerAlt, faCalendarAlt, faClock, faUsers, faMoneyBillWave, faUser, faBox } from '@fortawesome/free-solid-svg-icons';
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
  providerId: '',
  packageId: '',
  status: 'Provider Pending',
  persons: 1,
  numOfHours: 1,
  bookingDate: '',
  startTime: '',
  endTime: '',
  notes: '',
};

const statusOptions = [
  { value: 'Provider Pending', label: 'في انتظار المزود' },
  { value: 'Pending Payment', label: 'في انتظار الدفع' },
  { value: 'Paid', label: 'مدفوع' },
  { value: 'Completed', label: 'مكتمل' },
  { value: 'Canceled', label: 'ملغي' },
];

const BookingForm = ({ bookingId, onBack, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState({ isVisible: false, message: '' });
  const [isEdit, setIsEdit] = useState(false);
  
  // Trip search functionality
  const [trips, setTrips] = useState([]);
  const [tripSearch, setTripSearch] = useState('');
  const [showTripDropdown, setShowTripDropdown] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loadingTrips, setLoadingTrips] = useState(false);
  
  // Customer search functionality
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  // Package selection
  const [selectedPackage, setSelectedPackage] = useState(null);

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
        page: 1,
        pageSize: 20,
        search: searchTerm
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
        setSelectedPackage(b.package);
      }
      
      setForm({
        tripId: b.tripId || '',
        userId: b.userId || '',
        providerId: b.providerId || '',
        packageId: b.packageId || '',
        status: b.status || 'Provider Pending',
        persons: b.persons || 1,
        numOfHours: b.numOfHours || 1,
        bookingDate: b.bookingDate ? b.bookingDate.split('T')[0] : '',
        startTime: b.startTime ? b.startTime.replace(' ', 'T').substring(0, 16) : '',
        endTime: b.endTime ? b.endTime.replace(' ', 'T').substring(0, 16) : '',
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

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setTripSearch(trip.title);
    setSelectedPackage(null);
    setForm(prev => ({ ...prev, tripId: trip.id, packageId: '' }));
    setShowTripDropdown(false);
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

  const handlePackageSelect = (packageItem) => {
    setSelectedPackage(packageItem);
    setForm(prev => ({ ...prev, packageId: packageItem.id }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const payload = { ...form };
      
      if (isEdit) {
        await api.put(`/api/admin/bookings/${bookingId}`, payload);
        setSuccessModal({ isVisible: true, message: 'تم تحديث الحجز بنجاح' });
      } else {
        await api.post(`/api/admin/bookings`, payload);
        setSuccessModal({ isVisible: true, message: 'تم إضافة الحجز بنجاح' });
      }
      
      setTimeout(() => {
        setSuccessModal({ isVisible: false, message: '' });
        onSuccess();
      }, 1200);
    } catch (err) {
      setError('فشل في حفظ بيانات الحجز');
      console.error('Error saving booking:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      <div className="booking-form-card">
        <div className="booking-form-header">
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
                              {trip.price} ريال
                            </div>
                          </div>
                        </div>
                      ))
                    ) : tripSearch.length >= 2 ? (
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
                    <p>
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                      {selectedTrip.price} ريال
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
                          {pkg.price} ريال
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <label className="booking-form-label">الحالة:</label>
                  <select 
                    name="status" 
                    value={form.status} 
                    onChange={handleChange} 
                    required 
                    className="booking-form-select"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
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
                  <label className="booking-form-label">
                    <FontAwesomeIcon icon={faClock} />
                    عدد الساعات:
                  </label>
                  <input 
                    name="numOfHours" 
                    type="number" 
                    min="1" 
                    value={form.numOfHours} 
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
                    onChange={handleChange} 
                    className="booking-form-input"
                  />
                </div>
                
                <div className="booking-form-group">
                  <label className="booking-form-label">وقت الانتهاء:</label>
                  <input 
                    name="endTime" 
                    type="datetime-local" 
                    value={form.endTime} 
                    onChange={handleChange} 
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


















