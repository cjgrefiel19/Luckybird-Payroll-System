import { ShiftType, TeamMember } from "./types";

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Cherrie Ferrer",
    timeIn: "11:00 PM",
    timeOut: "7:00 AM",
    workdays: "Monday - Friday",
    restDays: "Saturday - Sunday",
    monthlyRate: 860,
    hourlyRate: 5.38,
  },
  {
    name: "Chrisjie Grefiel",
    timeIn: "11:00 PM",
    timeOut: "7:00 AM",
    workdays: "Monday - Friday",
    restDays: "Saturday - Sunday",
    monthlyRate: 1400,
    hourlyRate: 8.75,
  },
  {
    name: "Jobelle Fortuna",
    timeIn: "9:00 PM",
    timeOut: "1:00 AM",
    workdays: "Monday - Friday",
    restDays: "Saturday - Sunday",
    monthlyRate: 800,
    hourlyRate: 5.00,
  },
  {
    name: "Mhel Malit",
    timeIn: "8:00 PM",
    timeOut: "5:00 AM",
    workdays: "Monday - Friday",
    restDays: "Saturday - Sunday",
    monthlyRate: 750,
    hourlyRate: 4.69,
  },
  {
    name: "Gilbert Condino",
    timeIn: "5:00 AM",
    timeOut: "1:00 PM",
    workdays: "Tuesday - Saturday",
    restDays: "Sunday - Monday",
    monthlyRate: 900,
    hourlyRate: 5.63,
  },
];

export const SHIFT_TYPES: { type: ShiftType; multiplier: number }[] = [
  { type: "Regular OT", multiplier: 1.25 },
  { type: "Rest Day OT", multiplier: 1.30 },
  { type: "Special Holidays", multiplier: 1.30 },
  { type: "Regular Holidays", multiplier: 2.00 },
  { type: "Regular Shift", multiplier: 1.00 },
  { type: "Paid Leave", multiplier: 1.00 },
  { type: "Paid SL", multiplier: 1.00 },
  { type: "UnPaid Leave", multiplier: 0 },
  { type: "UnPaid SL", multiplier: 0 },
];