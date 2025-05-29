import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Hospital {
  _id: string;
  name: string;
}

interface Department {
  _id: string;
  name: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization?: string;
}

interface Appointment {
  _id: string;
  appointmentDate: string;
  doctorId: string;
  hospitalId: string;
  departmentId: string;
  status: string;
  name: string;
}

const styles = {
  container: {
    maxWidth: 900,
    margin: "2rem auto",
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
    position: "relative" as const,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  headerTitle: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
  logoutButton: {
    // position: 'absolute' as const,
    top: "1rem",
    right: "1rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  section: {
    marginBottom: "2rem",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    marginBottom: "1rem",
  },
  select: {
    padding: "0.5rem",
    width: "100%",
    marginBottom: "0.75rem",
  },
  input: {
    padding: "0.5rem",
    width: "100%",
    marginBottom: "0.75rem",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#3182ce",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  appointmentCard: {
    border: "1px solid #ddd",
    padding: "1rem",
    borderRadius: 6,
    marginBottom: "1rem",
    background: "#fff",
  },
};

const PatientDashboard = () => {
  const token = localStorage.getItem("token");
  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const navigate = useNavigate();

  const patientId = localStorage.getItem("userId");

  const handleViewReports = () => {
    // Navigate to the report page
    navigate(`/report?patientId=${patientId}`);
  }

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/auth/hospitals", authHeader)
      .then((res) => setHospitals(res.data))
      .catch((err) => console.error("Error fetching hospitals:", err));
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      axios
        .get(
          `http://localhost:3000/api/dept/hospital/${selectedHospital}`,
          authHeader
        )
        .then((res) => setDepartments(res.data))
        .catch((err) => console.error("Error fetching departments:", err));
    } else {
      setDepartments([]);
      setDoctors([]);
    }
  }, [selectedHospital]);

  useEffect(() => {
    if (selectedDepartment) {
      axios
        .get(
          `http://localhost:3000/api/doctor/department/${selectedDepartment}/${selectedHospital}`,
          authHeader
        )
        .then((res) => setDoctors(res.data))
        .catch((err) => console.error("Error fetching doctors:", err));
    } else {
      setDoctors([]);
    }
  }, [selectedDepartment]);

  const fetchAppointments = () => {
    axios
      .get("http://localhost:3000/api/patient/me", authHeader)
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Error fetching appointments:", err));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3000/api/patient/book",
        {
          hospitalId: selectedHospital,
          departmentId: selectedDepartment,
          doctorId: selectedDoctor,
          appointmentDate,
        },
        authHeader
      );

      alert("Appointment booked successfully");
      fetchAppointments();
      setSelectedHospital("");
      setSelectedDepartment("");
      setSelectedDoctor("");
      setAppointmentDate("");
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to book appointment");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Patient Dashboard</h1>
        <button style={styles.logoutButton} onClick={handleViewReports}>
          View Reports
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Book Appointment</h2>
        <form onSubmit={handleSubmit}>
          <select
            style={styles.select}
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            required
          >
            <option value="">Select Hospital</option>
            {hospitals.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            required
            disabled={!selectedHospital}
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            required
            disabled={!selectedDepartment}
          >
            <option value="">Select Doctor</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} {d.specialization && `(${d.specialization})`}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            type="datetime-local"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
          />

          <button type="submit" style={styles.button}>
            Book
          </button>
        </form>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Appointments</h2>
        {appointments.length === 0 ? (
          <p>No appointments booked yet.</p>
        ) : (
          appointments.map((a) => (
            <div key={a._id} style={styles.appointmentCard}>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(a.appointmentDate).toLocaleString()}
              </p>
              <p>
                <strong>Doctor:</strong> {a.name}
              </p>
              <p>
                <strong>Hospital:</strong> {a.hospitalId}
              </p>
              <p>
                <strong>Status:</strong> {a.status}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
