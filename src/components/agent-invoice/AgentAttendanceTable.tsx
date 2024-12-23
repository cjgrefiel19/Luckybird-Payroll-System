import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import { AttendanceEntry } from "@/lib/types";
import { format } from "date-fns";

interface AgentAttendanceTableProps {
  entries: AttendanceEntry[];
}

export function AgentAttendanceTable({ entries }: AgentAttendanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time In</TableHead>
          <TableHead>Time Out</TableHead>
          <TableHead>Shift Type</TableHead>
          <TableHead className="text-right">Hourly Rate</TableHead>
          <TableHead className="text-right">Daily Earnings</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, index) => (
          <TableRow key={index}>
            <TableCell>{format(new Date(entry.date), "PP")}</TableCell>
            <TableCell>{entry.timeIn}</TableCell>
            <TableCell>{entry.timeOut}</TableCell>
            <TableCell>{entry.shiftType}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(entry.hourlyRate)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(entry.totalHours * entry.hourlyRate)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}