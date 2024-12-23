export interface TeamMember {
  name: string;
  timeIn: string;
  timeOut: string;
  workdays: string;
  restDays: string;
  monthlyRate: number;
  hourlyRate: number;
}

export interface AttendanceEntry {
  date: Date;
  agentName: string;
  timeIn: string;
  timeOut: string;
  totalHours: number;
  hourlyRate: number;
  shiftType: ShiftType;
  otRate: number;
  otPay: number;
  dailyEarnings: number;
}

export type ShiftType = 
  | "Regular OT"
  | "Rest Day OT"
  | "Special Holidays"
  | "Regular Holidays"
  | "Regular Shift"
  | "Paid Leave"
  | "Paid SL"
  | "UnPaid Leave"
  | "UnPaid SL";

export interface PayPeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface NetPayData {
  agentName: string;
  deductions: number;
  reimbursements: number;
}