import React from 'react';
import { Clock, CheckCircle, Mail, AlertCircle } from 'lucide-react';

const AdminReviewPending: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full">
        {/* Main Card */}
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Background circle */}
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                {/* Document icon */}
                <div className="w-16 h-20 bg-blue-500 rounded-lg"></div>
              </div>
              {/* Orange dot indicator */}
              <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full border-4 border-white flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin is Reviewing Your Request
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-8">
            Please come back after some time
          </p>

          {/* Information Box */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-3">
            <p className="text-gray-700 flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Your submission is currently being reviewed by our admin team.
            </p>
            <p className="text-gray-700 flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              This process typically takes 24-48 hours.
            </p>
            <p className="text-gray-700 flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-green-500" />
              You will receive a notification once the review is complete.
            </p>
          </div>

          {/* Status Timeline */}
          <div className="mt-8 mb-8">
            <div className="flex items-center justify-center gap-4">
              {/* Step 1 - Completed */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Submitted</p>
              </div>

              {/* Connector */}
              <div className="w-16 h-1 bg-linear-to-r from-green-500 to-orange-500"></div>

              {/* Step 2 - In Progress */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2 animate-pulse">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Reviewing</p>
              </div>

              {/* Connector */}
              <div className="w-16 h-1 bg-gray-300"></div>

              {/* Step 3 - Pending */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Approved</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              What happens next?
            </h3>
            <div className="text-left max-w-md mx-auto space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Our admin team will carefully review your credentials and information
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <p className="text-gray-600 text-sm">
                  You'll receive an email notification about the approval status
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Once approved, you can access your dashboard and start managing appointments
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Check Status
            </button>
            <button className="px-6 py-3 border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 rounded-lg font-medium transition-colors">
              Contact Support
            </button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-8">
            Need help? Email us at{' '}
            <a href="mailto:support@medsync.com" className="text-blue-600 hover:underline font-medium">
              support@medsync.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewPending;