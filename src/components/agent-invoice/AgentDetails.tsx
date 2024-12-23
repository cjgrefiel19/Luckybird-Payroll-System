import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AttendanceEntry, DirectoryEntry } from "@/lib/types";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";

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

  const totalEarnings = filteredEntries.reduce(
    (sum, entry) => sum + (entry.totalHours * entry.hourlyRate),
    0
  );

  const directoryEntry = directoryData.find(entry => 
    entry.name.toLowerCase().includes(agentName.toLowerCase())
  );

  return (
    <Card>
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">{directoryEntry?.name || agentName}</h2>
        {directoryEntry && (
          <p className="text-muted-foreground">{directoryEntry.position}</p>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-6">
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
                    {formatCurrency(entry.totalHours * entry.hourlyRate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}