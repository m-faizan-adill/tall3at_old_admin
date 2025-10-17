import React, { useState } from 'react';
import BannersList from './BannersList';
import BannerDetails from './BannerDetails';
import BannerForm from './BannerForm';

const BannersDashboard = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedBannerId, setSelectedBannerId] = useState(null);
  console.log('BannersDashboard component rendered with currentView:', currentView, 'selectedBannerId:', selectedBannerId);

  const handleViewBanner = (bannerId) => {
    setSelectedBannerId(bannerId);
    setCurrentView('details');
  };

  const handleEditBanner = (bannerId) => {
    setSelectedBannerId(bannerId);
    setCurrentView('form');
  };

  const handleCreateBanner = () => {
    setSelectedBannerId(null);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedBannerId(null);
  };

  const handleSuccess = () => {
    setCurrentView('list');
    setSelectedBannerId(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <BannersList
            onViewBanner={handleViewBanner}
            onEditBanner={handleEditBanner}
            onCreateBanner={handleCreateBanner}
          />
        );
      case 'details':
        return (
          <BannerDetails
            bannerId={selectedBannerId}
            onBack={handleBackToList}
            onEdit={handleEditBanner}
          />
        );
      case 'form':
        return (
          <BannerForm
            bannerId={selectedBannerId}
            onBack={handleBackToList}
            onSuccess={handleSuccess}
          />
        );
      default:
        return (
          <BannersList
            onViewBanner={handleViewBanner}
            onEditBanner={handleEditBanner}
            onCreateBanner={handleCreateBanner}
          />
        );
    }
  };

  return (
    <div className="banners-dashboard">
      {renderCurrentView()}
    </div>
  );
};

export default BannersDashboard; 