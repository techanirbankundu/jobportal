import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { 
  Briefcase, 
  Building2, 
  Users, 
  Bell, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Target,
  FileText,
  Plus,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Primary Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              onClick={closeMenu}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-naukri-green to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="text-xl font-bold text-gray-900">JobPortal</span>
            </Link>
            
            {/* Primary Navigation - Always visible */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                to="/jobs"
                className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 border-transparent hover:border-naukri-green"
              >
                <Briefcase className="w-4 h-4" />
                <span>Find Jobs</span>
              </Link>
              <Link
                to="/companies"
                className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 border-transparent hover:border-naukri-green"
              >
                <Building2 className="w-4 h-4" />
                <span>Companies</span>
              </Link>
              {/* {isAuthenticated && user?.role === 'recruiter' && (
                <Link
                  to="/candidates"
                  className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 border-transparent hover:border-naukri-green"
                >
                  <Users className="w-4 h-4" />
                  <span>Find Candidates</span>
                </Link>
              )} */}
            </div>
          </div>

          {/* User Actions & Secondary Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Quick Actions */}
                <div className="flex items-center space-x-3 mr-4">
                  <Link
                    to="/ats-checker"
                    className="flex items-center gap-2 text-gray-600 hover:text-naukri-green px-3 py-2 text-sm font-medium transition-colors duration-200"
                    title="CV ATS Checker"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>ATS Checker</span>
                  </Link>
                  {user?.role === 'candidate' && (
                    <Link
                      to="/jobs/relevant"
                      className="flex items-center gap-2 text-gray-600 hover:text-naukri-green px-3 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      <Target className="w-4 h-4" />
                      <span>Recommended</span>
                    </Link>
                  )}
                  
                  {user?.role === 'recruiter' && (
                    <>
                      <Link
                        to="/applications"
                        className="flex items-center gap-2 text-gray-600 hover:text-naukri-green px-3 py-2 text-sm font-medium transition-colors duration-200"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Applications</span>
                      </Link>
                      <Link
                        to="/jobs/create"
                        className="bg-gradient-to-r from-naukri-green to-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Post Job</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                  {/* Notifications */}
                  <Link
                    to="/notifications"
                    className="text-gray-400 hover:text-naukri-green p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Link>

                  {/* Messages */}
                  <Link
                    to="/messages"
                    className="text-gray-400 hover:text-naukri-green p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 relative"
                    title="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                  </Link>

                  {/* User Profile Dropdown */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                    </div>
                    
                    <div className="relative group">
                      <button className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="w-8 h-8 bg-gradient-to-r from-naukri-green to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {user?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            onClick={closeMenu}
                          >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            onClick={closeMenu}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Guest User Actions */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-naukri-green px-4 py-2 text-sm font-semibold transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-naukri-green to-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-naukri-green hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-naukri-green focus:ring-opacity-50 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-200 bg-white`}>
          <div className="px-2 pt-2 pb-4 space-y-1">
            {/* Primary Mobile Links */}
            <Link
              to="/jobs"
              className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200 hover:bg-gray-50"
              onClick={closeMenu}
            >
              <Briefcase className="w-5 h-5" />
              <span>Find Jobs</span>
            </Link>
            <Link
              to="/companies"
              className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200 hover:bg-gray-50"
              onClick={closeMenu}
            >
              <Building2 className="w-5 h-5" />
              <span>Companies</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* User-specific Mobile Links */}
                <Link
                  to="/ats-checker"
                  className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200 hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>ATS Checker</span>
                </Link>
                {user?.role === 'candidate' && (
                  <Link
                    to="/jobs/relevant"
                    className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200 hover:bg-gray-50"
                    onClick={closeMenu}
                  >
                    <Target className="w-5 h-5" />
                    <span>Recommended Jobs</span>
                  </Link>
                )}
                
                {user?.role === 'recruiter' && (
                  <>
                    <Link
                      to="/candidates"
                      className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200 hover:bg-gray-50"
                      onClick={closeMenu}
                    >
                      <Users className="w-5 h-5" />
                      <span>Find Candidates</span>
                    </Link>
                    <Link
                      to="/applications"
                      className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200 hover:bg-gray-50"
                      onClick={closeMenu}
                    >
                      <FileText className="w-5 h-5" />
                      <span>Applications</span>
                    </Link>
                    <Link
                      to="/jobs/create"
                      className="flex items-center gap-2 bg-gradient-to-r from-naukri-green to-green-600 text-white px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200 hover:shadow-lg justify-center"
                      onClick={closeMenu}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Post New Job</span>
                    </Link>
                  </>
                )}

                {/* User Menu Mobile */}
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-gray-50"
                    onClick={closeMenu}
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/notifications"
                    className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-gray-50"
                    onClick={closeMenu}
                  >
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </Link>
                  <Link
                    to="/messages"
                    className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-gray-50"
                    onClick={closeMenu}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                  </Link>
                  
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              /* Guest Mobile Actions */
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-gray-700 hover:text-naukri-green px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200 hover:bg-gray-50 justify-center"
                  onClick={closeMenu}
                >
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-gradient-to-r from-naukri-green to-green-600 text-white px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200 hover:shadow-lg justify-center"
                  onClick={closeMenu}
                >
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;