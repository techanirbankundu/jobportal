import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, uploadCV, addSkills, getAllSkills } from '../services/userApi';

const Profile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
        });
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    const fetchSkills = async () => {
      try {
        const skills = await getAllSkills();
        setAvailableSkills(skills);
      } catch (err) {
        console.error('Failed to load skills:', err);
      }
    };

    fetchProfile();
    fetchSkills();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const result = await updateProfile(formData);
      setProfile(result.user);
      updateUser(result.user);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    setError('');
    setUploadingCV(true);

    try {
      const result = await uploadCV(file);
      setProfile(result.user);
      updateUser(result.user);
      setSuccess('CV uploaded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload CV');
    } finally {
      setUploadingCV(false);
    }
  };

  const handleSkillToggle = async (skillId) => {
    const currentSkillIds = profile?.skills?.map((s) => s.id) || [];
    const newSkillIds = currentSkillIds.includes(skillId)
      ? currentSkillIds.filter((id) => id !== skillId)
      : [...currentSkillIds, skillId];

    try {
      const result = await addSkills(newSkillIds);
      setProfile({ ...profile, skills: result.skills });
      setSuccess('Skills updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update skills');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {(error || success) && (
          <div
            className={`mb-6 px-4 py-3 rounded ${
              error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Basic Info */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Basic Information</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-naukri-green text-white px-4 py-2 rounded hover:bg-naukri-green-dark transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-naukri-green text-white px-6 py-2 rounded hover:bg-naukri-green-dark transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        name: profile.name || '',
                        phone: profile.phone || '',
                        location: profile.location || '',
                        bio: profile.bio || '',
                      });
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <p className="text-lg font-medium text-gray-900">{profile.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <p className="text-lg font-medium text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone:</span>
                  <p className="text-lg font-medium text-gray-900">{profile.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Location:</span>
                  <p className="text-lg font-medium text-gray-900">{profile.location || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Bio:</span>
                  <p className="text-lg font-medium text-gray-900">{profile.bio || 'No bio provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Role:</span>
                  <p className="text-lg font-medium text-gray-900 capitalize">{profile.role}</p>
                </div>
              </div>
            )}
          </section>

          {/* CV Upload */}
          {profile.role === 'candidate' && (
            <section className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">CV/Resume</h2>
              {profile.cvUrl ? (
                <div className="space-y-4">
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-naukri-green hover:text-naukri-green-dark underline"
                  >
                    View Current CV
                  </a>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload New CV (PDF, DOC, DOCX)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCVUpload}
                      disabled={uploadingCV}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {uploadingCV && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CV (PDF, DOC, DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCVUpload}
                    disabled={uploadingCV}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {uploadingCV && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                </div>
              )}
            </section>
          )}

          {/* Skills */}
          {profile.role === 'candidate' && (
            <section className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Skills</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Select your skills:</p>
                <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                  {availableSkills.length === 0 ? (
                    <p className="text-gray-500">No skills available</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSkills.map((skill) => {
                        const isSelected = profile.skills?.some((s) => s.id === skill.id);
                        return (
                          <label
                            key={skill.id}
                            className={`flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded ${
                              isSelected ? 'bg-primary-50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSkillToggle(skill.id)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{skill.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Your selected skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-4 py-2 bg-primary-100 text-primary-800 rounded-full font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

