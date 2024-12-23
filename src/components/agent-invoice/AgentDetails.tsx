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
import { AttendanceEntry, DirectoryEntry } from "@/lib/types";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/calculations";
import { SHIFT_TYPES } from "@/lib/constants";

interface AgentDetailsProps {
  agentName: string;
  startDate?: Date;
  endDate?: Date;
}

export function AgentDetails({ agentName, startDate, endDate }: AgentDetailsProps) {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [directoryData, setDirectoryData] = useState<DirectoryEntry[]>([]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('attendanceEntries');
    const savedDirectory = localStorage.getItem('directoryData');
    
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      setEntries(parsedEntries);
    }
    
    if (savedDirectory) {
      setDirectoryData(JSON.parse(savedDirectory));
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

  const calculateDailyEarnings = (entry: AttendanceEntry) => {
    const shiftType = SHIFT_TYPES.find(st => st.type === entry.shiftType);
    const multiplier = shiftType?.multiplier || 1;
    return entry.totalHours * entry.hourlyRate * multiplier;
  };

  const totalEarnings = filteredEntries.reduce(
    (sum, entry) => sum + calculateDailyEarnings(entry),
    0
  );

  const totalWorkingHours = filteredEntries.reduce(
    (sum, entry) => sum + entry.totalHours,
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

  const directoryEntry = directoryData.find(entry => entry.name === agentName);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{agentName}</CardTitle>
        {directoryEntry && (
          <p className="text-md text-muted-foreground font-medium">
            {directoryEntry.position}
          </p>
        )}
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
            {filteredEntries.map((entry, index) => {
              const dailyEarnings = calculateDailyEarnings(entry);
              return (
                <TableRow key={index}>
                  <TableCell>{format(new Date(entry.date), "PP")}</TableCell>
                  <TableCell>{entry.timeIn}</TableCell>
                  <TableCell>{entry.timeOut}</TableCell>
                  <TableCell>{entry.shiftType}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(entry.hourlyRate)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(dailyEarnings)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {totalWorkingHours.toFixed(2)}h
              </div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </CardContent>
          </Card>
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