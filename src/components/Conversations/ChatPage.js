import React, { useState } from 'react';
import ConversationsSidebar from './ConversationsSidebar';
import ChatWindow from './ChatWindow';
import './ChatPage.css';

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  function handleSelectConversation(conversation) {
    setSelectedConversation(conversation);
  }

  function handleMessageSent(message) {
    // Update conversation list if needed
    // This could trigger a refresh of the conversations list
    console.log('Message sent:', message);
  }

  return (
    <div className="chat-page">
      <ConversationsSidebar 
        onSelectConversation={handleSelectConversation}
        selectedConversationId={selectedConversation?.conversationId}
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