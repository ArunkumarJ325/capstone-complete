import { Request, Response } from 'express';
import { ScheduleService } from '../services/schedule.service';
import axios from 'axios';
// Create a custom interface that extends the Express Request
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    hospitalId?: string;  // Optional to match the optional chaining in your token signing
  };
}

export class ScheduleController {
  // Assign a schedule to a doctor/nurse/staff
  static async assignSchedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { assignedTo, role, date, timeSlot } = req.body;

      if (!req.user?.hospitalId) {
        res.status(400).json({ message: 'Hospital ID missing from token' });
        return;
      }

      // Check if person is on leave, and get available dates if needed
      const { isOnLeave, availableDates } = await ScheduleService.checkIfOnLeave(
        assignedTo,
        role,
        new Date(date)
      );

      if (isOnLeave) {
        res.status(400).json({
          message: `${role} is on leave on ${date}`,
          availableDates,
        });
        return;
      }

      // Proceed to assign schedule
      const schedule = await ScheduleService.assignSchedule({
        hospitalId: req.user.hospitalId,
        assignedTo,
        role,
        date,
        timeSlot,
      });
      const token = req.headers.authorization?.split(' ')[1];
      try {
        // If the role is 'doctor', assign the schedule in the doctor's service
        if (role === 'DOCTOR') {
          await axios.patch(
            `http://localhost:3000/api/doctor/${assignedTo}/schedule`,
            { scheduleId: schedule._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        // If the role is 'nurse', assign the schedule in the nurse's service
        if (role === 'NURSE') {
          await axios.patch(
            `http://localhost:3000/api/nurse/${assignedTo}/schedule`,  // Assuming the Nurse service runs on port 4000
            { scheduleId: schedule._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (upstreamErr) {
        console.error('Doctor‐service patch failed:', upstreamErr);
        // Option A: roll back local schedule, or
        // Option B: still return 201 but flag an issue
      }
      res.status(201).json(schedule);

    } catch (error: any) {
      console.error('Error assigning schedule:', error);

      // Check for our custom duplication message
      if (error.message === 'Schedule already exists for this person on the selected date and time slot.') {
        res.status(400).json({ message: error.message });
        return;
      }

      // For other unexpected errors
      res.status(500).json({ message: 'Internal server error' });
    }

  }

  // Get all schedules for the current hospital
  static async getSchedulesByHospital(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hospitalId = req.user?.hospitalId;
      if (!hospitalId) {
        res.status(400).json({ message: 'Hospital ID missing from token' });
        return;
      }

      // 1️⃣ Fetch plain JS schedules
      const schedules = await ScheduleService.getSchedulesByHospital(hospitalId);

      // Base URLs for your microservices
      const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
      const authHeader = { Authorization: req.headers.authorization || '' };

      // 2️⃣ Enrich each schedule
      const enriched = await Promise.all(
        schedules.map(async (sch) => {
          let detail: { name: string; email: string; specialization?: string; department?: string } = {
            name: 'Unknown',
            email: ''
          };

          try {
            // Choose service based on role
            const path =
              sch.role === 'DOCTOR'
                ? `/api/doctor/${sch.assignedTo}`
                : sch.role === 'NURSE'
                  ? `/api/nurse/${sch.assignedTo}`
                  : null;

            if (path) {
              const { data }: any = await axios.get(`${API_BASE}${path}`, { headers: authHeader });
              detail = {
                name: data.name,
                email: data.email,
                specialization: data.specialization,
                department: data.department
              };
            }
          } catch (err) {
            console.error(`Failed to fetch ${sch.role.toLowerCase()} ${sch.assignedTo}:`, err);
          }

          // Return only the fields you need
          return {
            _id: sch._id,
            hospitalId: sch.hospitalId,
            role: sch.role,
            date: sch.date,
            timeSlot: sch.timeSlot,
            createdAt: sch.createdAt,
            updatedAt: sch.updatedAt,
            assignedTo: {
              id: sch.assignedTo,
              ...detail
            }
          };
        })
      );

      res.status(200).json(enriched);
    } catch (error) {
      console.error('Error fetching schedules by hospital:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  // Get all schedules for a specific user (doctor/nurse/staff)
  static async getSchedulesForUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { assignedTo } = req.params;
      console.log("reached get schedules for user")

      const schedules = await ScheduleService.getSchedulesForUser(assignedTo);
      if (!schedules || schedules.length === 0) {
        res.status(404).json({ message: 'No schedules found for this user' });
        return;
      }

      res.status(200).json(schedules);
    } catch (error) {
      console.error('Error fetching schedules for user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}