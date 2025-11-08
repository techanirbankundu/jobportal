import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyJobApplications, updateApplicationStatus } from '../services/applicationApi';
import { useAuth } from '../context/AuthContext';

const Applications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getMyJobApplications();
        setApplications(data);
      } catch (err) {
        setError(err.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'recruiter') {
      fetchApplications();
    }
  }, [user]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdating(applicationId);
      await updateApplicationStatus(applicationId, newStatus);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to update application status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && applications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
          <p className="mt-2 text-gray-600">Review and manage applications for your posted jobs</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 text-lg">No applications received yet.</p>
            <Link
              to="/jobs/create"
              className="mt-4 inline-block text-naukri-green hover:text-[--color-naukri-green-dark] font-medium"
            >
              Post a job to receive applications →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.candidate.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">
                      Applied for:{' '}
                      <Link
                        to={`/jobs/${application.job.id}`}
                        className="text-naukri-green hover:text-[--color-naukri-green-dark] font-medium"
                      >
                        {application.job.title} at {application.job.company}
                      </Link>
                    </p>
                    <p className="text-sm text-gray-500">
                      Applied on {formatDate(application.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Candidate Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Candidate Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <a
                          href={`mailto:${application.candidate.email}`}
                          className="ml-2 text-naukri-green hover:text-[--color-naukri-green-dark]"
                        >
                          {application.candidate.email}
                        </a>
                      </div>
                      {application.candidate.phone && (
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <a
                            href={`tel:${application.candidate.phone}`}
                            className="ml-2 text-naukri-green hover:text-[--color-naukri-green-dark]"
                          >
                            {application.candidate.phone}
                          </a>
                        </div>
                      )}
                      {application.candidate.location && (
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="ml-2 text-gray-900">{application.candidate.location}</span>
                        </div>
                      )}
                      {application.candidate.bio && (
                        <div>
                          <span className="text-gray-600">Bio:</span>
                          <p className="ml-2 text-gray-900 mt-1">{application.candidate.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills & CV */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                    {application.candidate.skills && application.candidate.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {application.candidate.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mb-4">No skills listed</p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/messages?user=${application.candidate.id}&name=${encodeURIComponent(application.candidate.name)}&email=${encodeURIComponent(application.candidate.email)}&role=${encodeURIComponent(application.candidate.role || 'candidate')}`)}
                        className="inline-flex items-center px-4 py-2 bg-naukri-green text-white rounded hover:bg-[--color-naukri-green-dark] transition"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Message
                      </button>
                      {application.candidate.cvUrl && (
                        <a
                          href={application.candidate.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          View CV
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Update Buttons */}
                <div className="mt-6 pt-6 border-t">
                  {application.status === 'pending' ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'accepted')}
                        disabled={updating === application.id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {updating === application.id ? 'Updating...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'rejected')}
                        disabled={updating === application.id}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {updating === application.id ? 'Updating...' : 'Reject'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Application {application.status === 'accepted' ? 'accepted' : 'rejected'}
                      </p>
                      {application.status === 'accepted' && (
                        <p className="text-xs text-gray-500 mt-1">
                          You can message the candidate to proceed with next steps
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;

