import { AttendanceEntry } from "@/lib/types";
import { TEAM_MEMBERS, SHIFT_TYPES } from "@/lib/constants";

export const calculateTotalEarnings = (
  memberEntries: AttendanceEntry[],
  agentName: string
) => {
  const member = TEAM_MEMBERS.find(m => m.name === agentName);
  if (!member) return 0;

  return memberEntries.reduce((total, entry) => {
    let multiplier = 1;
    const shiftType = SHIFT_TYPES.find(st => st.type === entry.shiftType);
    
    if (shiftType) {
      multiplier = shiftType.multiplier;
    }

    return total + (entry.totalHours * entry.hourlyRate * multiplier);
  }, 0);
};

export const filterEntriesByDateRange = (
  entries: AttendanceEntry[],
  startDate?: Date,
  endDate?: Date
): AttendanceEntry[] => {
  if (!startDate || !endDate) return [];
  
  return entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
};