import API_BASE_URL from '../config/api.js';
import { getAuthHeader } from '../utils/token.js';

/**
 * Apply to a job
 * @param {number|string} jobId - Job ID
 * @returns {Promise<Object>} Application data
 */
export const applyToJob = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to apply to job');
    }

    return data;
  } catch (error) {
    console.error('Apply to job error:', error);
    throw error;
  }
};

/**
 * Get applications for a specific job (recruiter only)
 * @param {number|string} jobId - Job ID
 * @returns {Promise<Array>} Array of applications with candidate details
 */
export const getJobApplications = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get applications');
    }

    return data;
  } catch (error) {
    console.error('Get job applications error:', error);
    throw error;
  }
};

/**
 * Get all applications for recruiter's jobs
 * @returns {Promise<Array>} Array of all applications
 */
export const getMyJobApplications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get applications');
    }

    return data;
  } catch (error) {
    console.error('Get my job applications error:', error);
    throw error;
  }
};

/**
 * Get candidate's own applications
 * @returns {Promise<Array>} Array of candidate's applications
 */
export const getMyApplications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/my-applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get applications');
    }

    return data;
  } catch (error) {
    console.error('Get my applications error:', error);
    throw error;
  }
};

/**
 * Update application status (recruiter only)
 * @param {number|string} applicationId - Application ID
 * @param {string} status - New status (pending, accepted, rejected)
 * @returns {Promise<Object>} Updated application data
 */
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update application status');
    }

    return data;
  } catch (error) {
    console.error('Update application status error:', error);
    throw error;
  }
};

