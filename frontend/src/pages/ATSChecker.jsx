import { useState } from 'react';
import { checkATS } from '../services/atsApi';
import { FileText, Upload, Sparkles, TrendingUp, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const ATSChecker = () => {
  const [cvFile, setCvFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, DOC, DOCX, or TXT file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setCvFile(file);
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cvFile) {
      setError('Please upload your CV');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter the job description');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await checkATS(cvFile, jobDescription);
      setResult(response.analysis);
    } catch (err) {
      setError(err.message || 'Failed to analyze CV. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCvFile(null);
    setJobDescription('');
    setResult(null);
    setError('');
    // Reset file input
    const fileInput = document.getElementById('cv-upload');
    if (fileInput) fileInput.value = '';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-naukri-green to-green-600 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CV ATS Score Checker</h1>
          <p className="text-gray-600">
            Get instant feedback on how well your CV matches a job description
          </p>
        </div>

        {!result ? (
          /* Upload Form */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* CV Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Upload Your CV
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-naukri-green transition-colors">
                  <div className="space-y-1 text-center">
                    {cvFile ? (
                      <div className="flex items-center justify-center space-x-2 text-naukri-green">
                        <FileText className="w-8 h-8" />
                        <div className="text-left">
                          <p className="text-sm font-medium">{cvFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(cvFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="cv-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-naukri-green hover:text-naukri-green-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-naukri-green"
                          >
                            <span>Upload a file</span>
                            <input
                              id="cv-upload"
                              name="cv-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx,.txt"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, or TXT up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
                {cvFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setCvFile(null);
                      const fileInput = document.getElementById('cv-upload');
                      if (fileInput) fileInput.value = '';
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                )}
              </div>

              {/* Job Description */}
              <div>
                <label htmlFor="job-description" className="block text-sm font-semibold text-gray-900 mb-2">
                  Job Description
                </label>
                <textarea
                  id="job-description"
                  rows={8}
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    setError('');
                  }}
                  placeholder="Paste the complete job description here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naukri-green focus:border-transparent resize-none"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Include job title, requirements, responsibilities, and qualifications
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !cvFile || !jobDescription.trim()}
                className="w-full bg-gradient-to-r from-naukri-green to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing CV...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Check ATS Score</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(result.score)} mb-4`}>
                  <span className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {getScoreLabel(result.score)}
                </h2>
                <p className="text-gray-600">ATS Compatibility Score</p>
              </div>

              {/* Match Analysis */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.matchAnalysis?.skillsMatch || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Skills Match</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.matchAnalysis?.experienceRelevance || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Experience</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.matchAnalysis?.educationAlignment || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Education</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.matchAnalysis?.keywordOptimization || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Keywords</div>
                </div>
              </div>

              {/* Overall Assessment */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Overall Assessment</h3>
                    <p className="text-sm text-blue-800">{result.overallAssessment}</p>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {result.strengths && result.strengths.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>Strengths</span>
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {result.improvements && result.improvements.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span>Areas for Improvement</span>
                  </h3>
                  <ul className="space-y-2">
                    {result.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Keywords */}
              {result.missingKeywords && result.missingKeywords.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>Missing Keywords</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Check Another CV
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-naukri-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-naukri-green-dark transition-colors"
                >
                  Print Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSChecker;

