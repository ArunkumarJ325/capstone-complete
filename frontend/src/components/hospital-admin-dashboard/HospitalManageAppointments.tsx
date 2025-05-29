import React, { useState, useEffect } from "react";
import axios from "axios";

const timeSlots = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
];

const HospitalAppointmentsManager = () => {
  // --- Scheduling form state ---
  const [activeTab, setActiveTab] = useState<"doctors" | "nurses">("doctors");
  const [items, setItems] = useState<
    { _id: string; name: string; email: string }[]
  >([]);
  const [selectedId, setSelectedId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(timeSlots[0]);

  // --- Schedule-data state ---
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  console.log(scheduleData);

  const token = localStorage.getItem("token") || "";
  const hospitalId = localStorage.getItem("hospitalId") || "";

  // Fetch list of doctors or nurses for the selector
  useEffect(() => {
    const fetchList = async () => {
      const path = activeTab === "doctors" ? "doctor" : "nurse";
      try {
        const res = await axios.get(
          `http://localhost:3000/api/${path}/hospital/${hospitalId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setItems(res.data);
        setSelectedId("");
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err);
      }
    };
    fetchList();
  }, [activeTab, token, hospitalId]);

  // Fetch the “scheduling” data (now returns doctor/nurse objects)
  const fetchScheduleData = async () => {
    setLoadingSchedules(true);
    try {
      const res = await axios.get(
        "http://localhost:3000/api/scheduling/hospital",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(res.data);
      setScheduleData(res.data);
    } catch (err) {
      console.error("Error fetching schedule data:", err);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, [token]);

  // When you schedule, also refresh the list
  const handleSchedule = async () => {
    if (!selectedId || !date) {
      alert(`Please select a ${activeTab.slice(0, -1)} and a date.`);
      return;
    }
    try {
      await axios.post(
        "http://localhost:3000/api/scheduling/assign",
        {
          assignedTo: selectedId,
          role: activeTab === "doctors" ? "DOCTOR" : "NURSE",
          date,
          timeSlot,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Clear form
      setDate("");
      setTimeSlot(timeSlots[0]);
      setSelectedId("");
      // Refresh counts
      fetchScheduleData();
      alert("Appointment scheduled successfully");
    } catch (err) {
      console.error("Error scheduling appointment:", err);
      alert("Failed to schedule appointment");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Scheduling Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Schedule New Appointment</h2>
        <div className="flex space-x-4 border-b mb-6">
          {["doctors", "nurses"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-2 px-4 font-medium ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Select {activeTab.slice(0, -1)}
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
          >
            <option value="">-- Select --</option>
            {items.map((it) => (
              <option key={it._id} value={it._id}>
                {it.name} ({it.email})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Time Slot
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleSchedule}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
        >
          Schedule Appointment
        </button>
      </div>

      {/* Updated “Appointments” List (now doctor/nurse objects) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Scheduled Appointments</h2>

        {loadingSchedules ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 animate-pulse">
              Loading schedules...
            </div>
          </div>
        ) : scheduleData.length === 0 ? (
          <p className="text-gray-600 text-center py-12">No schedules found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scheduleData.map((appt) => (
              <div
                key={appt._id}
                className="bg-gray-50 rounded-lg shadow-sm p-5 hover:shadow-md transition"
              >
                {/* Header: Role badge & Date */}
                <div className="flex justify-between items-center mb-3">
                  <span
                    className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                      appt.role === "DOCTOR"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {appt.role}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(appt.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Assigned To */}
                <h3 className="text-lg font-medium text-gray-800">
                  {appt.assignedTo.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {appt.assignedTo.email}
                </p>

                {/* Specialization */}
                <p className="text-gray-700 mb-2">
                  <strong>Specialization:</strong>{" "}
                  <span className="font-medium">
                    {appt.assignedTo.specialization}
                  </span>
                </p>

                {/* Time Slot */}
                <p className="text-gray-700">
                  <strong>Time:</strong>{" "}
                  <span className="font-medium">{appt.timeSlot}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalAppointmentsManager;
