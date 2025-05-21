import React from "react";
import {
  Department,
  Doctor,
  DoctorNewItem,
} from "../../lib/types/hospital-dashboard";

interface MangageDoctorsProps {
  doctors: Doctor[];
  loading: boolean;
  error: string;
  setShowAddForm: (show: boolean) => void;
  showAddForm: boolean;
  newDoctor: DoctorNewItem;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleAddDoctor: (e: React.FormEvent<HTMLFormElement>) => void;
  handleEditDoctor: (id: string) => void;
  handleDeleteDoctor: (id: string) => void;
  departments: Department[];
}

const MangageDoctors: React.FC<MangageDoctorsProps> = ({
  doctors,
  loading,
  error,
  setShowAddForm,
  showAddForm,
  newDoctor,
  handleInputChange,
  handleAddDoctor,
  handleEditDoctor,
  handleDeleteDoctor,
  departments,
}) => {
  const renderDoctorsList = () => {
    if (loading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (!doctors || doctors.length === 0) {
      return <div className="no-data-message">No doctors found</div>;
    }

    return (
      <div className="doctors-grid">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="doctor-card">
            <div className="doctor-header">
              <h3>{doctor.name}</h3>
              <span
                className={`status-badge ${
                  doctor.available ? "available" : "unavailable"
                }`}
              >
                {doctor.available ? "Available" : "Unavailable"}
              </span>
            </div>
            <div className="doctor-info">
              <p>
                <strong>Email:</strong> {doctor.email}
              </p>
              <p>
                <strong>Department:</strong>{" "}
                {doctor.department || "Not assigned"}
              </p>
              <p>
                <strong>Specialization:</strong>{" "}
                {doctor.specialization || "Not specified"}
              </p>
              <p>
                <strong>Upcoming Leave Dates:</strong>
                {doctor.leaveDates.length === 0 ? "Nil" : ""}
              </p>
              {doctor.leaveDates
                .filter((leaveDate) => new Date(leaveDate) > new Date())
                .map((leaveDate) => (
                  <p key={leaveDate}>
                    {new Date(leaveDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                ))}
            </div>
            <div className="doctor-actions">
              <button
                className="edit-btn"
                onClick={() => handleEditDoctor(doctor._id)}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteDoctor(doctor._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="doctors-section">
      <div className="section-header">
        <h2>Manage Doctors</h2>
        <button
          className="add-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "Add Doctor"}
        </button>
      </div>

      {showAddForm && (
        <div className="add-form-container">
          <form onSubmit={handleAddDoctor} className="add-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={newDoctor.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={newDoctor.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={newDoctor.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Specialization"
                name="specialization"
                value={newDoctor.specialization}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <select
                name="departmentId"
                value={newDoctor.departmentId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="submit-btn">
              Add Doctor
            </button>
          </form>
        </div>
      )}

      {renderDoctorsList()}
    </div>
  );
};

export default MangageDoctors;
