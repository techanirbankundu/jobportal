import API_BASE_URL from '../config/api.js';
import { getAuthHeader } from '../utils/token.js';

/**
 * Send a message
 * @param {Object} messageData - Message data
 * @param {number|string} messageData.receiverId - Receiver user ID
 * @param {string} messageData.content - Message content
 * @param {number|string} [messageData.jobId] - Optional job ID
 * @returns {Promise<Object>} Sent message data
 */
export const sendMessage = async (messageData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(messageData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message');
    }

    return data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

/**
 * Get conversation between two users
 * @param {number|string} otherUserId - Other user's ID
 * @returns {Promise<Array>} Array of messages
 */
export const getConversation = async (otherUserId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${otherUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If 404, return empty array instead of throwing error
      if (response.status === 404) {
        return [];
      }
      throw new Error(data.error || 'Failed to get conversation');
    }

    // Ensure we return an array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Get conversation error:', error);
    // Return empty array on error instead of throwing
    return [];
  }
};

/**
 * Get all conversations for current user
 * @returns {Promise<Array>} Array of conversations with last message
 */
export const getConversations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get conversations');
    }

    return data;
  } catch (error) {
    console.error('Get conversations error:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 * @param {number|string} otherUserId - Other user's ID
 * @returns {Promise<Object>} Success message
 */
export const markAsRead = async (otherUserId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${otherUserId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to mark messages as read');
    }

    return data;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

