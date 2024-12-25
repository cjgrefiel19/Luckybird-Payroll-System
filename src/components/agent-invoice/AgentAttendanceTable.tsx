import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  calculateDailyEarnings,
  formatCurrency 
} from "@/lib/calculations";
import { AttendanceEntry } from "@/lib/types";
import { format } from "date-fns";

interface AgentAttendanceTableProps {
  entries: AttendanceEntry[];
}

export function AgentAttendanceTable({ entries }: AgentAttendanceTableProps) {
  // Array of pastel colors for alternating rows
  const rowColors = [
    'bg-[#F2FCE2]', // Soft Green
    'bg-[#FEF7CD]', // Soft Yellow
    'bg-[#FEC6A1]', // Soft Orange
    'bg-[#E5DEFF]', // Soft Purple
    'bg-[#FFDEE2]', // Soft Pink
    'bg-[#FDE1D3]', // Soft Peach
    'bg-[#D3E4FD]', // Soft Blue
  ];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Time In</TableHead>
            <TableHead className="text-center">Time Out</TableHead>
            <TableHead className="text-center">Total Hours</TableHead>
            <TableHead className="text-center">Shift Type</TableHead>
            <TableHead className="text-center">Hourly Rate</TableHead>
            <TableHead className="text-center">Daily Earnings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => {
            const dailyEarnings = calculateDailyEarnings(
              entry.hourlyRate,
              entry.totalHours,
              entry.shiftType
            );

            return (
              <TableRow 
                key={index}
                className={`${rowColors[index % rowColors.length]} hover:bg-gray-100/50 transition-colors`}
              >
                <TableCell>{format(new Date(entry.date), "PP")}</TableCell>
                <TableCell className="text-center">{entry.timeIn}</TableCell>
                <TableCell className="text-center">{entry.timeOut}</TableCell>
                <TableCell className="text-center">{entry.totalHours.toFixed(2)}</TableCell>
                <TableCell className="text-center">{entry.shiftType}</TableCell>
                <TableCell className="text-center">
                  {formatCurrency(entry.hourlyRate)}
                </TableCell>
                <TableCell className="text-center">
                  {formatCurrency(dailyEarnings)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}