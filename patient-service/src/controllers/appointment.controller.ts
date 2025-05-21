import { Request, Response } from 'express';
import { AppointmentService } from '../services/appointment.service';
import Patient from '../models/patient.model';

export class AppointmentController {
  static async book(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token || !req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const payload = {
        ...req.body,
        patientId: req.user.id
      };

      const appointment = await AppointmentService.bookAppointment(payload, token);
      res.status(201).json(appointment);
    } catch (error: any) {
      console.error('Error booking appointment:', error.message);
      res.status(409).json({ message: 'Booking failed' });
    }
  }

  static async getMyAppointments(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token || !req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const appointments = await AppointmentService.getMyAppointments(req.user.id, token);
      res.status(200).json(appointments);
    } catch (error: any) {
      console.error('Error fetching appointments:', error.message);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  }

  static async getPatientById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const patient = await Patient.findById(id).select('-password'); // Exclude sensitive fields

      if (!patient) {
        res.status(404).json({ message: 'Patient not found' });
        return;
      }

      res.status(200).json(patient);
    } catch (error) {
      console.error('Error fetching patient by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
