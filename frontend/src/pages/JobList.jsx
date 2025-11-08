import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllJobs } from '../services/jobApi';
import { formatSalary } from '../utils/formatCurrency';
import JobFilters from '../components/JobFilters';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getAllJobs(filters);
        setJobs(data);
      } catch (err) {
        setError(err.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters]);

  if (error && !jobs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Find Jobs</h1>
          <p className="text-gray-600 text-sm">Discover opportunities that match your interests</p>
        </div>

        <JobFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {loading && jobs.length === 0 ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 text-lg">
              {Object.keys(filters).length > 0
                ? 'No jobs found matching your filters. Try adjusting your search criteria.'
                : 'No jobs available at the moment.'}
            </p>
          </div>
        ) : (
          <>
            {loading && (
              <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                Updating results...
              </div>
            )}
            {!loading && (
              <div className="mb-4 text-sm text-gray-600">
                Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}
              </div>
            )}
          </>
        )}

        {jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:border-primary-500 transition-all p-5 block"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition">
                      {job.title}
                    </h3>
                    <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center font-medium">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {job.company}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                      {job.salary && (
                        <span className="flex items-center font-semibold text-primary-700">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatSalary(job.salary)}
                        </span>
                      )}
                      {job.employmentType && (
                        <span className="text-gray-500 capitalize">{job.employmentType}</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{job.description}</p>
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded border border-primary-200"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex items-center">
                    <span className="text-primary-600 font-medium text-sm">View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;

