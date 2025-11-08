import API_BASE_URL from '../config/api.js';
import { getAuthHeader } from '../utils/token.js';

/**
 * Get all jobs with optional filters
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.search] - Search query
 * @param {string} [filters.location] - Location filter
 * @param {string} [filters.company] - Company filter
 * @param {string} [filters.employmentType] - Employment type filter
 * @param {number} [filters.minSalary] - Minimum salary
 * @param {number} [filters.maxSalary] - Maximum salary
 * @param {number[]} [filters.skillIds] - Array of skill IDs
 * @returns {Promise<Array>} Array of all active jobs
 */
export const getAllJobs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.company) queryParams.append('company', filters.company);
    if (filters.employmentType) queryParams.append('employmentType', filters.employmentType);
    if (filters.minSalary) queryParams.append('minSalary', filters.minSalary);
    if (filters.maxSalary) queryParams.append('maxSalary', filters.maxSalary);
    if (filters.skillIds && filters.skillIds.length > 0) {
      filters.skillIds.forEach((id) => queryParams.append('skillIds', id));
    }

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/jobs${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get jobs');
    }

    return data;
  } catch (error) {
    console.error('Get all jobs error:', error);
    throw error;
  }
};

/**
 * Get job by ID
 * @param {number|string} jobId - Job ID
 * @returns {Promise<Object>} Job details with skills
 */
export const getJobById = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get job details');
    }

    return data;
  } catch (error) {
    console.error('Get job by ID error:', error);
    throw error;
  }
};

/**
 * Get relevant jobs based on user skills with optional filters (requires authentication)
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.search] - Search query
 * @param {string} [filters.location] - Location filter
 * @param {string} [filters.company] - Company filter
 * @param {string} [filters.employmentType] - Employment type filter
 * @param {number} [filters.minSalary] - Minimum salary
 * @param {number} [filters.maxSalary] - Maximum salary
 * @param {number[]} [filters.skillIds] - Array of skill IDs
 * @returns {Promise<Array>} Array of relevant jobs sorted by match count
 */
export const getRelevantJobs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.company) queryParams.append('company', filters.company);
    if (filters.employmentType) queryParams.append('employmentType', filters.employmentType);
    if (filters.minSalary) queryParams.append('minSalary', filters.minSalary);
    if (filters.maxSalary) queryParams.append('maxSalary', filters.maxSalary);
    if (filters.skillIds && filters.skillIds.length > 0) {
      filters.skillIds.forEach((id) => queryParams.append('skillIds', id));
    }

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/jobs/relevant${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get relevant jobs');
    }

    return data;
  } catch (error) {
    console.error('Get relevant jobs error:', error);
    throw error;
  }
};

/**
 * Create a new job (recruiter only)
 * @param {Object} jobData - Job data
 * @param {string} jobData.title - Job title
 * @param {string} jobData.description - Job description
 * @param {string} jobData.company - Company name
 * @param {string} jobData.location - Job location
 * @param {number} [jobData.salary] - Salary
 * @param {string} [jobData.employmentType] - Employment type
 * @param {number[]} [jobData.skillIds] - Array of skill IDs
 * @returns {Promise<Object>} Created job data
 */
export const createJob = async (jobData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(jobData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create job');
    }

    return data;
  } catch (error) {
    console.error('Create job error:', error);
    throw error;
  }
};

/**
 * Update a job (recruiter only - own jobs)
 * @param {number|string} jobId - Job ID
 * @param {Object} jobData - Job data to update
 * @param {string} [jobData.title] - Job title
 * @param {string} [jobData.description] - Job description
 * @param {string} [jobData.company] - Company name
 * @param {string} [jobData.location] - Job location
 * @param {number} [jobData.salary] - Salary
 * @param {string} [jobData.employmentType] - Employment type
 * @param {boolean} [jobData.isActive] - Job active status
 * @param {number[]} [jobData.skillIds] - Array of skill IDs
 * @returns {Promise<Object>} Updated job data
 */
export const updateJob = async (jobId, jobData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(jobData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update job');
    }

    return data;
  } catch (error) {
    console.error('Update job error:', error);
    throw error;
  }
};

/**
 * Delete a job (recruiter only - own jobs)
 * @param {number|string} jobId - Job ID
 * @returns {Promise<Object>} Success message
 */
export const deleteJob = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete job');
    }

    return data;
  } catch (error) {
    console.error('Delete job error:', error);
    throw error;
  }
};

