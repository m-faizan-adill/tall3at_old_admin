import React, { useState } from 'react';
import CategoriesList from './CategoriesList';
import CategoryDetails from './CategoryDetails';
import CategoryForm from './CategoryForm';

const CategoriesDashboard = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const handleViewDetails = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setCurrentView('details');
  };

  const handleEdit = (categoryId = null) => {
    setSelectedCategoryId(categoryId);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCategoryId(null);
  };

  const handleFormSuccess = () => {
    setCurrentView('list');
    setSelectedCategoryId(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'details':
        return (
          <CategoryDetails
            categoryId={selectedCategoryId}
            onBack={handleBackToList}
            onEdit={handleEdit}
          />
        );
      case 'form':
        return (
          <CategoryForm
            categoryId={selectedCategoryId}
            onBack={handleBackToList}
            onSuccess={handleFormSuccess}
          />
        );
      default:
        return (
          <CategoriesList
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
        );
    }
  };

  return (
    <div className="categories-dashboard">
      {renderCurrentView()}
    </div>
  );
};

export default CategoriesDashboard; 