import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const ConsultationReport = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  console.log(patientId);

  useEffect(() => {
    // Fetch the consultation report by appointmentId
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/consultations/${patientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setReport(response.data);
      } catch (error) {
        console.error("Error fetching consultation report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [patientId]);

  if (loading) return <p>Loading report...</p>;
  if (!report) return <p>No report found.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Consultation Report</h2>
      <div>
        <h3>Vitals:</h3>
        <p><strong>Height:</strong> {report.vitals?.height}</p>
        <p><strong>Weight:</strong> {report.vitals?.weight}</p>
        <p><strong>Blood Pressure:</strong> {report.vitals?.bp}</p>
        <p><strong>Temperature:</strong> {report.vitals?.temp}</p>
      </div>

      <div>
        <h3>Diagnosis:</h3>
        <p>{report.diagnosis}</p>
      </div>

      <div>
        <h3>Prescriptions:</h3>
        <ul>
          {report.prescription?.map((med: any, index: number) => (
            <li key={index}>
              <p><strong>Medicine:</strong> {med.medicineName}</p>
              <p><strong>Days:</strong> {med.days}</p>
              <p><strong>Times per Day:</strong> {med.timesPerDay}</p>
              <p><strong>Before or After Food:</strong> {med.beforeOrAfterFood}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Lab Tests:</h3>
        <ul>
          {report.labTests?.map((test: any, index: number) => (
            <li key={index}>
              <p>{test}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConsultationReport;
