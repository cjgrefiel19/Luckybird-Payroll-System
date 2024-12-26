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
  let multiplier = 1;

  // Set multiplier based on shift type
  switch (shiftType) {
    case "Regular OT":
      multiplier = 1.25; // 25% additional
      break;
    case "Rest Day OT":
      multiplier = 1.30; // 30% additional
      break;
    case "Special Holidays":
      multiplier = 1.30; // 30% additional
      break;
    case "Regular Holidays":
      multiplier = 2.00; // Double pay
      break;
    case "Regular Shift":
    default:
      multiplier = 1.00; // Regular rate
  }

  return hourlyRate * totalHours * multiplier;
}

export function calculateOTRate(hourlyRate: number, shiftType: ShiftType): number {
  let multiplier = 1;

  // Set OT rate multiplier based on shift type
  switch (shiftType) {
    case "Regular OT":
      multiplier = 1.25;
      break;
    case "Rest Day OT":
      multiplier = 1.30;
      break;
    case "Special Holidays":
      multiplier = 1.30;
      break;
    case "Regular Holidays":
      multiplier = 2.00;
      break;
    default:
      multiplier = 1.00;
  }

  return hourlyRate * multiplier;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}