import React, { FC, useState } from 'react';
import axios from 'axios';
import { styles } from './DoctorDashboard';

interface ConsultationProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}

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
  const [medicineName, setMedicineName] = useState('');
  const [days, setDays] = useState<number | string>('');
  const [timesPerDay, setTimesPerDay] = useState<number | string>('');
  const [beforeOrAfterFood, setBeforeOrAfterFood] = useState('');
  const [labTests, setLabTests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddConsultation = async () => {
    setLoading(true);
    try {
      const consultation = {
        patientId,
        doctorId: 'doctor_id_placeholder', // Replace with actual doctor ID
        appointmentId,
        vitals: {
          height,
          weight,
          bp,
          temp,
        },
        diagnosis,
        prescription: [
          {
            medicineName,
            days: Number(days),
            timesPerDay: Number(timesPerDay),
            beforeOrAfterFood,
          },
        ],
        labTests,
      };

      await axios.post('http://localhost:3000/api/consultations', consultation, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      onClose(); // Close the dialog after submission
    } catch (error) {
      console.error('Error adding consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          width: '400px',
        }}
      >
        <h3>Add Consultation</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label>Height:</label>
          <input
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Weight:</label>
          <input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Blood Pressure:</label>
          <input
            type="text"
            value={bp}
            onChange={(e) => setBp(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Temperature:</label>
          <input
            type="text"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Diagnosis:</label>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0', height: '80px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Medicine Name:</label>
          <input
            type="text"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Days:</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Times per Day:</label>
          <input
            type="number"
            value={timesPerDay}
            onChange={(e) => setTimesPerDay(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Before or After Food:</label>
          <input
            type="text"
            value={beforeOrAfterFood}
            onChange={(e) => setBeforeOrAfterFood(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
        </div>
        <div>
          <button
            onClick={handleAddConsultation}
            disabled={loading}
            style={{ ...styles.button, background: '#48bb78', color: '#fff' }}
          >
            {loading ? 'Adding...' : 'Add Consultation'}
          </button>
          <button
            onClick={onClose}
            style={{ ...styles.button, background: '#e53e3e', color: '#fff' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddConsultationDialog;
