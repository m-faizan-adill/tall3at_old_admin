import React, { useState } from 'react';
import TripsList from './TripsList';
import TripDetails from './TripDetails';
import TripForm from './TripForm';

const TripsDashboard = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedTripId, setSelectedTripId] = useState(null);

  const handleViewTrip = (tripId) => {
    setSelectedTripId(tripId);
    setCurrentView('details');
  };

  const handleEditTrip = (tripId) => {
    setSelectedTripId(tripId);
    setCurrentView('form');
  };

  const handleCreateTrip = () => {
    setSelectedTripId(null);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTripId(null);
  };

  const handleSuccess = () => {
    setCurrentView('list');
    setSelectedTripId(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <TripsList
            onViewTrip={handleViewTrip}
            onEditTrip={handleEditTrip}
            onCreateTrip={handleCreateTrip}
          />
        );
      case 'details':
        return (
          <TripDetails
            tripId={selectedTripId}
            onBack={handleBackToList}
            onEdit={handleEditTrip}
          />
        );
      case 'form':
        return (
          <TripForm
            tripId={selectedTripId}
            onBack={handleBackToList}
            onSuccess={handleSuccess}
          />
        );
      default:
        return (
          <TripsList
            onViewTrip={handleViewTrip}
            onEditTrip={handleEditTrip}
            onCreateTrip={handleCreateTrip}
          />
        );
    }
  };

  return (
    <div className="trips-dashboard">
      {renderCurrentView()}
    </div>
  );
};

export default TripsDashboard; 