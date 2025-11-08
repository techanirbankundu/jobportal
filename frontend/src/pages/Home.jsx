import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-naukri-green/5 to-blue-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-28 text-center relative">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-naukri-green/10 border border-naukri-green/20">
              <span className="text-sm font-medium text-naukri-green">🚀 Trusted by 10,000+ Job Seekers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl lg:text-8xl font-black text-gray-900 tracking-tight">
              Find Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-naukri-green to-blue-600 mt-2">
                Dream Job
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-2xl lg:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Connect with <span className="font-semibold text-naukri-green">innovative companies</span> and discover opportunities that match your <span className="font-semibold text-blue-600">passion and skills</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="group relative bg-naukri-green text-white px-12 py-5 rounded-2xl text-xl font-bold hover:bg-naukri-green-dark transition-all duration-300 shadow-2xl shadow-naukri-green/30 hover:shadow-naukri-green/50 hover:scale-105"
                  >
                    <span className="relative z-10">Start Your Journey</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-naukri-green to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  <Link
                    to="/jobs"
                    className="border-2 border-gray-300 text-gray-700 px-12 py-5 rounded-2xl text-xl font-bold hover:border-naukri-green hover:text-naukri-green transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm"
                  >
                    Explore Opportunities
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/jobs"
                    className="group relative bg-naukri-green text-white px-12 py-5 rounded-2xl text-xl font-bold hover:bg-naukri-green-dark transition-all duration-300 shadow-2xl shadow-naukri-green/30 hover:shadow-naukri-green/50 hover:scale-105"
                  >
                    <span className="relative z-10">Browse All Jobs</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-naukri-green to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  {user?.role === 'candidate' && (
                    <Link
                      to="/jobs/relevant"
                      className="border-2 border-gray-300 text-gray-700 px-12 py-5 rounded-2xl text-xl font-bold hover:border-naukri-green hover:text-naukri-green transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm"
                    >
                      Relevant Jobs
                    </Link>
                  )}
                  {user?.role === 'recruiter' && (
                    <Link
                      to="/jobs/create"
                      className="border-2 border-gray-300 text-gray-700 px-12 py-5 rounded-2xl text-xl font-bold hover:border-naukri-green hover:text-naukri-green transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm"
                    >
                      Post a Job
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50K+</div>
                <div className="text-gray-600 mt-1">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-600 mt-1">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">2M+</div>
                <div className="text-gray-600 mt-1">Candidates</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black text-gray-900 mb-6">
            Why Choose <span className="text-naukri-green">JobPortal</span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-light">
            We're revolutionizing the way people find jobs and companies find talent
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <div className="group text-center p-12 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-naukri-green/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Matching</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our intelligent algorithm matches you with perfect job opportunities based on your skills, experience, and preferences.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group text-center p-12 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-naukri-green/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Applications</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Apply to multiple jobs with one click using your smart profile. Track all your applications in real-time.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group text-center p-12 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-naukri-green/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <span className="text-3xl">🏢</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Hiring</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              For recruiters: Post jobs, find qualified candidates, and streamline your entire hiring process efficiently.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-naukri-green to-blue-600 py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-black text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-2xl text-white/90 mb-12 font-light">
            Join thousands of professionals who found their dream job through JobPortal
          </p>
          <Link
            to={isAuthenticated ? "/jobs" : "/register"}
            className="inline-flex items-center bg-white text-naukri-green px-16 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-transform duration-300 shadow-2xl"
          >
            {isAuthenticated ? 'Browse Jobs' : 'Get Started Now'}
            <span className="ml-3">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;