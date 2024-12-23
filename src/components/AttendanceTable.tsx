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
  calculateOTRate,
  formatCurrency,
} from "@/lib/calculations";
import { AttendanceEntry } from "@/lib/types";
import { format } from "date-fns";

interface AttendanceTableProps {
  entries: AttendanceEntry[];
}

export function AttendanceTable({ entries }: AttendanceTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Agent Name</TableHead>
            <TableHead>Time In</TableHead>
            <TableHead>Time Out</TableHead>
            <TableHead className="text-right">Total Hours</TableHead>
            <TableHead className="text-right">Hourly Rate</TableHead>
            <TableHead>Shift Type</TableHead>
            <TableHead className="text-right">OT Rate</TableHead>
            <TableHead className="text-right">OT Pay</TableHead>
            <TableHead className="text-right">Daily Earnings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => {
            const otRate = calculateOTRate(entry.hourlyRate, entry.shiftType);
            const dailyEarnings = calculateDailyEarnings(
              entry.hourlyRate,
              entry.totalHours,
              entry.shiftType
            );
            const otPay = entry.shiftType.includes("OT")
              ? otRate * entry.totalHours
              : 0;

            return (
              <TableRow key={index}>
                <TableCell>{format(entry.date, "PP")}</TableCell>
                <TableCell className="font-medium">{entry.agentName}</TableCell>
                <TableCell>{entry.timeIn}</TableCell>
                <TableCell>{entry.timeOut}</TableCell>
                <TableCell className="text-right">
                  {entry.totalHours.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(entry.hourlyRate)}
                </TableCell>
                <TableCell>{entry.shiftType}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(otRate)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(otPay)}</TableCell>
                <TableCell className="text-right">
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