import { Department, Doctor } from "../../lib/types/hospital-dashboard";

interface HospitalDashboradSummaryProps {
  doctors: Doctor[];
  departments: Department[];
  handleLogout: () => void;
}

const HospitalDashboradSummary: React.FC<HospitalDashboradSummaryProps> = ({ doctors, departments, handleLogout }) => {
  return (
    <div>
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Hospital Admin Dashboard</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-info">
            <h3>Total Doctors</h3>
            <p>{doctors.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-info">
            <h3>Departments</h3>
            <p>{departments.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>Appointments</h3>
            <p>0</p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default HospitalDashboradSummary;