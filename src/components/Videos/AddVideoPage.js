import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faVideo, 
  faUpload,
  faCheckCircle,
  faExclamationTriangle,
  faSearch,
  faRoute,
  faUser,
  faMoneyBillWave,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import VideoUpload from '../Trips/VideoUpload';
import api from '../../services/api';
import './AddVideoPage.css';

const AddVideoPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [showUploadSection, setShowUploadSection] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [trips, searchTerm]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/trips?pageSize=1000');
      setTrips(response.data.data || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTrips = () => {
    let filtered = trips;

    if (searchTerm) {
      filtered = filtered.filter(trip => 
        (trip.title && trip.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trip.titleEn && trip.titleEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trip.providerName && trip.providerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trip.cityName && trip.cityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trip.categoryName && trip.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredTrips(filtered);
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setShowUploadSection(true);
  };

  const handleVideoUploaded = (videoData) => {
    alert('تم رفع الفيديو بنجاح!');
    navigate('/admin/videos');
  };

  const handleVideoDeleted = () => {
    alert('تم حذف الفيديو بنجاح!');
    navigate('/admin/videos');
  };

  const handleBack = () => {
    if (showUploadSection) {
      setShowUploadSection(false);
      setSelectedTrip(null);
    } else {
      navigate('/admin/videos');
    }
  };

  const handleNewTrip = () => {
    setSelectedTrip(null);
    setShowUploadSection(false);
  };

  if (loading) {
    return (
      <div className="add-video-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري تحميل الطلعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-video-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <button onClick={handleBack} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} />
            {showUploadSection ? 'العودة لاختيار الطلعة' : 'العودة للفيديوهات'}
          </button>
          <div className="header-title">
            <FontAwesomeIcon icon={faVideo} className="header-icon" />
            <h1>{showUploadSection ? 'رفع فيديو للطلعة' : 'اختر الطلعة لرفع الفيديو'}</h1>
          </div>
        </div>
      </div>

      {!showUploadSection ? (
        /* Trip Selection Section */
        <div className="trip-selection-section">
          <div className="selection-info">
            <FontAwesomeIcon icon={faRoute} className="info-icon" />
            <h2>اختر الطلعة</h2>
            <p>اختر الطلعة التي تريد رفع فيديو لها</p>
          </div>

          {/* Search */}
          <div className="search-section">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
                             <input
                 type="text"
                 placeholder="البحث في الطلعات، المزودين، المدن، أو الفئات..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="search-input"
               />
            </div>
          </div>

          {/* Trips Grid */}
          <div className="trips-grid">
            {filteredTrips.length === 0 ? (
              <div className="no-trips">
                <FontAwesomeIcon icon={faExclamationTriangle} className="no-trips-icon" />
                <h3>لا توجد طلعات</h3>
                <p>
                  {searchTerm 
                    ? 'لا توجد طلعات تطابق البحث'
                    : 'لم يتم إنشاء أي طلعات بعد'
                  }
                </p>
              </div>
            ) : (
              filteredTrips.map(trip => (
                <div key={trip.id} className="trip-card" onClick={() => handleTripSelect(trip)}>
                  <div className="trip-image">
                    {trip.images && trip.images.length > 0 ? (
                      <img 
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:5030'}${trip.images[0]}`}
                        alt={trip.title || trip.titleEn}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="trip-image-placeholder"
                      style={{ 
                        display: !trip.images || trip.images.length === 0 ? 'flex' : 'none'
                      }}
                    >
                      <FontAwesomeIcon icon={faRoute} />
                    </div>
                  </div>
                  
                                     <div className="trip-info">
                     <div className="trip-title">
                       <h3>{trip.title || trip.titleEn || 'Untitled Trip'}</h3>
                       <span className="trip-id">#{trip.id}</span>
                     </div>
                     
                     <div className="trip-meta">
                       <div className="meta-item">
                         <FontAwesomeIcon icon={faUser} />
                         <span>{trip.providerName || 'Unknown Provider'}</span>
                       </div>
                       <div className="meta-item">
                         <FontAwesomeIcon icon={faMoneyBillWave} />
                         <span>{trip.price} ريال</span>
                       </div>
                       {trip.cityName && (
                         <div className="meta-item">
                           <FontAwesomeIcon icon={faMapMarkerAlt} />
                           <span>{trip.cityName}</span>
                         </div>
                       )}
                       {trip.categoryName && (
                         <div className="meta-item">
                           <FontAwesomeIcon icon={faRoute} />
                           <span>{trip.categoryName}</span>
                         </div>
                       )}
                     </div>
                    
                    <div className="trip-actions">
                      <button className="select-trip-btn">
                        <FontAwesomeIcon icon={faUpload} />
                        رفع فيديو
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Upload Section */
        <div className="upload-section">
          {/* Selected Trip Info */}
          <div className="selected-trip-info">
            <div className="trip-header">
              <h2>{selectedTrip.title || selectedTrip.titleEn || 'Untitled Trip'}</h2>
              <button onClick={handleNewTrip} className="change-trip-btn">
                تغيير الطلعة
              </button>
            </div>
            
                         <div className="trip-details">
               <div className="trip-meta-grid">
                 <div className="meta-item">
                   <strong>المزود:</strong> {selectedTrip.providerName || 'غير محدد'}
                 </div>
                 <div className="meta-item">
                   <strong>السعر:</strong> {selectedTrip.price} ريال
                 </div>
                 <div className="meta-item">
                   <strong>المدينة:</strong> {selectedTrip.cityName || 'غير محدد'}
                 </div>
                 <div className="meta-item">
                   <strong>الفئة:</strong> {selectedTrip.categoryName || 'غير محدد'}
                 </div>
                 <div className="meta-item">
                   <strong>الحد الأقصى للأشخاص:</strong> {selectedTrip.maxPersons} شخص
                 </div>
                 <div className="meta-item">
                   <strong>الحالة:</strong> 
                   <span className={`status-badge status-${selectedTrip.status?.toLowerCase()}`}>
                     {selectedTrip.status === 'Active' ? 'نشط' : 
                      selectedTrip.status === 'Pending' ? 'في الانتظار' : 
                      selectedTrip.status === 'Disabled' ? 'معطل' : selectedTrip.status}
                   </span>
                 </div>
               </div>
               
               {(selectedTrip.description || selectedTrip.descriptionEn) && (
                 <div className="trip-description">
                   <strong>الوصف:</strong>
                   <p>{selectedTrip.description || selectedTrip.descriptionEn}</p>
                 </div>
               )}
             </div>
          </div>

          {/* Upload Requirements */}
          <div className="upload-requirements">
            <h3>متطلبات الفيديو:</h3>
            <ul>
              <li>
                <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                صيغ مدعومة: MP4, AVI, MOV, WMV, FLV, WEBM
              </li>
              <li>
                <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                الحد الأقصى لحجم الملف: 100 ميجابايت
              </li>
              <li>
                <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                يفضل استخدام صيغة MP4 للحصول على أفضل جودة
              </li>
              <li>
                <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                يمكنك معاينة الفيديو قبل الرفع
              </li>
            </ul>
          </div>

          {/* Video Upload Component */}
          <VideoUpload 
            tripId={selectedTrip.id}
            onVideoUploaded={handleVideoUploaded}
            onVideoDeleted={handleVideoDeleted}
          />

          {/* Tips Section */}
          <div className="tips-section">
            <h3>نصائح لرفع فيديو جيد:</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <h4>📹 جودة الفيديو</h4>
                <p>استخدم دقة عالية (1080p أو أعلى) لعرض أفضل للطلعة</p>
              </div>
              <div className="tip-card">
                <h4>⏱️ مدة الفيديو</h4>
                <p>يفضل أن تكون مدة الفيديو بين 30 ثانية إلى 3 دقائق</p>
              </div>
              <div className="tip-card">
                <h4>🎬 المحتوى</h4>
                <p>ركز على عرض الأماكن والأنشطة المميزة في الطلعة</p>
              </div>
              <div className="tip-card">
                <h4>🔊 الصوت</h4>
                <p>تأكد من جودة الصوت أو استخدم موسيقى خلفية مناسبة</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddVideoPage; 