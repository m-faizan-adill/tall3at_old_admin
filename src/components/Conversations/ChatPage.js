import React, { useEffect, useState } from 'react';
import ConversationsSidebar from './ConversationsSidebar';
import ChatWindow from './ChatWindow';
import './ChatPage.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [initialConvoId, setInitialConvoId] = useState(null);


  useEffect(() => {
    const openId = location.state?.openConversationId || null;
    if (openId) {
      setInitialConvoId(String(openId));
      // optional: clean the state so it doesn't re-trigger
      navigate(location.pathname + location.search, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  function handleSelectConversation(conversation) {
    setSelectedConversation(conversation);
  }

  function handleMessageSent(message) {
    
    console.log('Message sent:', message);
  }

  return (
    <div className="chat-page">

      <ConversationsSidebar
        onSelectConversation={handleSelectConversation}
        selectedConversationId={selectedConversation?.conversationId}
        initialSelectedConversationId={initialConvoId}
      />

      <div className="chat-main-area">
        <ChatWindow
          selectedConversation={selectedConversation}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
};

export default ChatPage; 