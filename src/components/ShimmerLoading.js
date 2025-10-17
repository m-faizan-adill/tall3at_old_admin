import React from 'react';
import './ShimmerLoading.css';

const ShimmerLoading = ({ type = 'card', count = 1, className = '' }) => {
  // Simple shimmer block for dashboard
  const simpleShimmer = (width = '100%', height = '32px') => (
    <div
      className={`shimmer-simple-block ${className}`}
      style={{ width, height, borderRadius: '12px', margin: '8px 0' }}
    ></div>
  );

  const renderShimmer = () => {
    switch (type) {
      case 'card':
        return simpleShimmer('100%', '64px');
      case 'table-row':
        return simpleShimmer('100%', '32px');
      case 'chart':
        return simpleShimmer('100%', '220px');
      default:
        return simpleShimmer();
    }
  };

  if (count === 1) {
    return renderShimmer();
  }

  return (
    <div className="shimmer-container">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{renderShimmer()}</div>
      ))}
    </div>
  );
};

export default ShimmerLoading; 