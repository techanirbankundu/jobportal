import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobById, deleteJob } from '../services/jobApi';
import { applyToJob } from '../services/applicationApi';
import { useAuth } from '../context/AuthContext';
import { formatSalary } from '../utils/formatCurrency';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const data = await getJobById(id);
        setJob(data);
      } catch (err) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteJob(id);
      navigate('/jobs');
    } catch (err) {
      setError(err.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      setError('');
      await applyToJob(id);
      setApplied(true);
      setSuccess('Application submitted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to apply to job');
    } finally {
      setApplying(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }


  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">Job not found</div>
      </div>
    );
  }

  const isOwner = user?.role === 'recruiter' && user?.id === job.recruiter?.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/jobs"
          className="text-naukri-green hover:text-naukri-green-dark mb-4 inline-block"
        >
          ← Back to Jobs
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {job.company}
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </span>
              </div>
            </div>
            {isOwner && (
              <div className="flex space-x-2">
                <Link
                  to={`/jobs/${id}/edit`}
                  className="bg-naukri-green text-white px-4 py-2 rounded hover:bg-naukri-green-dark transition"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Salary</p>
              <p className="text-lg font-semibold text-primary-700">{formatSalary(job.salary)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Employment Type</p>
              <p className="text-lg font-semibold text-gray-900">
                {job.employmentType || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full font-medium border border-primary-200"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.recruiter && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Posted by</h3>
              <p className="text-gray-600">{job.recruiter.name}</p>
              <p className="text-gray-500 text-sm">{job.recruiter.email}</p>
            </div>
          )}

          {user?.role === 'candidate' && (
            <div className="mt-6 pt-6 border-t">
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}
              {applied ? (
                <div className="text-center py-3">
                  <p className="text-green-600 font-semibold">✓ Application Submitted</p>
                  <p className="text-gray-600 text-sm mt-1">The recruiter will review your application</p>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full bg-naukri-green text-white py-3 rounded font-semibold hover:bg-[--color-naukri-green-dark] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

