import { useState, useEffect, useRef } from 'react';
import { getConversation, sendMessage, markAsRead } from '../services/messageApi';
import { useAuth } from '../context/AuthContext';

const Conversation = ({ otherUser, onMessageSent }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const conversationRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getConversation(otherUser.userId);
        // Ensure data is an array and log for debugging
        console.log('Fetched messages:', data);
        if (Array.isArray(data) && data.length > 0) {
          // Filter out any invalid messages
          const validMessages = data.filter(msg => msg && msg.content);
          setMessages(validMessages);
          if (validMessages.length > 0) {
            await markAsRead(otherUser.userId);
          }
        } else {
          setMessages([]);
        }
      } catch (err) {
        // If no conversation exists yet, that's okay - just show empty state
        console.error('Error fetching messages:', err);
        setMessages([]);
        // Only show error if it's not a 404 or empty conversation
        if (err.message && !err.message.includes('404') && !err.message.includes('No messages')) {
          setError(err.message || 'Failed to load messages');
        }
      } finally {
        setLoading(false);
      }
    };

    if (otherUser && otherUser.userId) {
      fetchMessages();
    }
  }, [otherUser?.userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      setError('');
      const response = await sendMessage({
        receiverId: otherUser.userId,
        content: newMessage.trim(),
      });
      
      // Add the new message to the list
      const newMsg = response.data || response;
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
      }
      
      setNewMessage('');
      
      // Refresh messages to get the latest
      const updatedMessages = await getConversation(otherUser.userId);
      if (Array.isArray(updatedMessages)) {
        setMessages(updatedMessages);
      }
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{otherUser.role}</p>
          </div>
          {otherUser.email && (
            <a
              href={`mailto:${otherUser.email}`}
              className="text-sm text-[--color-naukri-green] hover:text-[--color-naukri-green-dark]"
            >
              {otherUser.email}
            </a>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={conversationRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            // Extract message properties with fallbacks
            const messageId = message?.id || `msg-${index}`;
            const senderId = message?.senderId || message?.sender?.id || null;
            const content = message?.content || '';
            const createdAt = message?.createdAt || new Date().toISOString();
            
            // Skip if no content
            if (!content) {
              return null;
            }
            
            const isOwn = senderId === user?.id;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showDate =
              index === 0 ||
              (prevMessage?.createdAt && 
               new Date(createdAt).toDateString() !==
                new Date(prevMessage.createdAt).toDateString());

            return (
              <div key={messageId}>
                {showDate && (
                  <div className="text-center text-xs text-gray-500 my-4">
                    {formatDate(createdAt)}
                  </div>
                )}
                <div
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-naukri-green text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          }).filter(Boolean)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-naukri-green] focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-naukri-green text-white px-6 py-2 rounded-lg hover:bg-[--color-naukri-green-dark] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Conversation;

