import API_BASE_URL from '../config/api.js';
import { getAuthHeader } from '../utils/token.js';

/**
 * Check CV against job description using ATS analyzer
 * @param {File} cvFile - CV file (PDF, DOC, DOCX, or TXT)
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} Response with ATS analysis
 */
export const checkATS = async (cvFile, jobDescription) => {
  try {
    const formData = new FormData();
    formData.append('cv', cvFile);
    formData.append('jobDescription', jobDescription);

    const response = await fetch(`${API_BASE_URL}/ats/check`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze CV');
    }

    return data;
  } catch (error) {
    console.error('ATS check error:', error);
    throw error;
  }
};

