export interface ErrorResponse {
  message: string;
}

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization?: string;
  departmentId: string;
  department?: string;
  hospitalId: string;
  available: boolean;
  leaveDates: string[];
  scheduledDates: string[];
}

export interface Nurse {
  _id: string;
  name: string;
  email: string;
  departmentId: string;
  department?: {
    _id: string;
    name: string;
  };
  hospitalId: string;
}

export interface Department {
  _id: string;
  name: string;
  description: string;
  hospitalId: string;
}

export interface Hospital {
  _id: string;
  name: string;
}

export interface BaseNewItem {
  name: string;
  email: string;
  password: string;
  departmentId: string;
}

export interface DoctorNewItem extends BaseNewItem {
  specialization: string;
}

export interface NurseNewItem extends BaseNewItem {
  specialization?: string;
}

export interface DepartmentNewItem {
  name: string;
  description: string;
}

export type NewItem = DoctorNewItem | DepartmentNewItem | NurseNewItem;
