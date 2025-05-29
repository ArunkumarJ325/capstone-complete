import React, { FC, useState, useEffect, ChangeEvent, MouseEvent } from "react";
import axios, { AxiosRequestConfig } from "axios";
import AddConsultationDialog from "./AddConsultationDialog";

const API_BASE = "http://localhost:3000/api/doctor";
const getAuthHeader = (): AxiosRequestConfig => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});

interface Profile {
  _id: string;
  name: string;
  available: boolean;
  leaveDates: string[];
}

interface Appointment {
  _id: string;
  date: string;
  timeSlot: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

type Tab = "Profile" | "Patients";

export const styles = {
  container: {
    maxWidth: 960,
    margin: "2rem auto",
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
    position: "relative" as const,
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "2rem",
  },
  logout: {
    position: "absolute" as const,
    top: "1rem",
    right: "1rem",
    background: "#e53e3e",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: 4,
    cursor: "pointer",
  },
  tabs: {
    display: "flex",
    marginBottom: "1rem",
    borderBottom: "2px solid #ddd",
  },
  tab: (active: boolean) => ({
    padding: "0.75rem 1.5rem",
    cursor: "pointer",
    borderBottom: active ? "3px solid #3182ce" : "none",
    fontWeight: active ? 600 : 400,
    color: active ? "#3182ce" : "#444",
    background: active ? "#f0f8ff" : "transparent",
  }),
  section: {
    background: "#fff",
    borderRadius: 8,
    padding: "1rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    marginBottom: "0.75rem",
    borderBottom: "1px solid #eee",
    paddingBottom: "0.5rem",
  },
  button: {
    padding: "0.5rem 1rem",
    margin: "0.5rem 0",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  toggleButton: (available: boolean) => ({
    padding: "0.5rem 1rem",
    margin: "0.5rem 0",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    background: available ? "#f56565" : "#48bb78",
    color: "#fff",
  }),
  leaveList: {
    listStyle: "none",
    paddingLeft: 0,
  },
  leaveItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.25rem 0",
  },
  appointmentList: {
    listStyle: "none",
    paddingLeft: 0,
  },
  appointmentItem: {
    padding: "0.5rem 0",
    borderBottom: "1px solid #eee",
  },
  input: {
    padding: "0.5rem",
    marginRight: "0.5rem",
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  patientGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1rem",
  },
  patientCard: {
    border: "1px solid #ddd",
    borderRadius: 6,
    padding: "1rem",
    backgroundColor: "#fafafa",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
};

const DoctorDashboard: FC = () => {
  const [profile, setProfile] = useState<Profile>({
    _id: "",
    name: "",
    available: false,
    leaveDates: [],
  });
  const [schedule, setSchedule] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [newLeaveDate, setNewLeaveDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfileAndSchedule = async () => {
      try {
        const [profRes, schedRes] = await Promise.all([
          axios.get<Profile>(`${API_BASE}/profile`, getAuthHeader()),
          axios.get<Appointment[]>(`${API_BASE}/schedule/me`, getAuthHeader()),
        ]);
        setProfile(profRes.data);
        setSchedule(schedRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndSchedule();
  }, []);

  const fetchPatients = async () => {
    if (!profile._id) return;
    try {
      const res = await axios.get<Patient[]>(
        `${API_BASE}/${profile._id}/patients`,
        getAuthHeader()
      );
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "Patients") {
      fetchPatients();
    }
  }, [activeTab]);

  const toggleAvailability = async (): Promise<void> => {
    try {
      const res = await axios.patch<Profile>(
        `${API_BASE}/availability/${profile._id}`,
        { available: !profile.available },
        getAuthHeader()
      );
      setProfile((prev) => ({ ...prev, available: res.data.available }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLeave = async (): Promise<void> => {
    if (!newLeaveDate) return;
    try {
      await axios.patch(
        `${API_BASE}/leave/add`,
        {  leaveDates: newLeaveDate },
        getAuthHeader()
      );
      setProfile((prev) => ({
        ...prev,
        leaveDates: [...prev.leaveDates, newLeaveDate],
      }));
      setNewLeaveDate("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveLeave = async (date: string): Promise<void> => {
    try {
      await axios.patch(
        `${API_BASE}/leave/remove`,
        { doctorId: profile._id, date },
        getAuthHeader()
      );
      setProfile((prev) => ({
        ...prev,
        leaveDates: prev.leaveDates.filter((d) => d !== date),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleNewLeaveChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewLeaveDate(e.target.value);
  };

  const [showConsultationDialog, setShowConsultationDialog] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string>("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  const handleOpenConsultationDialog = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setSelectedPatientId(appointmentId);
    setShowConsultationDialog(true);
  };

  const handleCloseConsultationDialog = () => {
    setShowConsultationDialog(false);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button style={styles.logout} onClick={handleLogout}>
        Logout
      </button>
      

      <h1 style={styles.header}> {profile.name}'s Dashboard</h1>

      <div style={styles.tabs}>
        <div
          style={styles.tab(activeTab === "Profile")}
          onClick={() => setActiveTab("Profile")}
        >
          Profile
        </div>
        <div
          style={styles.tab(activeTab === "Patients")}
          onClick={() => setActiveTab("Patients")}
        >
          Patients
        </div>
      </div>

      {activeTab === "Profile" && (
        <>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Availability</div>
            <button
              style={styles.toggleButton(profile.available)}
              onClick={toggleAvailability}
            >
              {profile.available ? "Go Unavailable" : "Go Available"}
            </button>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Leave Dates</div>
            <ul style={styles.leaveList}>
              {profile.leaveDates.map((date) => (
                <li key={date} style={styles.leaveItem}>
                  <span>{new Date(date).toLocaleDateString()}</span>
                  <button
                    style={{
                      ...styles.button,
                      background: "#e53e3e",
                      color: "#fff",
                    }}
                    onClick={() => handleRemoveLeave(date)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div>
              <input
                type="date"
                style={styles.input}
                value={newLeaveDate}
                onChange={handleNewLeaveChange}
              />
              <button
                style={{
                  ...styles.button,
                  background: "#3182ce",
                  color: "#fff",
                }}
                onClick={handleAddLeave}
              >
                Add Leave
              </button>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Your Scheduled Appointments</div>
            <ul style={styles.appointmentList}>
              {schedule.map((appt) => (
                <li key={appt._id} style={styles.appointmentItem}>
                  <strong>
                    {new Date(appt.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>{" "}
                  — {appt.timeSlot}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {activeTab === "Patients" && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Assigned Patients</div>
          <div style={styles.patientGrid}>
            {patients.map((p) => (
              <div key={p._id} style={{ ...styles.patientCard, width: "100%" }}>
                <h3 style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
                  {p.name}
                </h3>
                <p style={{ marginBottom: "0.25rem" }}>
                  <strong>Email:</strong> {p.email}
                </p>
                <p>
                  <strong>Phone:</strong> {p.phone}
                </p>

                {/* Add Consultation Button */}
                <button
                  onClick={() => handleOpenConsultationDialog(p._id)}
                  style={{
                    ...styles.button,
                    background: "#3182ce",
                    color: "#fff",
                  }}
                >
                  Add Consultation
                </button>
              </div>
            ))}
            {patients.length === 0 && <p>No patients found.</p>}
          </div>
        </div>
      )}

      {showConsultationDialog && (
        <AddConsultationDialog
          patientId={selectedPatientId} // Replace with the actual patient ID
          appointmentId={selectedAppointmentId}
          onClose={handleCloseConsultationDialog}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
