import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { ErrorResponse, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "./HospitalAdminDashboard.css";
import {
  Department,
  DepartmentNewItem,
  Doctor,
  DoctorNewItem,
  Hospital,
  Nurse,
  NurseNewItem,
} from "../lib/types/hospital-dashboard";
import HospitalDashboradSummary from "./hospital-admin-dashboard/HospitalDashboradSummary";
import HospitalTabNavigation from "./hospital-admin-dashboard/HospitalTabNavigation";
import MangageDoctors from "./hospital-admin-dashboard/MangageDoctors";
import HospitalManageAppointments from "./hospital-admin-dashboard/HospitalManageAppointments";

const HospitalAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "doctors" | "nurses" | "departments" | "appointments"
  >("doctors");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [adminName, setAdminName] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newDoctor, setNewDoctor] = useState<DoctorNewItem>({
    name: "",
    email: "",
    password: "",
    departmentId: "",
    specialization: "",
  });
  const [newNurse, setNewNurse] = useState<NurseNewItem>({
    name: "",
    email: "",
    password: "",
    departmentId: "",
  });

  const [newDepartment, setNewDepartment] = useState<DepartmentNewItem>({
    name: "",
    description: "",
  });

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const hospitalId = localStorage.getItem("hospitalId");
    const name = localStorage.getItem("userName");
    const token = localStorage.getItem("token");

    console.log("Initial auth check:", {
      userRole,
      hospitalId,
      name,
      hasToken: !!token,
    });

    if (userRole !== "HOSPITAL_ADMIN" || !hospitalId || !token) {
      console.log("Auth check failed, redirecting to login");
      navigate("/login");
      return;
    }

    setAdminName(name || "");
    fetchHospitalDetails(hospitalId);
    fetchData();
  }, [navigate]);

  const fetchHospitalDetails = async (hospitalId: string): Promise<void> => {
    try {
      const response = await axios.get<Hospital>(
        `http://localhost:3000/api/auth/hospitals/${hospitalId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setHospital(response.data);
    } catch (err) {
      const error = err as any;
      setError(
        error.response?.data?.message || "Failed to fetch hospital details"
      );
    }
  };

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const hospitalId = localStorage.getItem("hospitalId");
      const token = localStorage.getItem("token");

      if (!hospitalId || !token) {
        throw new Error("Missing hospital ID or token");
      }

      // Fetch departments first since we need them for both doctors and nurses
      console.log("Fetching departments...");
      const departmentsResponse = await axios.get<Department[]>(
        `http://localhost:3000/api/dept/hospital/${hospitalId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Departments response:", departmentsResponse.data);
      if (departmentsResponse.data) {
        setDepartments(departmentsResponse.data);
      }

      // Fetch doctors
      console.log("Fetching doctors...");
      const doctorsResponse = await axios.get<Doctor[]>(
        `http://localhost:3000/api/doctor/hospital/${hospitalId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Doctors response:", doctorsResponse.data);
      if (doctorsResponse.data) {
        setDoctors(doctorsResponse.data);
        setError(""); // Clear any existing errors when data is successfully fetched
      }

      // Fetch nurses
      console.log("Fetching nurses...");
      const nursesResponse = await axios.get<Nurse[]>(
        `http://localhost:3000/api/nurse/hospital/${hospitalId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Nurses response:", nursesResponse.data);
      if (nursesResponse.data) {
        // Map department names to nurses
        const nursesWithDepartments = nursesResponse.data.map((nurse) => {
          const department = departmentsResponse.data.find(
            (dept) => dept._id === nurse.departmentId
          );
          return {
            ...nurse,
            department: department
              ? {
                  _id: department._id,
                  name: department.name,
                }
              : undefined,
          };
        });
        setNurses(nursesWithDepartments);
      }
    } catch (err) {
      const error = err as any;
      console.error("Error fetching data:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });

      if (error.response) {
        setError(
          error.response.data?.message || "Failed to fetch data from server"
        );
      } else if (error.request) {
        setError(
          "No response received from server. Please check your connection."
        );
      } else {
        setError("Error setting up the request: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (): void => {
    localStorage.clear();
    navigate("/login");
  };

  const handleAddDoctor = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const hospitalId = localStorage.getItem("hospitalId");
      const token = localStorage.getItem("token");

      if (!hospitalId || !token) {
        throw new Error("Missing hospital ID or token");
      }

      const response = await axios.post<Doctor>(
        "http://localhost:3000/api/doctor/create-doctor",
        {
          ...newDoctor,
          hospitalId,
          role: "DOCTOR",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setDoctors((prev) => [...prev, response.data]);
        setSuccess("Doctor added successfully");
        setNewDoctor({
          name: "",
          email: "",
          password: "",
          departmentId: "",
          specialization: "",
        });
        setShowAddForm(false);
      }
    } catch (err) {
      const error = err as any;
      console.error("Error adding doctor:", error);
      setError(error.response?.data?.message || "Failed to add doctor");
    }
  };

  const handleAddDepartment = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const hospitalId = localStorage.getItem("hospitalId");
      const token = localStorage.getItem("token");

      if (!hospitalId || !token) {
        throw new Error("Missing hospital ID or token");
      }

      const departmentData: DepartmentNewItem = {
        name: newDepartment.name,
        description: newDepartment.description,
      };

      const response = await axios.post<Department>(
        "http://localhost:3000/api/dept/create-dept",
        {
          ...departmentData,
          hospitalId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setDepartments((prev) => [...prev, response.data]);
        setSuccess("Department added successfully");
        setNewDoctor({
          name: "",
          email: "",
          password: "",
          departmentId: "",
          specialization: "",
        });
        setShowAddForm(false);
      }
    } catch (err) {
      const error = err as any;
      console.error("Error adding department:", error);
      setError(error.response?.data?.message || "Failed to add department");
    }
  };

  const handleDeleteDoctor = async (doctorId: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
      setSuccess("Doctor deleted successfully");
    } catch (err) {
      const error = err as any;
      setError(error.response?.data?.message || "Failed to delete doctor");
    }
  };

  const handleDeleteDepartment = async (
    departmentId: string
  ): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      await axios.delete(`http://localhost:3000/api/dept/${departmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDepartments((prev) => prev.filter((d) => d._id !== departmentId));
      setSuccess("Department deleted successfully");
    } catch (err) {
      const error = err as any;
      setError(error.response?.data?.message || "Failed to delete department");
    }
  };

  const handleEditDoctor = async (doctorId: string): Promise<void> => {
    // TODO: Implement edit functionality
    console.log("Edit doctor:", doctorId);
  };

  const handleEditDepartment = async (departmentId: string): Promise<void> => {
    // TODO: Implement edit functionality
    console.log("Edit department:", departmentId);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    if (activeTab === "doctors") {
      setNewDoctor((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (activeTab === "nurses") {
      setNewNurse((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (activeTab === "departments") {
      setNewDepartment((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDeparmentFieldChange = (value: string, field: string): void => {
    if (activeTab === "departments") {
      setNewDepartment((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddNurse = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const hospitalId = localStorage.getItem("hospitalId");
      const token = localStorage.getItem("token");

      if (!hospitalId || !token) {
        throw new Error("Missing hospital ID or token");
      }

      const response: any = await axios.post<Nurse>(
        "http://localhost:3000/api/nurse/create-nurse",
        {
          ...newNurse,
          hospitalId,
          role: "NURSE",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        console.log(response.data);
        setNurses((prev) => [...prev, response.data.nurse]);
        setSuccess("Nurse added successfully");
        setNewNurse({
          name: "",
          email: "",
          password: "",
          departmentId: "",
        });
        setShowAddForm(false);
      }
    } catch (err) {
      const error = err as any;
      console.error("Error adding nurse:", error);
      setError(error.response?.data?.message || "Failed to add nurse");
    }
  };

  const handleDeleteNurse = async (nurseId: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this nurse?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/nurse/${nurseId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNurses((prev) => prev.filter((n) => n._id !== nurseId));
      setSuccess("Nurse deleted successfully");
    } catch (err) {
      const error = err as any;
      setError(error.response?.data?.message || "Failed to delete nurse");
    }
  };

  const renderNursesList = () => {
    console.log("Rendering nurses list. Current state:", {
      loading,
      error,
      nursesCount: nurses.length,
      nurses,
    });

    if (loading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (!nurses || nurses.length === 0) {
      return <div className="no-data-message">No nurses found</div>;
    }

    return (
      <div className="nurses-grid">
        {nurses.map((nurse) => (
          <div key={nurse._id} className="nurse-card">
            <div className="nurse-header">
              <h3>{nurse.name}</h3>
            </div>
            <div className="nurse-info">
              <p>
                <strong>Email:</strong> {nurse.email}
              </p>
              <p>
                <strong>Department:</strong>{" "}
                {nurse.department?.name || "Not assigned"}
              </p>
            </div>
            <div className="nurse-actions">
              <button
                className="edit-btn"
                onClick={() => handleEditDoctor(nurse._id)}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteNurse(nurse._id)}
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
    <div className="dashboard-container">
      <HospitalDashboradSummary
        doctors={doctors}
        departments={departments}
        handleLogout={handleLogout}
        hospitalName={hospital?.name || ""}
      />

      <div className="dashboard-content">
        <HospitalTabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowAddForm={setShowAddForm}
        />

        <div className="tab-content">
          {activeTab === "doctors" && (
            <MangageDoctors
              doctors={doctors}
              loading={loading}
              error={error}
              setShowAddForm={setShowAddForm}
              showAddForm={showAddForm}
              newDoctor={newDoctor}
              handleInputChange={handleInputChange}
              handleAddDoctor={handleAddDoctor}
              handleEditDoctor={handleEditDoctor}
              handleDeleteDoctor={handleDeleteDoctor}
              departments={departments}
            />
          )}

          {activeTab === "nurses" && (
            <div className="nurses-section">
              <div className="section-header">
                <h2>Manage Nurses</h2>
                <button
                  className="add-btn"
                  onClick={() => {
                    setNewNurse({
                      name: "",
                      email: "",
                      password: "",
                      departmentId: "",
                    });
                    setShowAddForm(!showAddForm);
                  }}
                >
                  {showAddForm ? "Cancel" : "Add Nurse"}
                </button>
              </div>

              {showAddForm && (
                <div className="add-form-container">
                  <form onSubmit={handleAddNurse} className="add-form">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Name"
                        name="name"
                        value={newNurse.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={newNurse.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={newNurse.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <select
                        name="departmentId"
                        value={newNurse.departmentId}
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
                      Add Nurse
                    </button>
                  </form>
                </div>
              )}

              {renderNursesList()}
            </div>
          )}

          {activeTab === "appointments" && <HospitalManageAppointments />}

          {activeTab === "departments" && (
            <div className="departments-section">
              <div className="section-header">
                <h2>Manage Departments</h2>
                <button
                  className="add-btn"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? "Cancel" : "Add Department"}
                </button>
              </div>

              {showAddForm && (
                <div className="add-form-container">
                  <form onSubmit={handleAddDepartment} className="add-form">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Department Name"
                        name="name"
                        value={newDepartment.name}
                        onChange={(e) =>
                          handleDeparmentFieldChange(e.target.value, "name")
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        placeholder="Description"
                        name="description"
                        value={newDepartment.description}
                        onChange={(e) =>
                          handleDeparmentFieldChange(
                            e.target.value,
                            "description"
                          )
                        }
                        required
                      />
                    </div>
                    <button type="submit" className="submit-btn">
                      Add Department
                    </button>
                  </form>
                </div>
              )}

              {loading ? (
                <div className="loading-spinner">Loading...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : (
                <div className="departments-grid">
                  {departments.map((dept) => (
                    <div key={dept._id} className="department-card">
                      <div className="department-header">
                        <h3>{dept.name}</h3>
                      </div>
                      <div className="department-info">
                        <p>{dept.description}</p>
                      </div>
                      <div className="department-actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditDepartment(dept._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteDepartment(dept._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess("")}>×</button>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminDashboard;
