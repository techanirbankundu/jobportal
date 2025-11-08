/**
 * Format salary in Indian Rupees (INR)
 * @param {number} salary - Salary amount
 * @returns {string} Formatted salary string
 */
export const formatSalary = (salary) => {
  if (!salary) return 'Not disclosed';
  
  // Convert to lakhs if >= 100000
  if (salary >= 100000) {
    const lakhs = (salary / 100000).toFixed(1);
    return `₹${lakhs}L`;
  }
  
  // Convert to thousands if >= 1000
  if (salary >= 1000) {
    const thousands = (salary / 1000).toFixed(0);
    return `₹${thousands}K`;
  }
  
  return `₹${salary.toLocaleString('en-IN')}`;
};

/**
 * Format salary range in Indian Rupees
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @returns {string} Formatted salary range
 */
export const formatSalaryRange = (min, max) => {
  if (!min && !max) return 'Not disclosed';
  if (!min) return `Up to ${formatSalary(max)}`;
  if (!max) return `${formatSalary(min)}+`;
  return `${formatSalary(min)} - ${formatSalary(max)}`;
};

