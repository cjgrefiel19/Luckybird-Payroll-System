import { SHIFT_TYPES } from "./constants";
import { ShiftType } from "./types";

export function calculateTotalHours(timeIn: string, timeOut: string): number {
  const [inHour, inMinute, inPeriod] = timeIn.match(/(\d+):(\d+) (AM|PM)/)?.slice(1) || [];
  const [outHour, outMinute, outPeriod] = timeOut.match(/(\d+):(\d+) (AM|PM)/)?.slice(1) || [];

  let startHour = parseInt(inHour);
  let endHour = parseInt(outHour);

  // Convert to 24-hour format
  if (inPeriod === "PM" && startHour !== 12) startHour += 12;
  if (inPeriod === "AM" && startHour === 12) startHour = 0;
  if (outPeriod === "PM" && endHour !== 12) endHour += 12;
  if (outPeriod === "AM" && endHour === 12) endHour = 0;

  // Handle overnight shifts
  if (endHour < startHour) {
    endHour += 24;
  }

  const hourDiff = endHour - startHour;
  const minuteDiff = (parseInt(outMinute) - parseInt(inMinute)) / 60;

  return hourDiff + minuteDiff;
}

export function calculateDailyEarnings(
  hourlyRate: number,
  totalHours: number,
  shiftType: ShiftType
): number {
  const multiplier = SHIFT_TYPES.find((st) => st.type === shiftType)?.multiplier || 1;
  return hourlyRate * totalHours * multiplier;
}

export function calculateOTRate(hourlyRate: number, shiftType: ShiftType): number {
  const multiplier = SHIFT_TYPES.find((st) => st.type === shiftType)?.multiplier || 1;
  return hourlyRate * multiplier;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}