import React, { useEffect, useState } from 'react';
import ProvidersList from './ProvidersList';
import ProviderDetails from './ProviderDetails';
import ProviderForm from './ProviderForm';
import TripDetails from '../Trips/TripDetails';
import BookingDetails from '../Bookings/BookingDetails';
import './ProvidersDashboard.css';
import TripForm from '../Trips/TripForm';
import { useLocation } from 'react-router-dom';

const ProvidersDashboard = () => {
  const location = useLocation();
  const { providerId, tripId, bookingId } = location.state || {};
  console.log("navigation state: ", providerId, tripId, bookingId)

  const [currentView, setCurrentView] = useState('list');
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);


  useEffect(() => {
    if (providerId) {
      setSelectedProviderId(providerId);
      setCurrentView("details");
    }
    if (tripId) {
      setSelectedTripId(tripId);
      setCurrentView("trip-details");
    }
    if (bookingId) {
      setSelectedBookingId(bookingId);
      setCurrentView("booking-details");
    }
  }, [providerId, tripId, bookingId]);

  const handleViewProvider = (providerId) => {
    setSelectedProviderId(providerId);
    setCurrentView('details');
  };

  const handleEditProvider = (providerId) => {
    setSelectedProviderId(providerId);
    setCurrentView('form');
  };


  const handleCreateProvider = () => {
    setSelectedProviderId(null);
    setCurrentView('form');
  };



  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProviderId(null);
    setSelectedTripId(null);
    setSelectedBookingId(null);
  };

  const handleBackToTripDetails = () => {
    setCurrentView('trip-details');
    setSelectedBookingId(null);
  }


  const handleFormSuccess = () => {
    setCurrentView('list');
    setSelectedProviderId(null);
  };

  // Navigation handlers for trips and bookings
  const handleViewTrip = (tripId) => {
    setSelectedTripId(tripId);
    setCurrentView('trip-details');
  };

  const handleViewBooking = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCurrentView('booking-details');
  };

  const handleBackToProvider = () => {
    setCurrentView('details');
    setSelectedTripId(null);
    setSelectedBookingId(null);
  };

  //remember to edit the trip navigation back to provider details
  const handleEditTrip = (tripId) => {
    setSelectedTripId(tripId);
    setCurrentView('trip-form');
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <ProvidersList
            onViewProvider={handleViewProvider}
            onEditProvider={handleEditProvider}
            onCreateProvider={handleCreateProvider}
          />
        );

      case 'details':
        return (
          <ProviderDetails
            providerId={selectedProviderId}
            onBack={handleBackToList}
            onViewTrip={handleViewTrip}
            onViewBooking={handleViewBooking}
          />
        );

      case 'form':
        return (
          <ProviderForm
            providerId={selectedProviderId}
            onBack={handleBackToList}
            onSuccess={handleFormSuccess}
          />
        );

      case 'trip-details':
        return (
          <TripDetails
            tripId={selectedTripId}
            onBack={handleBackToProvider}
            onEdit={handleEditTrip} 
          />
        );

      case 'booking-details':
        return (
          <BookingDetails
            bookingId={selectedBookingId}
            onBack={handleBackToProvider}
            onEdit={() => { }} 
            onViewCustomer={() => { }} 
            onViewProvider={() => { }} 
            onViewTrip={() => { }} 
          />
        );

      case 'trip-form':
        return (
          <TripForm
            tripId={selectedTripId}
            onBack={handleBackToTripDetails}
          // onSuccess={handleFormSuccess}
          />
        );

      default:
        return (
          <ProvidersList
            onViewProvider={handleViewProvider}
            onEditProvider={handleEditProvider}
            onCreateProvider={handleCreateProvider}
          />
        );
    }
  };

  return (
    <div className="providers-dashboard">
      {renderCurrentView()}
    </div>
  );
};

export default ProvidersDashboard; 