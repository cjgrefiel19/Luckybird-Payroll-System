import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendanceEntry } from "@/lib/types";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/calculations";

interface AgentDetailsProps {
  agentName: string;
  startDate?: Date;
  endDate?: Date;
}

export function AgentDetails({ agentName, startDate, endDate }: AgentDetailsProps) {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('attendanceEntries');
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      setEntries(parsedEntries);
    }
  }, []);

  const filteredEntries = entries.filter((entry) => {
    if (!startDate || !endDate) return entry.agentName === agentName;
    const entryDate = new Date(entry.date);
    return (
      entry.agentName === agentName &&
      entryDate >= startDate &&
      entryDate <= endDate
    );
  });

  const totalEarnings = filteredEntries.reduce(
    (sum, entry) => sum + entry.dailyEarnings,
    0
  );

  const totalOTHours = filteredEntries
    .filter(entry => entry.shiftType.includes('OT'))
    .reduce((sum, entry) => sum + entry.totalHours, 0);

  const holidayHours = filteredEntries
    .filter(entry => entry.shiftType.includes('Holiday'))
    .reduce((sum, entry) => sum + entry.totalHours, 0);

  const leaveDays = filteredEntries
    .filter(entry => entry.shiftType.includes('Leave'))
    .length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{agentName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            {filteredEntries.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{format(new Date(entry.date), "PP")}</TableCell>
                <TableCell>{entry.timeIn}</TableCell>
                <TableCell>{entry.timeOut}</TableCell>
                <TableCell>{entry.shiftType}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(entry.hourlyRate)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(entry.dailyEarnings)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {totalOTHours.toFixed(2)}h
              </div>
              <p className="text-sm text-muted-foreground">Total OT Hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {holidayHours.toFixed(2)}h
              </div>
              <p className="text-sm text-muted-foreground">Holiday Hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{leaveDays}</div>
              <p className="text-sm text-muted-foreground">Leave Days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatCurrency(totalEarnings)}
              </div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}