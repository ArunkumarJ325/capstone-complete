import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import HospitalAdminDashboard from './components/HospitalAdminDashboard';
import './App.css';
import DoctorDashboard from './components/doctor-dashboard/DoctorDashboard';
import PatientDashboard from './components/patient-dashboard/PatientDashboard';
import NurseDashboard from './components/nurse-dashboard/NurseDashboard';
import ConsultationReport from './components/patient-dashboard/ViewReports';
import './index.css';
const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
          <Route path="/hospital-admin-dashboard" element={<HospitalAdminDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/nurse-dashboard" element={<NurseDashboard />} />
          <Route path="/report" element={<ConsultationReport />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 