import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ 
  isVisible, 
  onClose, 
  onConfirm, 
  title = 'تأكيد الحذف',
  message = 'هل أنت متأكد من أنك تريد حذف هذا العنصر؟',
  itemName = '',
  loading = false 
}) => {
  if (!isVisible) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal-header">
          <div className="delete-modal-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <button className="delete-modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="delete-modal-content">
          <h3>{title}</h3>
          <p>
            {message}
            {itemName && (
              <span className="delete-item-name"> "{itemName}"</span>
            )}
          </p>
          <p className="delete-warning">
            هذا الإجراء لا يمكن التراجع عنه.
          </p>
        </div>
        
        <div className="delete-modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </button>
          <button 
            className="btn btn-danger" 
            onClick={onConfirm}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTrash} />
            {loading ? 'جاري الحذف...' : 'حذف'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal; 