import React, { useEffect, useState } from 'react';
import { fetchConversations } from '../../services/chatApi';
import { API_CONFIG } from '../../constants/config';
import './ConversationsSidebar.css';

const ConversationsSidebar = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, totalPages: 1 });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/images/default-avatar.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_CONFIG.BASE_URL}/images/profiles/${imagePath}`;
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line
  }, [search, sortOrder, pagination.page]);

  async function loadConversations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchConversations({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search,
        sortOrder,
      });
      setConversations(res.data);
      setPagination(p => ({ ...p, totalPages: res.pagination.totalPages }));
    } catch (e) {
      setError(e.message || 'خطأ في تحميل المحادثات');
    } finally {
      setLoading(false);
    }
  }

  function getOtherUser(conv) {
    // Show the user who is not admin
    if (conv.user1?.role === 'admin') return conv.user2;
    return conv.user1;
  }

  function handleConversationClick(conv) {
    console.log('Conversation clicked:', conv);
    console.log('User1:', conv.user1);
    console.log('User2:', conv.user2);
    console.log('User1Id:', conv.user1Id);
    console.log('User2Id:', conv.user2Id);
    console.log('Participants:', conv.participants);
    
    if (onSelectConversation) {
      onSelectConversation(conv);
    }
  }

  function formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  }

  function getStatusIcon(role) {
    switch (role) {
      case 'provider': return 'fas fa-store';
      case 'customer': return 'fas fa-user';
      default: return 'fas fa-user-circle';
    }
  }

  function getStatusColor(role) {
    switch (role) {
      case 'provider': return '#10b981';
      case 'customer': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  return (
    <aside className="conversations-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-section">
         
          <h2>المحادثات</h2>
          <div className="sidebar-title-badge">
            {conversations.length}
          </div>
        </div>
        
        <div className="sidebar-search-section">
          <div className="search-input-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              className="sidebar-search-input"
              type="text"
              placeholder="البحث في المحادثات..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            />
            {search && (
              <button 
                className="search-clear-btn"
                onClick={() => { setSearch(''); setPagination(p => ({ ...p, page: 1 })); }}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-filters-section">
          <button
            className="sort-toggle-btn"
            onClick={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
            title={`ترتيب ${sortOrder === 'asc' ? 'تنازلي' : 'تصاعدي'}`}
          >
            <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      <div className="sidebar-content">
        {loading ? (
          <div className="sidebar-loading">
            <div className="loading-spinner"></div>
            <span>جاري تحميل المحادثات...</span>
          </div>
        ) : error ? (
          <div className="sidebar-error">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
            <button className="retry-btn" onClick={loadConversations}>
              <i className="fas fa-redo"></i>
              إعادة المحاولة
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="sidebar-empty">
            <div className="empty-icon">
              <i className="fas fa-comment-slash"></i>
            </div>
            <h3>لا توجد محادثات</h3>
            <p>لم يتم العثور على محادثات تطابق معايير البحث</p>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map(conv => {
              const other = getOtherUser(conv);
              const isSelected = selectedConversationId === conv.conversationId;
              
              return (
                <div
                  key={conv.conversationId}
                  className={`conversation-item${isSelected ? ' selected' : ''}`}
                  onClick={() => handleConversationClick(conv)}
                >
                  <div className="conversation-avatar">
                    <img
                      src={getImageUrl(other?.profileImage)}
                      alt={other?.fullName || 'مستخدم'}
                      onError={e => { e.target.src = '/assets/images/users.png'; }}
                    />
                    <div 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(other?.role) }}
                    >
                      <i className={getStatusIcon(other?.role)}></i>
                    </div>
                  </div>
                  
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <div className="conversation-info">
                        <h4 className="conversation-name">{other?.fullName || 'مستخدم'}</h4>
                        <span className="conversation-role">
                          <i className={getStatusIcon(other?.role)}></i>
                          {other?.role === 'provider' ? 'مزود خدمة' : other?.role === 'customer' ? 'عميل' : 'مستخدم'}
                        </span>
                      </div>
                      <div className="conversation-meta">
                        <span className="conversation-time">{formatTime(conv.lastMessageTime)}</span>
                        {conv.unreadCount > 0 && (
                          <span className="unread-badge">{conv.unreadCount}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="conversation-preview">
                      {conv.lastMessage?.content ? (
                        <div className="message-preview">
                          <span className="sender-name">{conv.lastMessage.senderName}:</span>
                          <span className="message-content">
                            {conv.lastMessage.content.slice(0, 50)}
                            {conv.lastMessage.content.length > 50 && '...'}
                          </span>
                        </div>
                      ) : (
                        <span className="no-message">لا توجد رسائل</span>
                      )}
                    </div>
                  </div>
                  
                  {isSelected && <div className="selection-indicator"></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {conversations.length > 0 && (
        <div className="sidebar-pagination">
          <button
            className="pagination-btn"
            disabled={pagination.page <= 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
          <div className="pagination-info">
            <span className="page-number">{pagination.page}</span>
            <span className="page-separator">من</span>
            <span className="total-pages">{pagination.totalPages}</span>
          </div>
          <button
            className="pagination-btn"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
      )}
    </aside>
  );
};

export default ConversationsSidebar; 