import React, { FC, useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import axios, { AxiosRequestConfig } from "axios";
import AddConsultationDialog from "./AddConsultationDialog";

const API_BASE = "http://localhost:3000/api/doctor";
const HOSPITAL_API_BASE = "http://localhost:3000/api/auth/hospitals";
const APPOINTMENT_API_BASE = "http://localhost:3000/api/appointment";
const SCHEDULING_API_BASE = "http://localhost:3000/api/scheduling";

interface Profile {
  _id: string;
  name: string;
  available: boolean;
  leaveDates: string[];
  hospitalId: string;
}

interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  hospitalId: string;
  appointmentDate: string;
  status: string;
  createdAt: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
}

interface Hospital {
  _id: string;
  name: string;
}

interface HospitalSchedule {
  _id: string;
  hospitalId: string;
  assignedTo: string;
  role: string;
  date: string;
  timeSlot: string;
  createdAt: string;
  updatedAt: string;
}

type Tab = "Today's Patients" | "My Schedule" | "Profile";

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">{this.state.error?.message || "An unexpected error occurred"}</p>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const DoctorDashboard: FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schedule, setSchedule] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [newLeaveDate, setNewLeaveDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("Today's Patients");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [showConsultationDialog, setShowConsultationDialog] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>("");
  const [hospitalSchedules, setHospitalSchedules] = useState<HospitalSchedule[]>([]);

  useEffect(() => {
    const fetchProfileAndSchedule = async () => {
      try {
        console.log('Starting to fetch data...');
        setError(null);
        
        // First fetch the profile
        console.log('Fetching profile...');
        const profRes = await axios.get<Profile>(`${API_BASE}/profile`, getAuthHeader());
        console.log('Profile response:', profRes.data);
        
        if (!profRes.data || !profRes.data._id) {
          throw new Error('Invalid profile data received');
        }
        setProfile(profRes.data);

        // Fetch hospital schedules
        console.log('Fetching hospital schedules...');
        const schedulesRes = await axios.get<HospitalSchedule[]>(
          `${SCHEDULING_API_BASE}/user/${profRes.data._id}`,
          getAuthHeader()
        );
        console.log('Hospital schedules response:', schedulesRes.data);
        setHospitalSchedules(schedulesRes.data || []);

        // Then fetch appointments using the doctor's ID
        console.log('Fetching appointments...');
        const scheduleRes = await axios.get<Appointment[]>(
          `${APPOINTMENT_API_BASE}/appointments/doctor/${profRes.data._id}`,
          getAuthHeader()
        );
        console.log('Appointments response:', scheduleRes.data);
        setSchedule(scheduleRes.data || []);
        
        // Fetch patients for the doctor
        console.log('Fetching patients...');
        const patientsRes = await axios.get<Patient[]>(
          `${API_BASE}/${profRes.data._id}/patients`,
          getAuthHeader()
        );
        console.log('Patients response:', patientsRes.data);
        setPatients(patientsRes.data || []);
        
        if (profRes.data.hospitalId) {
          console.log('Fetching hospital...');
          const hospitalRes = await axios.get<Hospital>(
            `${HOSPITAL_API_BASE}/${profRes.data.hospitalId}`,
            getAuthHeader()
          );
          console.log('Hospital response:', hospitalRes.data);
          setHospital(hospitalRes.data);
        }
      } catch (err) {
        console.error('Error in fetchProfileAndSchedule:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndSchedule();
  }, []);

  const getAuthHeader = (): AxiosRequestConfig => {
    const token = localStorage.getItem("token");
    console.log('Auth token:', token ? 'Present' : 'Missing');
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
    };
  };

  const toggleAvailability = async (): Promise<void> => {
    if (!profile) return;
    try {
      const res = await axios.patch<Profile>(
        `${API_BASE}/availability/${profile._id}`,
        { available: !profile.available },
        getAuthHeader()
      );
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLeave = async (): Promise<void> => {
    if (!newLeaveDate || !profile) return;
    try {
      const res = await axios.patch<Profile>(
        `${API_BASE}/leave/add`,
        { leaveDates: newLeaveDate },
        getAuthHeader()
      );
      setProfile(res.data);
      setNewLeaveDate("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveLeave = async (date: string): Promise<void> => {
    if (!profile) return;
    try {
      const res = await axios.patch<Profile>(
        `${API_BASE}/leave/remove`,
        { leaveDate: date },
        getAuthHeader()
      );
      setProfile(res.data);
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

  const getGenderEmoji = (gender?: string) => {
    if (!gender) return '👤'; // Default avatar if gender is not specified
    return gender.toLowerCase() === 'male' ? '♂️' : '♀️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="text-blue-600 font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.log('No profile found, redirecting to login...');
    handleLogout();
    return null;
  }

  const todayAppointments = schedule.filter((appt) => {
    const appointmentDate = new Date(appt.appointmentDate);
    const today = new Date();
    
    // Format both dates to YYYY-MM-DD for comparison
    const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    
    console.log('Comparing appointment dates:', {
      appointmentDate: appointmentDateStr,
      today: todayStr,
      matches: appointmentDateStr === todayStr,
      appointment: appt
    });
    
    return appointmentDateStr === todayStr;
  });

  // Sort appointments by time
  const sortedTodayAppointments = [...todayAppointments].sort((a, b) => {
    const timeA = new Date(a.appointmentDate).getTime();
    const timeB = new Date(b.appointmentDate).getTime();
    return timeA - timeB;
  });

  // Group appointments by time slots
  const groupedAppointments = sortedTodayAppointments.reduce((groups, appointment) => {
    const appointmentTime = new Date(appointment.appointmentDate);
    const timeSlot = appointmentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (!groups[timeSlot]) {
      groups[timeSlot] = [];
    }
    groups[timeSlot].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏥</span>
                <h2 className="text-xl font-bold text-blue-600">{hospital?.name}</h2>
              </div>
              <div className="hidden md:flex space-x-4">
                {["Today's Patients", "My Schedule", "Profile"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as Tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      activeTab === tab
                        ? "bg-blue-100 text-blue-700 shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 font-medium">{profile.name}</span>
                <button
                  onClick={toggleAvailability}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    profile.available
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {profile.available ? "Available" : "Unavailable"}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "Today's Patients" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Today's Appointments</h2>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {Object.keys(groupedAppointments).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedAppointments).map(([timeSlot, appointments]) => (
                  <div key={timeSlot} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                      <h3 className="text-lg font-semibold text-blue-700">{timeSlot}</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {appointments.map((appointment) => {
                        // Find the patient details
                        const patient = patients.find(p => p._id === appointment.patientId);
                        console.log('Appointment details:', { 
                          appointment,
                          patient,
                          appointmentDate: new Date(appointment.appointmentDate).toISOString()
                        });
                        
                        return (
                          <div
                            key={appointment._id}
                            className="p-6 hover:bg-gray-50 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-xl">{getGenderEmoji(patient?.gender)}</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-lg font-medium text-gray-900">
                                    {patient ? patient.name : 'Patient not found'}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {patient ? patient.email : 'Email not available'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {patient ? patient.phone : 'Phone not available'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Appointment Time: {new Date(appointment.appointmentDate).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  appointment.status === 'COMPLETED' 
                                    ? 'bg-green-100 text-green-800'
                                    : appointment.status === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {appointment.status}
                                </span>
                                <button
                                  onClick={() => handleOpenConsultationDialog(appointment.patientId, appointment._id)}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-md flex items-center space-x-2"
                                >
                                  <span>Add Consultation</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <p className="text-gray-500 text-lg">No appointments scheduled for today.</p>
                  <p className="text-gray-400 text-sm">Your schedule is clear for today.</p>
                </div>
              </div>
            )}

            <h2 className="text-3xl font-bold text-gray-900 mt-12">All Patients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map((patient) => (
                <div
                  key={patient._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xl">{getGenderEmoji(patient.gender)}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-gray-500">Patient ID: {patient._id}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {patients.length === 0 && (
                <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                    <p className="text-gray-500 text-lg">No patients found.</p>
                    <p className="text-gray-400 text-sm">There are no patients in your list yet.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "My Schedule" && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-900">My Schedule</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="divide-y divide-gray-200">
                {schedule.map((appointment) => {
                  const appointmentDate = new Date(appointment.appointmentDate);
                  const patient = patients.find(p => p._id === appointment.patientId);
                  return (
                    <div
                      key={appointment._id}
                      className="p-6 hover:bg-gray-50 transition-all duration-200 transform hover:translate-x-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-lg font-medium text-gray-900">
                            {appointmentDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointmentDate.toLocaleTimeString("en-US", {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-medium text-gray-900">
                            {patient ? patient.name : 'Patient not found'}
                          </span>
                          <span className={`ml-3 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {schedule.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 text-lg">No schedule found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Profile" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Leave Management Section */}
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Leave Management</h2>
                <div className="space-y-6">
                  <div className="flex space-x-4">
                    <input
                      type="date"
                      value={newLeaveDate}
                      onChange={(e) => setNewLeaveDate(e.target.value)}
                      className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    />
                    <button
                      onClick={handleAddLeave}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      Add Leave
                    </button>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-medium text-gray-900 mb-4">Leave Dates</h3>
                    <div className="space-y-3">
                      {profile.leaveDates.map((date) => (
                        <div
                          key={date}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                        >
                          <span className="text-gray-700 font-medium">
                            {new Date(date).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleRemoveLeave(date)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {profile.leaveDates.length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <p className="text-gray-500 text-lg">No leave dates added.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hospital Schedule Section */}
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Schedule</h2>
                <div className="space-y-6">
                  {(() => {
                    // Sort schedules by date
                    const sortedSchedules = [...hospitalSchedules].sort((a, b) => 
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                    );

                    // Filter out past schedules
                    const upcomingSchedules = sortedSchedules.filter(schedule => 
                      new Date(schedule.date) >= new Date()
                    );

                    if (upcomingSchedules.length === 0) {
                      return (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-2xl">📅</span>
                            </div>
                            <p className="text-gray-500 text-lg">No upcoming schedules</p>
                            <p className="text-gray-400 text-sm">You don't have any scheduled shifts coming up.</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {upcomingSchedules.map((schedule) => {
                          const scheduleDate = new Date(schedule.date);
                          const isToday = scheduleDate.toDateString() === new Date().toDateString();
                          
                          return (
                            <div
                              key={schedule._id}
                              className={`p-4 rounded-lg transition-all duration-200 ${
                                isToday 
                                  ? 'bg-blue-50 border border-blue-200' 
                                  : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <p className={`text-lg font-medium ${
                                      isToday ? 'text-blue-700' : 'text-gray-900'
                                    }`}>
                                      {scheduleDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </p>
                                    {isToday && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        Today
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-gray-600">
                                      {schedule.timeSlot}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    {schedule.role}
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    {scheduleDate.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
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

// Wrap the export with ErrorBoundary
export default function DoctorDashboardWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <DoctorDashboard />
    </ErrorBoundary>
  );
}

// Add these styles to your global CSS file
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
`;

