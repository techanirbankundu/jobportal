import { useState, useEffect, useRef } from 'react';
import { getAllSkills } from '../services/userApi';

const JobFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Local state for debounced inputs
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [localLocation, setLocalLocation] = useState(filters.location || '');
  const [localCompany, setLocalCompany] = useState(filters.company || '');
  const [localMinSalary, setLocalMinSalary] = useState(filters.minSalary || '');
  const [localMaxSalary, setLocalMaxSalary] = useState(filters.maxSalary || '');
  
  const debounceTimer = useRef(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        const data = await getAllSkills();
        setSkills(data);
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  // Sync local state with filters prop
  useEffect(() => {
    setLocalSearch(filters.search || '');
    setLocalLocation(filters.location || '');
    setLocalCompany(filters.company || '');
    setLocalMinSalary(filters.minSalary || '');
    setLocalMaxSalary(filters.maxSalary || '');
  }, [filters.search, filters.location, filters.company, filters.minSalary, filters.maxSalary]);

  // Debounce function for text inputs
  const debounceUpdate = (key, value) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      onFilterChange({ ...filters, [key]: value || null });
    }, 500); // 500ms delay
  };

  const employmentTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];

  const handleChange = (key, value) => {
    // Immediate update for dropdowns and skills
    onFilterChange({ ...filters, [key]: value });
  };

  const handleTextChange = (key, value, setLocal) => {
    setLocal(value);
    debounceUpdate(key, value);
  };

  const handleSkillToggle = (skillId) => {
    const currentSkillIds = filters.skillIds || [];
    const newSkillIds = currentSkillIds.includes(skillId)
      ? currentSkillIds.filter((id) => id !== skillId)
      : [...currentSkillIds, skillId];
    handleChange('skillIds', newSkillIds);
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      localSearch ||
      filters.location ||
      localLocation ||
      filters.company ||
      localCompany ||
      filters.employmentType ||
      filters.minSalary ||
      localMinSalary ||
      filters.maxSalary ||
      localMaxSalary ||
      (filters.skillIds && filters.skillIds.length > 0)
    );
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <button
              onClick={onClearFilters}
              className="text-sm text-naukri-green hover:text-naukri-green-dark font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Search - Always visible */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => handleTextChange('search', e.target.value, setLocalSearch)}
          placeholder="Search by title, company, or description..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naukri-green focus:border-transparent"
        />
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={localLocation}
              onChange={(e) => handleTextChange('location', e.target.value, setLocalLocation)}
              placeholder="e.g., Mumbai, Bangalore"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naukri-green focus:border-transparent"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input
              type="text"
              value={localCompany}
              onChange={(e) => handleTextChange('company', e.target.value, setLocalCompany)}
              placeholder="Company name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naukri-green focus:border-transparent"
            />
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
            <select
              value={filters.employmentType || ''}
              onChange={(e) => handleChange('employmentType', e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naukri-green focus:border-transparent"
            >
              <option value="">All Types</option>
              {employmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary (₹)</label>
              <input
                type="number"
                value={localMinSalary}
                onChange={(e) => handleTextChange('minSalary', e.target.value || null, setLocalMinSalary)}
                placeholder="Min"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naukri-green focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary (₹)</label>
              <input
                type="number"
                value={localMaxSalary}
                onChange={(e) => handleTextChange('maxSalary', e.target.value || null, setLocalMaxSalary)}
                placeholder="Max"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naukri-green focus:border-transparent"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
            {loadingSkills ? (
              <div className="text-sm text-gray-500">Loading skills...</div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSkillToggle(skill.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        filters.skillIds?.includes(skill.id)
                          ? 'bg-naukri-green text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {(filters.search || localSearch) && (
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                Search: {filters.search || localSearch}
              </span>
            )}
            {(filters.location || localLocation) && (
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                Location: {filters.location || localLocation}
              </span>
            )}
            {(filters.company || localCompany) && (
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                Company: {filters.company || localCompany}
              </span>
            )}
            {filters.employmentType && (
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                Type: {filters.employmentType}
              </span>
            )}
            {(filters.minSalary || localMinSalary) && (
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                Min: ₹{parseInt(filters.minSalary || localMinSalary).toLocaleString('en-IN')}
              </span>
            )}
            {(filters.maxSalary || localMaxSalary) && (
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                Max: ₹{parseInt(filters.maxSalary || localMaxSalary).toLocaleString('en-IN')}
              </span>
            )}
            {filters.skillIds && filters.skillIds.length > 0 && (
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                {filters.skillIds.length} skill{filters.skillIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFilters;

