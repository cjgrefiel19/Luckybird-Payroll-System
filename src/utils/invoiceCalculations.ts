import { AttendanceEntry } from "@/lib/types";

export const calculateTotalHours = (entries: AttendanceEntry[]) => {
  return entries.reduce((sum, entry) => sum + entry.totalHours, 0);
};

export const calculateOTHours = (entries: AttendanceEntry[]) => {
  return entries
    .filter(entry => entry.shiftType.includes('OT'))
    .reduce((sum, entry) => sum + entry.totalHours, 0);
};

export const calculateHolidayHours = (entries: AttendanceEntry[]) => {
  return entries
    .filter(entry => 
      entry.shiftType.includes('Holiday') || 
      entry.shiftType.includes('Special')
    )
    .reduce((sum, entry) => sum + entry.totalHours, 0);
};

export const calculateLeaveDays = (entries: AttendanceEntry[]) => {
  return entries
    .filter(entry => entry.shiftType.includes('Leave'))
    .length;
};

export const calculateDailyEarnings = (
  hourlyRate: number,
  totalHours: number,
  shiftType: string
) => {
  let multiplier = 1;
  if (shiftType === 'Regular OT') multiplier = 1.25;
  else if (shiftType === 'Rest Day OT') multiplier = 1.30;
  else if (shiftType === 'Special Holidays') multiplier = 1.30;
  else if (shiftType === 'Regular Holidays') multiplier = 2.00;
  
  return totalHours * hourlyRate * multiplier;
};

export const calculateTotalEarnings = (entries: AttendanceEntry[]) => {
  return entries.reduce(
    (sum, entry) => sum + calculateDailyEarnings(
      entry.hourlyRate,
      entry.totalHours,
      entry.shiftType
    ),
    0
  );
};