import React, { useState } from 'react';
import BookingsList from './BookingsList';
import BookingDetails from './BookingDetails';
import BookingForm from './BookingForm';
import CustomerDetails from '../Customers/CustomerDetails';
import ProviderDetails from '../Providers/ProviderDetails';
import TripDetails from '../Trips/TripDetails';
import './BookingsList.css';

const BookingsDashboard = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const handleViewBooking = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCurrentView('details');
  };

  const handleEditBooking = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCurrentView('form');
  };

  const handleCreateBooking = () => {
    setSelectedBookingId(null);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedBookingId(null);
    setSelectedCustomerId(null);
    setSelectedProviderId(null);
    setSelectedTripId(null);
  };

  const handleFormSuccess = () => {
    setCurrentView('list');
    setSelectedBookingId(null);
  };

  // Navigation handlers for view buttons
  const handleViewCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    setCurrentView('customer-details');
  };

  const handleViewProvider = (providerId) => {
    setSelectedProviderId(providerId);
    setCurrentView('provider-details');
  };

  const handleViewTrip = (tripId) => {
    setSelectedTripId(tripId);
    setCurrentView('trip-details');
  };

  const handleBackToBooking = () => {
    setCurrentView('details');
    setSelectedCustomerId(null);
    setSelectedProviderId(null);
    setSelectedTripId(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <BookingsList
            onViewBooking={handleViewBooking}
            onEditBooking={handleEditBooking}
            onCreateBooking={handleCreateBooking}
          />
        );
      case 'details':
        return (
          <BookingDetails
            bookingId={selectedBookingId}
            onBack={handleBackToList}
            onEdit={handleEditBooking}
            onViewCustomer={handleViewCustomer}
            onViewProvider={handleViewProvider}
            onViewTrip={handleViewTrip}
          />
        );
      case 'form':
        return (
          <BookingForm
            bookingId={selectedBookingId}
            onBack={handleBackToList}
            onSuccess={handleFormSuccess}
          />
        );
      case 'customer-details':
        return (
          <CustomerDetails
            customerId={selectedCustomerId}
            onBack={handleBackToBooking}
            onEdit={() => {}} // You can implement customer edit if needed
          />
        );
      case 'provider-details':
        return (
          <ProviderDetails
            providerId={selectedProviderId}
            onBack={handleBackToBooking}
            onEdit={() => {}} // You can implement provider edit if needed
          />
        );
      case 'trip-details':
        return (
          <TripDetails
            tripId={selectedTripId}
            onBack={handleBackToBooking}
            onEdit={() => {}} // You can implement trip edit if needed
          />
        );
      default:
        return (
          <BookingsList
            onViewBooking={handleViewBooking}
            onEditBooking={handleEditBooking}
            onCreateBooking={handleCreateBooking}
          />
        );
    }
  };

  return (
    <div className="bookings-dashboard">
      {renderCurrentView()}
    </div>
  );
};

export default BookingsDashboard; 