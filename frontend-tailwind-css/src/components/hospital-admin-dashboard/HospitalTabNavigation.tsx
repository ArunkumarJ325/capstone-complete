import React from 'react'

interface HospitalTabNavigationProps {
  activeTab: 'doctors' | 'nurses' | 'departments' | 'appointments';
  setActiveTab: React.Dispatch<React.SetStateAction<'doctors' | 'nurses' | 'departments' | 'appointments'>>;
  setShowAddForm: (show: boolean) => void;
}

const HospitalTabNavigation: React.FC<HospitalTabNavigationProps> = ({ activeTab, setActiveTab, setShowAddForm }) => {
  return (
    <div>
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('doctors');
              setShowAddForm(false);
            }}
          >
            Doctors
          </button>
          <button 
            className={`tab-btn ${activeTab === 'nurses' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('nurses');
              setShowAddForm(false);
            }}
          >
            Nurses
          </button>
          <button 
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('departments');
              setShowAddForm(false);
            }}
          >
            Departments
          </button>
          <button 
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('appointments');
              setShowAddForm(false);
            }}
          >
            Appointments
          </button>
          
        </div>
    </div>
  )
}

export default HospitalTabNavigation
