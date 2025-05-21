import React, { FC, useState } from 'react';
import axios from 'axios';

interface ConsultationProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}

interface Medicine {
  id: string;
  medicineName: string;
  days: number | string;
  timesPerDay: number | string;
  beforeOrAfterFood: string;
}

const LAB_TESTS = [
  'Blood Test',
  'Urine Test',
  'X-Ray',
  'MRI',
  'CT Scan',
  'ECG',
  'Ultrasound',
  'Thyroid Test',
  'Diabetes Test',
  'Liver Function Test'
];

const AddConsultationDialog: FC<ConsultationProps> = ({
  patientId,
  appointmentId,
  onClose,
}) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bp, setBp] = useState('');
  const [temp, setTemp] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      medicineName: '',
      days: '',
      timesPerDay: '',
      beforeOrAfterFood: '',
    },
  ]);
  const [labTests, setLabTests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLabTestToggle = (test: string) => {
    setLabTests(prev => 
      prev.includes(test) 
        ? prev.filter(t => t !== test)
        : [...prev, test]
    );
  };

  const addMedicine = () => {
    setMedicines(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        medicineName: '',
        days: '',
        timesPerDay: '',
        beforeOrAfterFood: '',
      },
    ]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(prev => prev.filter(med => med.id !== id));
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string | number) => {
    setMedicines(prev =>
      prev.map(med =>
        med.id === id ? { ...med, [field]: value } : med
      )
    );
  };

  const handleAddConsultation = async () => {
    setLoading(true);
    try {
      const consultation = {
        patientId,
        appointmentId,
        vitals: {
          height,
          weight,
          bp,
          temp,
        },
        diagnosis,
        prescription: medicines.map(med => ({
          medicineName: med.medicineName,
          days: Number(med.days),
          timesPerDay: Number(med.timesPerDay),
          beforeOrAfterFood: med.beforeOrAfterFood,
        })),
        labTests,
      };

      await axios.post('http://localhost:3000/api/consultations', consultation, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      onClose();
    } catch (error) {
      console.error('Error adding consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add Consultation</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vitals Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Vitals</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Temperature (°F)</label>
                  <input
                    type="text"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Diagnosis Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Diagnosis</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Diagnosis Details</label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            </div>

            {/* Prescription Section */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">Prescription</h3>
                <button
                  onClick={addMedicine}
                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Medicine
                </button>
              </div>
              <div className="space-y-4">
                {medicines.map((medicine, index) => (
                  <div key={medicine.id} className="bg-gray-50 p-4 rounded-lg relative">
                    {medicines.length > 1 && (
                      <button
                        onClick={() => removeMedicine(medicine.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
                        <input
                          type="text"
                          value={medicine.medicineName}
                          onChange={(e) => updateMedicine(medicine.id, 'medicineName', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Days</label>
                        <input
                          type="number"
                          value={medicine.days}
                          onChange={(e) => updateMedicine(medicine.id, 'days', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Times per Day</label>
                        <input
                          type="number"
                          value={medicine.timesPerDay}
                          onChange={(e) => updateMedicine(medicine.id, 'timesPerDay', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Before/After Food</label>
                        <select
                          value={medicine.beforeOrAfterFood}
                          onChange={(e) => updateMedicine(medicine.id, 'beforeOrAfterFood', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          <option value="before">Before Food</option>
                          <option value="after">After Food</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Tests Section */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700">Lab Tests</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {LAB_TESTS.map((test) => (
                  <label
                    key={test}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={labTests.includes(test)}
                      onChange={() => handleLabTestToggle(test)}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{test}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleAddConsultation}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Consultation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddConsultationDialog;
