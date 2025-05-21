import React from "react";
import { Department, Doctor } from "../../lib/types/hospital-dashboard";

interface HospitalDashboradSummaryProps {
  doctors: Doctor[];
  departments: Department[];
  handleLogout: () => void;
  hospitalName: string;
}

const HospitalDashboradSummary: React.FC<HospitalDashboradSummaryProps> = ({ 
  doctors, 
  departments, 
  handleLogout,
  hospitalName 
}) => {
  return (
    <div className="bg-white shadow-md">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section - Logo and Admin */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <span className="text-2xl">🏥</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hospital Admin</h1>
              </div>
            </div>

            {/* Center Section - Hospital Name */}
            <div className="flex-1 flex justify-center">
              <h2 className="text-2xl font-bold text-blue-600">{hospitalName}</h2>
            </div>
            
            {/* Right Section - Stats and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">👨‍⚕️ {doctors.length} Doctors</span>
                <span className="text-sm text-gray-500">🏥 {departments.length} Departments</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Doctors</h3>
                <p className="text-2xl font-semibold text-blue-600">{doctors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <span className="text-2xl">🏥</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Departments</h3>
                <p className="text-2xl font-semibold text-green-600">{departments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
                <p className="text-2xl font-semibold text-purple-600">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboradSummary;