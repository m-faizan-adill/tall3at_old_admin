import React, { useState, useEffect, useRef } from 'react';
import { fetchMessages } from '../../services/chatApi';
import { API_CONFIG } from '../../constants/config';
import './ChatWindow.css';

const ChatWindow = ({ selectedConversation, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, totalPages: 1 });
  const [renderError, setRenderError] = useState(null);
  const messagesEndRef = useRef(null);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/images/default-avatar.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_CONFIG.BASE_URL}${imagePath}`;
  };

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedConversation?.user1?.id, selectedConversation?.user2?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadMessages() {
    if (!selectedConversation) return;
    
    setLoading(true);
    setError(null);
    try {
      // Debug: Log the conversation structure
      console.log('Selected conversation:', selectedConversation);
      console.log('All conversation properties:', Object.keys(selectedConversation));
      
      // Extract user IDs from the conversation - try different possible structures
      let userId1, userId2;
      
      if (selectedConversation.user1 && selectedConversation.user2) {
        // If we have user objects
        console.log('Using user1/user2 objects');
        userId1 = selectedConversation.user1.id;
        userId2 = selectedConversation.user2.id;
      } else if (selectedConversation.user1Id && selectedConversation.user2Id) {
        // If we have direct ID properties
        console.log('Using user1Id/user2Id properties');
        userId1 = selectedConversation.user1Id;
        userId2 = selectedConversation.user2Id;
      } else if (selectedConversation.participants && Array.isArray(selectedConversation.participants) && selectedConversation.participants.length >= 2) {
        // If we have participants array
        console.log('Using participants array');
        userId1 = selectedConversation.participants[0]?.id;
        userId2 = selectedConversation.participants[1]?.id;
      } else {
        // Try to find any ID-like properties
        console.log('Trying to find ID properties in conversation');
        const allProps = Object.keys(selectedConversation);
        const idProps = allProps.filter(prop => prop.toLowerCase().includes('id'));
        console.log('ID-like properties found:', idProps);
        
        // Look for any properties that might contain user IDs
        for (const prop of idProps) {
          console.log(`${prop}:`, selectedConversation[prop]);
        }
      }
      
      console.log('Extracted user IDs:', { userId1, userId2 });
      
      if (!userId1 || !userId2) {
        throw new Error('لا يمكن تحديد معرفات المستخدمين');
      }
      
      console.log('Making API call with:', { userId1, userId2, page: pagination.page, pageSize: pagination.pageSize });
      
      const res = await fetchMessages(userId1, userId2, {
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      
      console.log('API response:', res);
      
      // Handle the nested response structure
      const messagesData = res.messages || res.data || [];
      const paginationData = res.pagination || {};
      
      setMessages(messagesData);
      setPagination(p => ({ ...p, totalPages: paginationData.totalPages || 1 }));
    } catch (e) {
      console.error('Error loading messages:', e);
      setError(e.message || 'خطأ في تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function formatMessageTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ar-EG', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getOtherUser() {
    if (!selectedConversation) return null;
    if (selectedConversation.user1?.role === 'admin') return selectedConversation.user2;
    return selectedConversation.user1;
  }

  function openImageFullscreen(imageUrl) {
    // Create a modal to show the image in full screen
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="image-modal-overlay">
        <div class="image-modal-content">
          <button class="image-modal-close">
            <i className="fas fa-times"></i>
          </button>
          <img src="${imageUrl}" alt="صورة" class="image-modal-image" />
        </div>
      </div>
    `;
    
    // Add click handlers
    modal.querySelector('.image-modal-overlay').addEventListener('click', () => {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    });
    
    modal.querySelector('.image-modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    });
    
    // Add to body
    document.body.appendChild(modal);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  function openLocationInMaps(latitude, longitude, locationName) {
    // Open Google Maps with the location
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(mapsUrl, '_blank');
  }

  // Error boundary for render errors
  if (renderError) {
    return (
      <div className="chat-window-empty">
        <div className="empty-chat-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>خطأ في عرض المحادثة</h3>
        <p>حدث خطأ أثناء تحميل المحادثة</p>
        <button 
          className="retry-btn" 
          onClick={() => setRenderError(null)}
          style={{ marginTop: '16px' }}
        >
          <i className="fas fa-redo"></i>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // Wrap the entire render in try-catch
  try {
    if (!selectedConversation) {
      return (
        <div className="chat-window-empty">
          <div className="empty-chat-icon">
            <i className="fas fa-comments"></i>
          </div>
          <h3>اختر محادثة</h3>
          <p>اختر محادثة من القائمة لعرض الرسائل</p>
        </div>
      );
    }

    const otherUser = getOtherUser();

    // Safety check for otherUser
    if (!otherUser) {
      return (
        <div className="chat-window-empty">
          <div className="empty-chat-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>خطأ في تحميل بيانات المستخدم</h3>
          <p>لا يمكن تحميل معلومات المستخدم</p>
        </div>
      );
    }

    return (
      <div className="chat-window">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-user-avatar">
              <img
                src={getImageUrl(otherUser?.profileImage)}
                alt={otherUser?.fullName || 'مستخدم'}
                onError={e => { e.target.src = '/assets/images/users.png'; }}
              />
              <div className="user-status-indicator online"></div>
            </div>
            <div className="chat-user-details">
              <h3 className="chat-user-name">{otherUser?.fullName || 'مستخدم'}</h3>
              <span className="chat-user-role">
                {otherUser?.role === 'provider' ? 'مزود خدمة' : otherUser?.role === 'customer' ? 'عميل' : 'مستخدم'}
              </span>
            </div>
          </div>
          <div className="chat-actions">
            <button className="chat-action-btn" title="البحث في المحادثة">
              <i className="fas fa-search"></i>
            </button>
            <button className="chat-action-btn" title="المزيد من الخيارات">
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-container">
          {loading ? (
            <div className="messages-loading">
              <div className="loading-spinner"></div>
              <span>جاري تحميل الرسائل...</span>
            </div>
          ) : error ? (
            <div className="messages-error">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
              <button className="retry-btn" onClick={loadMessages}>
                <i className="fas fa-redo"></i>
                إعادة المحاولة
              </button>
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="messages-empty">
              <div className="empty-messages-icon">
                <i className="fas fa-comment-slash"></i>
              </div>
              <h3>لا توجد رسائل</h3>
              <p>ابدأ المحادثة بإرسال رسالة</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages && messages.map(message => (
                <div
                  key={message.id}
                  className={`message-item ${
                    message.sender.role === 'admin' ? 'sent' : 
                    message.sender.role === 'provider' ? 'provider' : 'received'
                  }`}
                >
                  <div className="message-bubble">
                    {message.messageType === 'text' && (
                      <div className="message-content">
                        {message.content}
                      </div>
                    )}
                    
                    {message.messageType === 'image' && (
                      <div className="message-image-container">
                        <img
                          src={getImageUrl(message.fileUrl)}
                          alt="صورة"
                          className="message-image"
                          onClick={() => openImageFullscreen(getImageUrl(message.fileUrl))}
                          title="انقر لعرض الصورة بالحجم الكامل"
                          onError={(e) => {
                            e.target.src = '/assets/images/image-error.png';
                            e.target.onerror = null;
                          }}
                        />
                        {message.content && message.content !== 'Image' && (
                          <div className="message-image-caption">
                            {message.content}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {message.messageType === 'location' && (
                      <div className="message-location-container" onClick={() => openLocationInMaps(message.latitude, message.longitude, message.locationName)}>
                        <div className="location-info-row">
                          <div className="location-marker-icon">
                            <i className="fas fa-map-marker-alt"></i>
                          </div>
                          <div className="location-details">
                            <div className="location-name">{message.locationName || 'موقع مشترك'}</div>
                            <div className="location-coordinates">
                              {message.latitude?.toFixed(6)}, {message.longitude?.toFixed(6)}
                            </div>
                          </div>
                        </div>
                        <button
                          className="location-action-btn"
                          onClick={e => { e.stopPropagation(); openLocationInMaps(message.latitude, message.longitude, message.locationName); }}
                          type="button"
                        >
                          <i className="fas fa-external-link-alt"></i>
                          <span>فتح في الخرائط</span>
                        </button>
                      </div>
                    )}
                    
                    <div className="message-meta">
                      <span className="message-time">
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {message.sender.role === 'admin' && (
                        <span className="message-status">
                          <i className={`fas fa-check-double ${message.isRead ? 'read' : ''}`}></i>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    );
  } catch (e) {
    setRenderError(e.message || 'خطأ في عرض المحادثة');
    return null;
  }
};

export default ChatWindow; 