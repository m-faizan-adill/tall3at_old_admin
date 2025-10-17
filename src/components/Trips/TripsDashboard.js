import React, { useEffect, useState } from 'react';
import TripsList from './TripsList';
import TripDetails from './TripDetails';
import TripForm from './TripForm';
import { useLocation } from 'react-router-dom';

const TripsDashboard = () => {
  const location = useLocation();
  const { view, providerId, tripId, bookingId } = location.state || {};
  console.log("navigation state: ", providerId, tripId, bookingId)

  const [currentView, setCurrentView] = useState('list');
  const [selectedTripId, setSelectedTripId] = useState(null);

    useEffect(() => {
     
      if (tripId) {
        setSelectedTripId(tripId);
        setCurrentView("trip-details");
      }
    
    }, [providerId, tripId, bookingId]);

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