import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './SuccessModal.css';

const SuccessModal = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        <div className="success-modal-icon">
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        <div className="success-modal-content">
          <h3>تم بنجاح!</h3>
          <p>{message}</p>
        </div>
        <button className="success-modal-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default SuccessModal; 