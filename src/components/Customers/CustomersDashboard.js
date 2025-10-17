import React, { useState, useEffect } from 'react';
import CustomersList from './CustomersList';
import CustomerDetails from './CustomerDetails';
import CustomerForm from './CustomerForm';
import BookingDetails from '../Bookings/BookingDetails';

const CustomersDashboard = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      // If we're not on the list view, go back to list
      if (currentView !== 'list') {
        setCurrentView('list');
        setSelectedCustomerId(null);
        setSelectedBookingId(null);
      }
    };

    // Add event listener for browser back button
    window.addEventListener('popstate', handlePopState);

    // Update browser history when view changes
    if (currentView === 'list') {
      // Replace current history entry for list view
      window.history.replaceState({ view: 'list' }, '', '/admin/customers');
    } else {
      // Push new history entry for other views
      window.history.pushState({ view: currentView }, '', '/admin/customers');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentView]);

  // Initialize history on component mount
  useEffect(() => {
    // Set initial history state
    window.history.replaceState({ view: 'list' }, '', '/admin/customers');
  }, []);

  // Handle view changes and update history
  const changeView = (newView, customerId = null, bookingId = null) => {
    setCurrentView(newView);
    setSelectedCustomerId(customerId);
    setSelectedBookingId(bookingId);
  };

  const handleViewCustomer = (customerId) => {
    changeView('details', customerId);
  };

  const handleEditCustomer = (customerId) => {
    changeView('form', customerId);
  };

  const handleCreateCustomer = () => {
    changeView('form');
  };

  const handleBackToList = () => {
    changeView('list');
  };

  const handleSuccess = () => {
    changeView('list');
  };

  const handleViewBooking = (bookingId) => {
    changeView('booking-details', selectedCustomerId, bookingId);
  };

  const handleBackFromBooking = () => {
    changeView('details', selectedCustomerId);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <CustomersList
            onViewCustomer={handleViewCustomer}
            onEditCustomer={handleEditCustomer}
            onCreateCustomer={handleCreateCustomer}
          />
        );
      case 'details':
        return (
          <CustomerDetails
            customerId={selectedCustomerId}
            onBack={handleBackToList}
            onEdit={handleEditCustomer}
            onViewBooking={handleViewBooking}
          />
        );
      case 'booking-details':
        return (
          <BookingDetails
            bookingId={selectedBookingId}
            onBack={handleBackFromBooking}
            onEdit={() => {}} // You can implement edit booking if needed
            onViewCustomer={() => {}} // You can implement view customer if needed
            onViewProvider={() => {}} // You can implement view provider if needed
            onViewTrip={() => {}} // You can implement view trip if needed
          />
        );
      case 'form':
        return (
          <CustomerForm
            customerId={selectedCustomerId}
            onBack={handleBackToList}
            onSuccess={handleSuccess}
          />
        );
      default:
        return (
          <CustomersList
            onViewCustomer={handleViewCustomer}
            onEditCustomer={handleEditCustomer}
            onCreateCustomer={handleCreateCustomer}
          />
        );
    }
  };

  return (
    <div className="customers-dashboard">
      {renderCurrentView()}
    </div>
  );
};

export default CustomersDashboard; 