import API_BASE_URL from '../config/api.js';
import { getAuthHeader } from '../utils/token.js';

/**
 * Get user profile
 * @returns {Promise<Object>} User profile data with skills
 */
export const getProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get profile');
    }

    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @param {string} [profileData.name] - User's name
 * @param {string} [profileData.phone] - User's phone
 * @param {string} [profileData.location] - User's location
 * @param {string} [profileData.bio] - User's bio
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Upload CV file
 * @param {File} file - CV file (PDF, DOC, or DOCX)
 * @returns {Promise<Object>} Response with CV URL and updated user data
 */
export const uploadCV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/users/cv/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload CV');
    }

    return data;
  } catch (error) {
    console.error('Upload CV error:', error);
    throw error;
  }
};

/**
 * Add skills to user profile
 * @param {number[]} skillIds - Array of skill IDs to add
 * @returns {Promise<Object>} Response with updated skills
 */
export const addSkills = async (skillIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ skillIds }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add skills');
    }

    return data;
  } catch (error) {
    console.error('Add skills error:', error);
    throw error;
  }
};

/**
 * Get all available skills
 * @returns {Promise<Array>} Array of all skills
 */
export const getAllSkills = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/skills`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get skills');
    }

    return data;
  } catch (error) {
    console.error('Get skills error:', error);
    throw error;
  }
};

/**
 * Create new skills
 * @param {string[]} names - Array of skill names to create
 * @returns {Promise<Object>} Response with created and existing skills
 */
export const createSkill = async (names) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/skills/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ names }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create skills');
    }

    return data;
  } catch (error) {
    console.error('Create skill error:', error);
    throw error;
  }
};

