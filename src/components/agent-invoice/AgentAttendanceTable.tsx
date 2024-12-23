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
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableRow key={index}>
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