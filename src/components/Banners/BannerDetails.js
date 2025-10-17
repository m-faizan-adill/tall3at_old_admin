import React, { useState, useEffect } from 'react';
import { bannersApi } from '../../services/bannersApi';
import ShimmerLoading from '../ShimmerLoading';
import './BannerDetails.css';
import { API_CONFIG } from '../../constants/config';

const BannerDetails = ({ bannerId, onBack, onEdit }) => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trips, setTrips] = useState([]);
  console.log('BannerDetails component initialized with trips:', trips);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [showTrips, setShowTrips] = useState(false);
  console.log('BannerDetails component rendered with bannerId:', showTrips, trips);

  useEffect(() => {
    fetchBannerDetails();
  }, [bannerId]);

  const fetchBannerDetails = async () => {
    try {
      setLoading(true);
      const response = await bannersApi.getBanner(bannerId);
      setBanner(response.data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء جلب تفاصيل البانر');
      console.error('Error fetching banner details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBannerTrips = async () => {
    if (!banner?.tripIds) return;

    try {
      setTripsLoading(true);
      const response = await bannersApi.getBannerTrips(bannerId);
      console.log('Fetched trips:', response.data);
      setTrips(response.data.trips || []);
    } catch (err) {
      console.error('Error fetching banner trips:', err);
    } finally {
      setTripsLoading(false);
    }
  };

  const handleShowTrips = () => {
    if (!showTrips && trips.length === 0) {
      fetchBannerTrips();
    }
    setShowTrips(!showTrips);
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

  if (loading) {
    return <ShimmerLoading />;
  }

  if (error) {
    return (
      <div className="banner-details">
        <div className="error-message">
          <span className="fa fa-exclamation-triangle"></span>
          {error}
        </div>
        <button className="btn btn-secondary" onClick={onBack}>
          <span className="fa fa-arrow-right"></span>
          العودة للقائمة
        </button>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="banner-details">
        <div className="no-data">
          <span className="fa fa-exclamation-circle"></span>
          <p>البانر غير موجود</p>
        </div>
        <button className="btn btn-secondary" onClick={onBack}>
          <span className="fa fa-arrow-right"></span>
          العودة للقائمة
        </button>
      </div>
    );
  }

  return (
    <div className="banner-details">
      <div className="banner-details-header">
        <div className="banner-details-title">
          <h2>تفاصيل البانر</h2>
          <p>معلومات شاملة عن البانر</p>
        </div>
        <div className="banner-details-actions">
          <button className="btn btn-secondary" onClick={onBack}>
            <span className="fa fa-arrow-right"></span>
            العودة للقائمة
          </button>
          <button className="btn btn-primary" onClick={() => onEdit(bannerId)}>
            <span className="fa fa-edit"></span>
            تعديل البانر
          </button>
        </div>
      </div>

      <div className="banner-details-content">
        <div className="banner-details-main">
          <div className="banner-image-section">
            <h3>صورة البانر</h3>
            <div className="banner-image-container">
              {banner.image ? (
                <img
                  src={banner.image.startsWith('http') ? banner.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5030'}${banner.image}`}
                  alt={banner.title || 'Banner'}
                  className="banner-detail-image"
                />
              ) : (
                <div className="no-image-placeholder">
                  <span className="fa fa-image"></span>
                  <p>لا توجد صورة</p>
                </div>
              )}
            </div>
          </div>

          <div className="banner-info-section">
            <h3>معلومات البانر</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>العنوان:</label>
                <span>{banner.title || 'غير محدد'}</span>
              </div>
              <div className="info-item">
                <label>العنوان الفرعي:</label>
                <span>{banner.subtitle || 'غير محدد'}</span>
              </div>
              <div className="info-item">
                <label>الرابط:</label>
                <span>
                  {banner.link ? (
                    <a href={banner.link} target="_blank" rel="noopener noreferrer">
                      {banner.link}
                      <span className="fa fa-external-link"></span>
                    </a>
                  ) : (
                    'غير محدد'
                  )}
                </span>
              </div>
              <div className="info-item">
                <label>تاريخ الإنشاء:</label>
                <span>{formatDate(banner.createdAt)}</span>
              </div>
              <div className="info-item">
                <label>معرف البانر:</label>
                <span className="banner-id">#{banner.id}</span>
              </div>
            </div>
          </div>

          <div className="banner-trips-section">
            <div className="section-header">
              <h3>الطلعات المرتبطة</h3>
              {banner.tripIds && (
                <button
                  className="btn btn-sm btn-outline"
                  onClick={handleShowTrips}
                >
                  <span className={`fa ${showTrips ? 'fa-chevron-up' : 'fa-chevron-down'}`}></span>
                  {showTrips ? 'إخفاء الطلعات' : 'عرض الطلعات'}
                </button>
              )}
            </div>

            {banner.tripIds ? (
              <div className="trips-info">
                <div className="trip-count-badge">
                  <span className="fa fa-route"></span>
                  {banner.tripIds.split(',').length} طلعة مرتبطة
                </div>

                {showTrips && (
                  <div className="trips-list">
                    {tripsLoading ? (
                      <div className="loading-trips">
                        <span className="fa fa-spinner fa-spin"></span>
                        جاري تحميل الطلعات...
                      </div>
                    ) : trips.length > 0 ? (
                      <div className="trips-grid">
                        {trips.map((trip) => (
                          <div key={trip.id} className="trip-card">
                            <div className="trip-image">
                              {trip.images ? (
                                <img
                                  src={`${API_CONFIG.BASE_URL}${trip.images.split(',')[0]}`}
                                  alt={trip.title}
                                />
                              ) : (
                                <div className="no-trip-image">
                                  <span className="fa fa-image"></span>
                                </div>
                              )}
                            </div>
                            <div className="trip-info">
                              <h4>{trip.title}</h4>
                              <p className="trip-description">
                                {trip.description?.substring(0, 100)}...
                              </p>
                              <div className="trip-meta">
                                <span className="trip-price">
                                  {trip.packages && trip.packages.length > 0 && trip.packages[0].cost}
                                </span>
                              </div>
                              <div className="trip-location">
                                <span className="fa fa-map-marker"></span>
                                {trip.cityName || 'غير محدد'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-trips">
                        <span className="fa fa-info-circle"></span>
                        <p>لا توجد طلعات نشطة مرتبطة بهذا البانر</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-trips-info">
                <span className="fa fa-info-circle"></span>
                <p>لا توجد طلعات مرتبطة بهذا البانر</p>
              </div>
            )}
          </div>
        </div>

        <div className="banner-details-sidebar">
          <div className="banner-stats">
            <h3>إحصائيات البانر</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">
                  <span className="fa fa-calendar"></span>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{formatDate(banner.createdAt).split(' ')[0]}</div>
                  <div className="stat-label">تاريخ الإنشاء</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <span className="fa fa-route"></span>
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {banner.tripIds ? banner.tripIds.split(',').length : 0}
                  </div>
                  <div className="stat-label">الطلعات المرتبطة</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <span className="fa fa-link"></span>
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {banner.link ? 'نعم' : 'لا'}
                  </div>
                  <div className="stat-label">يحتوي على رابط</div>
                </div>
              </div>
            </div>
          </div>

          <div className="banner-actions">
            <h3>الإجراءات السريعة</h3>
            <div className="action-buttons">
              <button className="btn btn-primary btn-block" onClick={() => onEdit(bannerId)}>
                <span className="fa fa-edit"></span>
                تعديل البانر
              </button>
              <button className="btn btn-secondary btn-block" onClick={onBack}>
                <span className="fa fa-arrow-right"></span>
                العودة للقائمة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default BannerDetails; 