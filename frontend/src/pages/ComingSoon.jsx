import { Construction, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ title = 'Coming Soon', description = 'We are working on something amazing!' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-naukri-green to-green-600 rounded-full mb-6">
            <Construction className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-lg text-gray-600 mb-2">{description}</p>
          <div className="flex items-center justify-center gap-2 text-gray-500 mt-4">
            <Clock className="w-5 h-5" />
            <span className="text-sm">Stay tuned for updates!</span>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-naukri-green text-white rounded-lg font-semibold hover:bg-naukri-green-dark transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;

