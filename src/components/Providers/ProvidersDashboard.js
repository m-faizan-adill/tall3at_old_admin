import React, { useState } from 'react';
import ProvidersList from './ProvidersList';
import ProviderDetails from './ProviderDetails';
import ProviderForm from './ProviderForm';
import TripDetails from '../Trips/TripDetails';
import BookingDetails from '../Bookings/BookingDetails';
import './ProvidersDashboard.css';

const ProvidersDashboard = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

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
            onEdit={() => {}} // You can implement trip edit if needed
          />
        );

      case 'booking-details':
        return (
          <BookingDetails
            bookingId={selectedBookingId}
            onBack={handleBackToProvider}
            onEdit={() => {}} // You can implement booking edit if needed
            onViewCustomer={() => {}} // You can implement customer view if needed
            onViewProvider={() => {}} // You can implement provider view if needed
            onViewTrip={() => {}} // You can implement trip view if needed
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