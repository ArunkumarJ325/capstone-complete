import React, { FC, useState, useEffect } from "react";
import axios, { AxiosRequestConfig } from "axios";

const API_BASE = "http://localhost:3000/api/nurse";
const HOSPITAL_API_BASE = "http://localhost:3000/api/auth/hospitals";

interface Profile {
  _id: string;
  name: string;
  email: string;
  departmentId: string;
  hospitalId: string;
  available: boolean;
  leaveDates: string[];
  scheduledDates: string[];
}

interface Appointment {
  _id: string;
  date: string;
  timeSlot: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  assignedDoctor: {
    _id: string;
    name: string;
  };
}

interface Hospital {
  _id: string;
  name: string;
}

interface Department {
  _id: string;
  name: string;
}

type Tab = "Today's Patients" | "All Patients" | "Upcoming Appointments" | "Profile";

const NurseDashboard: FC = () => {
  const [profile, setProfile] = useState<Profile>({
    _id: "",
    name: "",
    email: "",
    departmentId: "",
    hospitalId: "",
    available: false,
    leaveDates: [],
    scheduledDates: [],
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [newLeaveDate, setNewLeaveDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("Today's Patients");
  const [loading, setLoading] = useState<boolean>(true);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);

  useEffect(() => {
    const fetchProfileAndData = async () => {
      try {
        const [profRes, apptsRes, patientsRes] = await Promise.all([
          axios.get<Profile>(`${API_BASE}/profile`, getAuthHeader()),
          axios.get<Appointment[]>(`${API_BASE}/appointments`, getAuthHeader()),
          axios.get<Patient[]>(`${API_BASE}/patients`, getAuthHeader()),
        ]);
        setProfile(profRes.data);
        setAppointments(apptsRes.data);
        setPatients(patientsRes.data);
        
        if (profRes.data.hospitalId) {
          const [hospitalRes, departmentRes] = await Promise.all([
            axios.get<Hospital>(
              `${HOSPITAL_API_BASE}/${profRes.data.hospitalId}`,
              getAuthHeader()
            ),
            axios.get<Department>(
              `${API_BASE}/department/${profRes.data.departmentId}`,
              getAuthHeader()
            ),
          ]);
          setHospital(hospitalRes.data);
          setDepartment(departmentRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndData();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const todayAppointments = appointments.filter(
    (appt) => new Date(appt.date).toDateString() === new Date().toDateString()
  );

  const upcomingAppointments = appointments
    .filter((appt) => new Date(appt.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group patients by doctor
  const patientsByDoctor = patients.reduce((acc, patient) => {
    const doctorId = patient.assignedDoctor._id;
    if (!acc[doctorId]) {
      acc[doctorId] = {
        doctorName: patient.assignedDoctor.name,
        patients: [],
      };
    }
    acc[doctorId].patients.push(patient);
    return acc;
  }, {} as Record<string, { doctorName: string; patients: Patient[] }>);

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
                  onClick={() => setActiveTab("All Patients")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "All Patients"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  All Patients
                </button>
                <button
                  onClick={() => setActiveTab("Upcoming Appointments")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "Upcoming Appointments"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Upcoming Appointments
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

      {/* Welcome Message */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile.name}!
          </h1>
          <div className="mt-2 space-y-1">
            <p className="text-gray-600">
              You are currently working at {hospital?.name}
            </p>
            <p className="text-gray-600">
              Department: {department?.name}
            </p>
            <p className="text-gray-600">
              Email: {profile.email}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <main>
          {activeTab === "Today's Patients" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Today's Appointments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patientName}
                        </h3>
                        <p className="text-sm text-gray-500">{appointment.timeSlot}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Doctor: {appointment.doctorName}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {todayAppointments.length === 0 && (
                  <p className="text-gray-500 col-span-full text-center py-4">
                    No appointments scheduled for today.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "All Patients" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">All Patients</h2>
              <div className="space-y-8">
                {Object.entries(patientsByDoctor).map(([doctorId, { doctorName, patients }]) => (
                  <div key={doctorId} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        Dr. {doctorName}'s Patients
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {patients.map((patient) => (
                        <div key={patient._id} className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {patient.name}
                              </h4>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-500">
                                  Email: {patient.email}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Phone: {patient.phone}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Upcoming Appointments" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(appointment.date).toLocaleDateString("en-IN", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-gray-500">{appointment.timeSlot}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Dr. {appointment.doctorName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {upcomingAppointments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No upcoming appointments scheduled.
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
      </div>
    </div>
  );
};

export default NurseDashboard;
