import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getConversations } from '../services/messageApi';
import Conversation from '../components/Conversation';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await getConversations();
        setConversations(data);
      } catch (err) {
        setError(err.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Auto-select conversation from URL parameter or create new one
  useEffect(() => {
    const userIdParam = searchParams.get('user');
    const userNameParam = searchParams.get('name');
    const userEmailParam = searchParams.get('email');
    const userRoleParam = searchParams.get('role');
    
    if (userIdParam) {
      const userId = parseInt(userIdParam);
      
      // Check if conversation already exists
      const existingConversation = conversations.find((c) => c.userId === userId);
      
      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else if (userNameParam && userEmailParam && userRoleParam) {
        // Create a new conversation object for starting a new conversation
        const newConversation = {
          userId: userId,
          name: decodeURIComponent(userNameParam),
          email: decodeURIComponent(userEmailParam),
          role: decodeURIComponent(userRoleParam),
          lastMessage: 'Start a new conversation',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        };
        setSelectedConversation(newConversation);
      }
    }
  }, [searchParams, conversations]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleMessageSent = () => {
    // Refresh conversations to update last message
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
        // Update selected conversation
        const updated = data.find((c) => c.userId === selectedConversation?.userId);
        if (updated) {
          setSelectedConversation(updated);
        }
      } catch (err) {
        console.error('Failed to refresh conversations:', err);
      }
    };
    fetchConversations();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start messaging from the Applications page</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.userId}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                        selectedConversation?.userId === conversation.userId ? 'bg-primary-50 border-l-4 border-naukri-green' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.name}
                            </h3>
                            {conversation.unreadCount > 0 && (
                              <span className="flex-shrink-0 bg-naukri-green text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conversation View */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Conversation
                otherUser={selectedConversation}
                onMessageSent={handleMessageSent}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

