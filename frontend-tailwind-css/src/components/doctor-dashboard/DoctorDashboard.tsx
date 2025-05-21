import React, { FC, useState, useEffect } from "react";
import axios, { AxiosRequestConfig } from "axios";
import AddConsultationDialog from "./AddConsultationDialog";

const API_BASE = "http://localhost:3000/api/doctor";
const HOSPITAL_API_BASE = "http://localhost:3000/api/auth/hospitals";
const APPOINTMENT_API_BASE = "http://localhost:3000/api/appointment";

interface Profile {
  _id: string;
  name: string;
  available: boolean;
  leaveDates: string[];
  hospitalId: string;
}

interface Appointment {
  _id: string;
  date: string;
  timeSlot: string;
  patientId: string;
  patientName: string;
  status: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Hospital {
  _id: string;
  name: string;
}

type Tab = "Today's Patients" | "My Schedule" | "Profile";

const DoctorDashboard: FC = () => {
  const [profile, setProfile] = useState<Profile>({
    _id: "",
    name: "",
    available: false,
    leaveDates: [],
    hospitalId: "",
  });
  const [schedule, setSchedule] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [newLeaveDate, setNewLeaveDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("Today's Patients");
  const [loading, setLoading] = useState<boolean>(true);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [showConsultationDialog, setShowConsultationDialog] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>("");

  useEffect(() => {
    const fetchProfileAndSchedule = async () => {
      try {
        const [profRes, scheduleRes] = await Promise.all([
          axios.get<Profile>(`${API_BASE}/profile`, getAuthHeader()),
          axios.get<Appointment[]>(`${API_BASE}/schedule/me`, getAuthHeader()),
        ]);
        console.log('Fetched schedule:', scheduleRes.data);
        setProfile(profRes.data);
        setSchedule(scheduleRes.data);
        
        // Fetch patients for the doctor
        const patientsRes = await axios.get<Patient[]>(`${API_BASE}/${profRes.data._id}/patients`, getAuthHeader());
        console.log('Fetched patients:', patientsRes.data);
        setPatients(patientsRes.data);
        
        if (profRes.data.hospitalId) {
          const hospitalRes = await axios.get<Hospital>(
            `${HOSPITAL_API_BASE}/${profRes.data.hospitalId}`,
            getAuthHeader()
          );
          setHospital(hospitalRes.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndSchedule();
  }, []);

  const getAuthHeader = (): AxiosRequestConfig => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });

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
        { leaveDates: newLeaveDate },
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
        { leaveDate: date },
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleOpenConsultationDialog = (patientId: string, appointmentId: string) => {
    setSelectedPatientId(patientId);
    setSelectedAppointmentId(appointmentId);
    setShowConsultationDialog(true);
  };

  const handleCloseConsultationDialog = () => {
    setShowConsultationDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const todayAppointments = schedule.filter((appt) => {
    const appointmentDate = new Date(appt.date).toDateString();
    const today = new Date().toDateString();
    console.log('Comparing dates:', {
      appointmentDate,
      today,
      matches: appointmentDate === today
    });
    return appointmentDate === today;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h2 className="text-xl font-bold text-blue-600">{hospital?.name}</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab("Today's Patients")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "Today's Patients"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Today's Patients
                </button>
                <button
                  onClick={() => setActiveTab("My Schedule")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "My Schedule"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  My Schedule
                </button>
                <button
                  onClick={() => setActiveTab("Profile")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "Profile"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Profile
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{profile.name}</span>
              <button
                onClick={toggleAvailability}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  profile.available
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {profile.available ? "Available" : "Unavailable"}
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "Today's Patients" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Today's Appointments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.patientName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Status: {appointment.status}</p>
                    </div>
                    <button
                      onClick={() => handleOpenConsultationDialog(appointment.patientId, appointment._id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Add Consultation
                    </button>
                  </div>
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-4">
                  No appointments scheduled for today.
                </p>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">All Patients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map((patient) => (
                <div
                  key={patient._id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {patient.name}
                      </h3>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                      <p className="text-sm text-gray-500">{patient.phone}</p>
                    </div>
                    <button
                      onClick={() => handleOpenConsultationDialog(patient._id, "")}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Add Consultation
                    </button>
                  </div>
                </div>
              ))}
              {patients.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-4">
                  No patients found.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "My Schedule" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Schedule</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200">
                {schedule.map((appointment) => {
                  const appointmentDate = new Date(appointment.date);
                  return (
                    <div
                      key={appointment._id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appointmentDate.toLocaleDateString("en-IN", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.timeSlot}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-900">
                            {appointment.patientName}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {schedule.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No schedule found.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Profile" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="date"
                    value={newLeaveDate}
                    onChange={(e) => setNewLeaveDate(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddLeave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add Leave
                  </button>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Dates</h3>
                  <div className="space-y-2">
                    {profile.leaveDates.map((date) => (
                      <div
                        key={date}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <span className="text-gray-700">
                          {new Date(date).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleRemoveLeave(date)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {profile.leaveDates.length === 0 && (
                      <p className="text-gray-500 text-center py-2">
                        No leave dates added.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showConsultationDialog && (
        <AddConsultationDialog
          patientId={selectedPatientId}
          appointmentId={selectedAppointmentId}
          onClose={handleCloseConsultationDialog}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
