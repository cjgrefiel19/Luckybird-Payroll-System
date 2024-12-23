import { AttendanceEntry } from "@/lib/types";

export interface NetPaySummaryProps {
  startDate?: Date;
  endDate?: Date;
}

export interface NetPayTableRowProps {
  name: string;
  totalEarnings: number;
  deductions: number;
  reimbursements: number;
  netPay: number;
  onDeductionsChange: (value: string) => void;
  onReimbursementsChange: (value: string) => void;
}

export interface NetPayCalculatorProps {
  entries: AttendanceEntry[];
  startDate?: Date;
  endDate?: Date;
}