import { AttendanceEntry } from "@/lib/types";
import { TEAM_MEMBERS, SHIFT_TYPES } from "@/lib/constants";

export const calculateTotalEarnings = (
  memberEntries: AttendanceEntry[],
  agentName: string
) => {
  const regularHours = memberEntries
    .filter((entry) => entry.shiftType === "Regular Shift")
    .reduce((sum, entry) => sum + entry.totalHours, 0);

  const otHours = memberEntries
    .filter((entry) =>
      ["Regular OT", "Rest Day OT", "Special Holidays", "Regular Holidays"].includes(
        entry.shiftType
      )
    )
    .reduce((sum, entry) => {
      const multiplier = SHIFT_TYPES.find(st => st.type === entry.shiftType)?.multiplier || 1;
      return sum + (entry.totalHours * entry.hourlyRate * multiplier);
    }, 0);

  const paidLeaves = memberEntries.filter((entry) =>
    ["Paid SL", "Paid Leave"].includes(entry.shiftType)
  ).length;

  const member = TEAM_MEMBERS.find(m => m.name === agentName);
  if (!member) return 0;

  const regularEarnings = regularHours * member.hourlyRate;
  const paidLeaveEarnings = paidLeaves * 8 * member.hourlyRate;

  return regularEarnings + otHours + paidLeaveEarnings;
};

export const filterEntriesByDateRange = (
  entries: AttendanceEntry[],
  startDate?: Date,
  endDate?: Date
) => {
  if (!startDate || !endDate) return entries;
  return entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
};